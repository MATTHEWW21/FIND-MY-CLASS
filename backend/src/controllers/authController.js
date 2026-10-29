const bcrypt = require('bcrypt'); // si falla en Docker, cambia a require('bcryptjs') (misma API)
const { DIAS_MAXIMO } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');

const ROLES_REGISTRABLES = ['estudiante', 'colaborador'];
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_MENSAJE =
    'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial';
const CODIGO_MINUTOS = 15;
const MAX_INTENTOS = 5;

// Dominio institucional permitido para registrarse (ej. edu.uag.mx).
// Si la variable está vacía, no se valida el dominio.
const DOMINIO_INSTITUCIONAL = (process.env.DOMINIO_INSTITUCIONAL || '').trim().toLowerCase();

/* ---------- helpers ---------- */

const normalizar = (correo) => String(correo || '').trim().toLowerCase();
const hashCodigo = (codigo) => crypto.createHash('sha256').update(String(codigo)).digest('hex');
const generarCodigo = () => crypto.randomInt(100000, 1000000).toString();

const firmarToken = (payload, expiresIn) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

const MAX_SESIONES = 10;          // sesiones abiertas a la vez por persona (la mas vieja se cierra)
const COOLDOWN_CODIGO_SEG = 60;   // entre un correo con codigo y el siguiente para la misma cuenta

// Nombre corto del dispositivo, a partir del navegador (solo para que la persona reconozca sus sesiones)
function nombreDispositivo(ua) {
  const s = String(ua || '');
  const so = /iPhone|iPad/.test(s) ? 'iPhone/iPad' : /Android/.test(s) ? 'Android' : /Windows/.test(s) ? 'Windows'
    : /Mac OS X|Macintosh/.test(s) ? 'Mac' : /Linux/.test(s) ? 'Linux' : 'Dispositivo';
  const nav = /Edg\//.test(s) ? 'Edge' : /OPR\/|Opera/.test(s) ? 'Opera' : /Firefox/.test(s) ? 'Firefox'
    : /Chrome|CriOS/.test(s) ? 'Chrome' : /Safari/.test(s) ? 'Safari' : 'navegador';
  return `${so} · ${nav}`;
}

// Abre una sesion nueva (queda registrada y se puede cerrar) y devuelve su token
async function abrirSesion(req, u) {
  await pool.query(
    "DELETE FROM sesiones WHERE usuario_id = $1 AND (revocada OR ultimo_uso < NOW() - INTERVAL '7 days' OR creado_en < NOW() - INTERVAL '90 days')",
    [u.id]);
  await pool.query(
    `DELETE FROM sesiones WHERE id IN (SELECT id FROM sesiones WHERE usuario_id = $1 ORDER BY ultimo_uso DESC OFFSET $2)`,
    [u.id, MAX_SESIONES - 1]);
  const { rows } = await pool.query(
    'INSERT INTO sesiones (usuario_id, dispositivo) VALUES ($1, $2) RETURNING id',
    [u.id, nombreDispositivo(req.headers['user-agent'])]);
  return firmarToken({ id: u.id, rol: u.rol, sid: rows[0].id }, DIAS_MAXIMO + 'd');
}

// Cierra todas las sesiones de una persona (menos una, si se indica)
const cerrarSesiones = (usuarioId, exceptoSid = null) =>
  pool.query('UPDATE sesiones SET revocada = TRUE WHERE usuario_id = $1 AND NOT revocada AND ($2::uuid IS NULL OR id <> $2::uuid)', [usuarioId, exceptoSid]);

const usuarioPublico = (u) => ({
  id: u.id,
  nombre: u.nombre,
  apellido: u.apellido,
  correo: u.correo,
  rol: u.rol,
  vista_preferida: u.vista_preferida,
  onboarding_completado: u.onboarding_completado,
  necesita_rutas_accesibles: u.necesita_rutas_accesibles,
  edificio_habitual_id: u.edificio_habitual_id,
  carrera_id: u.carrera_id,
  espacio_trabajo: u.espacio_trabajo,
  estancia_id: u.estancia_id,
  tutorial_visto: !!u.tutorial_visto,
  contacto_emergencia_nombre: u.contacto_emergencia_nombre || null,
  contacto_emergencia_telefono: u.contacto_emergencia_telefono || null,
});

// SOLO para desarrollo: con DEV_MOSTRAR_CODIGO=true la API devuelve el código en la
// respuesta (para probar desde el celular sin correo). En producción debe estar apagado.
const modoDev = () => process.env.DEV_MOSTRAR_CODIGO === 'true' && process.env.NODE_ENV !== 'production';
const extraDev = (codigo) => (modoDev() ? { codigo_dev: codigo } : {});

async function crearYEnviarCodigo(usuarioId, correo, tipo) {
  const codigo = generarCodigo();

  // Invalida códigos anteriores del mismo tipo
  await pool.query(
      'UPDATE codigos_verificacion SET usado = TRUE WHERE usuario_id = $1 AND tipo = $2 AND usado = FALSE',
      [usuarioId, tipo]
  );
  await pool.query(
      `INSERT INTO codigos_verificacion (usuario_id, tipo, codigo_hash, expira_en)
       VALUES ($1, $2, $3, NOW() + ($4 || ' minutes')::interval)`,
      [usuarioId, tipo, hashCodigo(codigo), CODIGO_MINUTOS]
  );

  // TODO: reemplazar por nodemailer / servicio de correo.
  if (modoDev()) {
    console.log(`[DEV] Código ${tipo} para ${correo}: ${codigo}`);
  }
  return codigo;
}

// Hubo un correo con codigo de verificacion para esta cuenta en el ultimo minuto?
async function codigoReciente(usuarioId) {
  const r = await pool.query(
    "SELECT 1 FROM codigos_verificacion WHERE usuario_id = $1 AND tipo = 'verificacion' AND creado_en > NOW() - ($2 || ' seconds')::interval LIMIT 1",
    [usuarioId, COOLDOWN_CODIGO_SEG]);
  return r.rowCount > 0;
}

// Devuelve el usuario_id si el código es válido; null si no
async function consumirCodigo(correo, codigo, tipo) {
  const { rows } = await pool.query(
      `SELECT c.id, c.codigo_hash, c.intentos, c.usuario_id
       FROM codigos_verificacion c
              JOIN usuarios u ON u.id = c.usuario_id
       WHERE LOWER(u.correo) = $1 AND c.tipo = $2
         AND c.usado = FALSE AND c.expira_en > NOW()
       ORDER BY c.creado_en DESC LIMIT 1`,
      [correo, tipo]
  );
  const reg = rows[0];
  if (!reg || reg.intentos >= MAX_INTENTOS) return null;

  if (reg.codigo_hash !== hashCodigo(codigo)) {
    await pool.query('UPDATE codigos_verificacion SET intentos = intentos + 1 WHERE id = $1', [reg.id]);
    return null;
  }
  await pool.query('UPDATE codigos_verificacion SET usado = TRUE WHERE id = $1', [reg.id]);
  return reg.usuario_id;
}

const errorServidor = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

/* ---------- controladores ---------- */

async function registro(req, res) {
  try {
    const nombre = String(req.body.nombre || '').trim();
    const apellido = String(req.body.apellido || '').trim();
    const numero_registro = String(req.body.numero_registro || '').trim();
    const correo = normalizar(req.body.correo);
    const { password, rol } = req.body;

    if (!nombre || !apellido || !numero_registro || !correo || !password || !rol) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    if (!ROLES_REGISTRABLES.includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido para registro' });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ error: PASSWORD_MENSAJE });
    }
    if (DOMINIO_INSTITUCIONAL && !correo.endsWith('@' + DOMINIO_INSTITUCIONAL)) {
      return res.status(400).json({ error: `Usa tu correo institucional (@${DOMINIO_INSTITUCIONAL})` });
    }

    const existente = await pool.query(
        'SELECT id, verificado FROM usuarios WHERE LOWER(correo) = $1',
        [correo]
    );
    if (existente.rowCount > 0 && existente.rows[0].verificado) {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }

    const idExistente = existente.rows[0] ? existente.rows[0].id : null;
    if (idExistente && await codigoReciente(idExistente)) {
      return res.status(429).json({ error: 'Ya te enviamos un código hace un momento. Espera un minuto para pedir otro.' });
    }
    const duplicado = await pool.query(
        'SELECT 1 FROM usuarios WHERE numero_registro = $1 AND id IS DISTINCT FROM $2',
        [numero_registro, idExistente]
    );
    if (duplicado.rowCount > 0) {
      return res.status(409).json({ error: 'Ese número de registro ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    let usuarioId;

    if (idExistente) {
      // Cuenta que nunca se verificó: se actualizan sus datos y se reenvía el código, así nadie queda atorado.
      // Para verificarla hay que dar el código Y la contraseña de este registro, así que quien registre
      // el correo de otra persona no puede quedarse con la cuenta aunque esa persona use el código.
      await pool.query(
          `UPDATE usuarios
           SET nombre = $1, apellido = $2, numero_registro = $3, password_hash = $4, rol = $5
           WHERE id = $6`,
          [nombre, apellido, numero_registro, password_hash, rol, idExistente]
      );
      usuarioId = idExistente;
    } else {
      const { rows } = await pool.query(
          `INSERT INTO usuarios (nombre, apellido, numero_registro, correo, password_hash, rol)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [nombre, apellido, numero_registro, correo, password_hash, rol]
      );
      usuarioId = rows[0].id;
    }

    const codigo = await crearYEnviarCodigo(usuarioId, correo, 'verificacion');
    return res.status(201).json({
      mensaje: 'Cuenta creada. Revisa tu correo para verificarla.',
      ...extraDev(codigo),
    });
  } catch (err) {
    if (err.code === '23505') {
      // Choque con los índices únicos (correo o número de registro) en una carrera
      return res.status(409).json({ error: 'Ese correo o número de registro ya está registrado' });
    }
    return errorServidor(res, err);
  }
}

async function verificarCuenta(req, res) {
  try {
    const correo = normalizar(req.body.correo);
    const password = String(req.body.password || '');
    if (!password) return res.status(400).json({ error: 'Escribe también la contraseña con la que te registraste' });
    const MENSAJE = 'Código o contraseña incorrectos, o el código ya expiró';

    // La contraseña debe ser la del ultimo registro de ese correo; si no coincide cuenta como intento fallido del código
    const cuenta = await pool.query('SELECT id, password_hash FROM usuarios WHERE LOWER(correo) = $1 AND verificado = FALSE', [correo]);
    const coincide = cuenta.rows[0] ? await bcrypt.compare(password, cuenta.rows[0].password_hash) : false;
    if (!coincide) {
      if (cuenta.rows[0]) {
        await pool.query(
          `UPDATE codigos_verificacion SET intentos = intentos + 1
            WHERE id = (SELECT id FROM codigos_verificacion WHERE usuario_id = $1 AND tipo = 'verificacion' AND NOT usado AND expira_en > NOW() ORDER BY creado_en DESC LIMIT 1)`,
          [cuenta.rows[0].id]);
      }
      return res.status(400).json({ error: MENSAJE });
    }

    const usuarioId = await consumirCodigo(correo, req.body.codigo, 'verificacion');
    if (!usuarioId) return res.status(400).json({ error: MENSAJE });

    const { rows } = await pool.query(
        'UPDATE usuarios SET verificado = TRUE WHERE id = $1 RETURNING *',
        [usuarioId]
    );
    return res.json({ mensaje: 'Cuenta verificada', usuario: usuarioPublico(rows[0]) });
  } catch (err) {
    return errorServidor(res, err);
  }
}

async function reenviarCodigo(req, res) {
  try {
    const correo = normalizar(req.body.correo);
    const { rows } = await pool.query(
        'SELECT id FROM usuarios WHERE LOWER(correo) = $1 AND verificado = FALSE',
        [correo]
    );
    let extra = {};
    if (rows[0] && !(await codigoReciente(rows[0].id))) {
      extra = extraDev(await crearYEnviarCodigo(rows[0].id, correo, 'verificacion'));
    }
    // Misma respuesta exista o no el correo (y tambien si ya se envio uno hace menos de un minuto)
    return res.json({ mensaje: 'Si el correo existe, se envió un nuevo código.', ...extra });
  } catch (err) {
    return errorServidor(res, err);
  }
}

async function login(req, res) {
  try {
    const correo = normalizar(req.body.correo);
    const { password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const { rows } = await pool.query('SELECT * FROM usuarios WHERE LOWER(correo) = $1', [correo]);
    const u = rows[0];
    const coincide = u ? await bcrypt.compare(password, u.password_hash) : false;
    if (!coincide) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    if (!u.verificado) {
      return res.status(403).json({ error: 'Cuenta sin verificar', requiereVerificacion: true });
    }
    if (u.activo === false) {
      return res.status(403).json({ error: 'Esta cuenta está suspendida. Contacta a quien administra UAGPS.' });
    }

    const token = await abrirSesion(req, u);
    return res.json({ token, usuario: usuarioPublico(u) });
  } catch (err) {
    return errorServidor(res, err);
  }
}

// Visitante: entra sin cuenta, solo mapa y rutas
function invitado(req, res) {
  const token = firmarToken({ id: null, rol: 'visitante', invitado: true }, '12h');
  return res.json({ token, usuario: { rol: 'visitante', invitado: true } });
}

async function olvidePassword(req, res) {
  try {
    const correo = normalizar(req.body.correo);
    const { rows } = await pool.query(
        'SELECT id FROM usuarios WHERE LOWER(correo) = $1 AND verificado = TRUE',
        [correo]
    );
    let extra = {};
    if (rows[0]) {
      extra = extraDev(await crearYEnviarCodigo(rows[0].id, correo, 'recuperacion'));
    }
    return res.json({ mensaje: 'Si el correo existe, se envió un código de recuperación.', ...extra });
  } catch (err) {
    return errorServidor(res, err);
  }
}

async function restablecerPassword(req, res) {
  try {
    const correo = normalizar(req.body.correo);
    const { codigo, password } = req.body;
    if (!PASSWORD_REGEX.test(password || '')) {
      return res.status(400).json({ error: PASSWORD_MENSAJE });
    }
    const usuarioId = await consumirCodigo(correo, codigo, 'recuperacion');
    if (!usuarioId) {
      return res.status(400).json({ error: 'Código incorrecto o expirado' });
    }
    const password_hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [password_hash, usuarioId]);
    await cerrarSesiones(usuarioId);     // si alguien tenia la sesion abierta (o se perdio el telefono), se cierra en todos lados
    return res.json({ mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (err) {
    return errorServidor(res, err);
  }
}

async function me(req, res) {
  try {
    if (req.usuario.invitado) {
      return res.json({ usuario: { rol: 'visitante', invitado: true } });
    }
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.usuario.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ usuario: usuarioPublico(rows[0]) });
  } catch (err) {
    return errorServidor(res, err);
  }
}

async function actualizarPerfil(req, res) {
  try {
    if (req.usuario.invitado) {
      return res.status(403).json({ error: 'Los invitados no tienen perfil' });
    }
    const { vista_preferida, onboarding_completado, necesita_rutas_accesibles } = req.body;
    const quitaContacto = req.body.contacto_emergencia_telefono === '' && req.body.contacto_emergencia_nombre === '';
    const hayContacto = req.body.contacto_emergencia_nombre !== undefined || req.body.contacto_emergencia_telefono !== undefined;
    let contactoNombre = null, contactoTel = null;
    if (hayContacto && !quitaContacto) {
      contactoNombre = String(req.body.contacto_emergencia_nombre || '').trim().slice(0, 80);
      contactoTel = String(req.body.contacto_emergencia_telefono || '').trim();
      const digitos = contactoTel.replace(/\D/g, '');
      if (!contactoNombre || !/^[\d\s()+-]+$/.test(contactoTel) || digitos.length < 8 || digitos.length > 15) {
        return res.status(400).json({ error: 'Escribe el nombre y un teléfono válido (8 a 15 dígitos)' });
      }
      contactoTel = contactoTel.replace(/[^\d+]/g, '').slice(0, 20);
    }

    if (necesita_rutas_accesibles !== undefined && typeof necesita_rutas_accesibles !== 'boolean') {
      return res.status(400).json({ error: 'Valor de rutas accesibles no válido' });
    }

    if (vista_preferida !== undefined) {
      if (!['completa', 'simplificada'].includes(vista_preferida)) {
        return res.status(400).json({ error: 'Vista no válida' });
      }
      if (req.usuario.rol !== 'colaborador' && vista_preferida !== 'completa') {
        return res.status(403).json({ error: 'Solo los colaboradores pueden elegir la vista simplificada' });
      }
    }

    const { rows } = await pool.query(
        `UPDATE usuarios
         SET vista_preferida = COALESCE($1, vista_preferida),
             onboarding_completado = COALESCE($2, onboarding_completado),
             necesita_rutas_accesibles = COALESCE($3, necesita_rutas_accesibles),
             contacto_emergencia_nombre = CASE WHEN $5 THEN $6 ELSE contacto_emergencia_nombre END,
             contacto_emergencia_telefono = CASE WHEN $5 THEN $7 ELSE contacto_emergencia_telefono END
         WHERE id = $4 RETURNING *`,
        [vista_preferida ?? null, onboarding_completado ?? null, necesita_rutas_accesibles ?? null, req.usuario.id,
          hayContacto, quitaContacto ? null : contactoNombre, quitaContacto ? null : contactoTel]
    );
    return res.json({ usuario: usuarioPublico(rows[0]) });
  } catch (err) {
    return errorServidor(res, err);
  }
}

// Convierte a entero o devuelve null si no es un entero válido
const aEntero = (v) => (v !== null && v !== '' && v !== undefined && Number.isInteger(Number(v)) ? Number(v) : null);

const TIPOS_ESPACIO = ['sala_maestro', 'cubiculo_oficina'];

// Pantalla "Preferencias". Cada rol guarda cosas distintas:
//  - estudiante: rutas accesibles, edificio habitual y carrera
//  - colaborador: rutas accesibles, espacio de trabajo, estancia y vista (completa/simplificada)
// Al guardarlas se marca el onboarding como completado.
async function actualizarPreferencias(req, res) {
  try {
    if (req.usuario.invitado) {
      return res.status(403).json({ error: 'Los invitados no tienen preferencias guardadas' });
    }
    const body = req.body || {};

    if (typeof body.necesita_rutas_accesibles !== 'boolean') {
      return res.status(400).json({ error: 'Indica si necesitas rutas accesibles' });
    }

    const datos = {
      edificio_habitual_id: null,
      carrera_id: null,
      espacio_trabajo: null,
      estancia_id: null,
      vista_preferida: 'completa',
    };

    if (req.usuario.rol === 'estudiante') {
      const edificioId = aEntero(body.edificio_habitual_id);
      const edificio = edificioId === null
          ? { rowCount: 0 }
          : await pool.query('SELECT 1 FROM edificios WHERE id = $1', [edificioId]);
      if (edificio.rowCount === 0) {
        return res.status(400).json({ error: 'Selecciona un edificio habitual válido' });
      }

      const carreraId = aEntero(body.carrera_id);
      const carrera = carreraId === null
          ? { rowCount: 0 }
          : await pool.query('SELECT 1 FROM carreras WHERE id = $1', [carreraId]);
      if (carrera.rowCount === 0) {
        return res.status(400).json({ error: 'Selecciona tu carrera' });
      }

      datos.edificio_habitual_id = edificioId;
      datos.carrera_id = carreraId;
    } else if (req.usuario.rol === 'colaborador') {
      const espacio = body.espacio_trabajo;
      if (![...TIPOS_ESPACIO, 'no_aplica'].includes(espacio)) {
        return res.status(400).json({ error: 'Selecciona tu espacio principal de trabajo' });
      }
      datos.espacio_trabajo = espacio;

      if (espacio !== 'no_aplica') {
        const estanciaId = aEntero(body.estancia_id);
        // La estancia debe existir y ser del mismo tipo que el espacio elegido
        const estancia = estanciaId === null
            ? { rowCount: 0 }
            : await pool.query('SELECT 1 FROM aulas WHERE id = $1 AND tipo = $2', [estanciaId, espacio]);
        if (estancia.rowCount === 0) {
          return res.status(400).json({ error: 'Selecciona tu estancia' });
        }
        datos.estancia_id = estanciaId;
      }

      if (!['completa', 'simplificada'].includes(body.vista_preferida)) {
        return res.status(400).json({ error: 'Selecciona el detalle de la interfaz de usuario' });
      }
      datos.vista_preferida = body.vista_preferida;
    } else {
      return res.status(403).json({ error: 'Tu perfil no tiene preferencias que guardar' });
    }

    const { rows } = await pool.query(
        `UPDATE usuarios
         SET necesita_rutas_accesibles = $1,
             edificio_habitual_id = $2,
             carrera_id = $3,
             espacio_trabajo = $4,
             estancia_id = $5,
             vista_preferida = $6,
             onboarding_completado = TRUE
         WHERE id = $7 RETURNING *`,
        [
          body.necesita_rutas_accesibles,
          datos.edificio_habitual_id,
          datos.carrera_id,
          datos.espacio_trabajo,
          datos.estancia_id,
          datos.vista_preferida,
          req.usuario.id,
        ]
    );
    return res.json({ usuario: usuarioPublico(rows[0]) });
  } catch (err) {
    return errorServidor(res, err);
  }
}

// Cambiar contraseña desde Ajustes: pide la actual y la nueva debe cumplir las mismas reglas del registro
async function cambiarPassword(req, res) {
  try {
    if (req.usuario.invitado) {
      return res.status(403).json({ error: 'Los invitados no tienen cuenta' });
    }
    const { actual, nueva } = req.body || {};
    if (!actual || !nueva) {
      return res.status(400).json({ error: 'Escribe tu contraseña actual y la nueva' });
    }
    if (!PASSWORD_REGEX.test(nueva)) {
      return res.status(400).json({ error: PASSWORD_MENSAJE });
    }
    const { rows } = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [req.usuario.id]);
    if (!rows[0] || !(await bcrypt.compare(actual, rows[0].password_hash))) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }
    if (actual === nueva) {
      return res.status(400).json({ error: 'La nueva contraseña debe ser distinta a la actual' });
    }
    const password_hash = await bcrypt.hash(nueva, 12);
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [password_hash, req.usuario.id]);
    await cerrarSesiones(req.usuario.id, req.usuario.sid);   // las demas sesiones se cierran; esta se queda
    return res.json({ mensaje: 'Contraseña actualizada. Cerramos tus otras sesiones.' });
  } catch (err) {
    return errorServidor(res, err);
  }
}

// POST /api/auth/me/tutorial-visto -> el tutorial ya no vuelve a salir con esta cuenta (en ningun dispositivo)
async function tutorialVisto(req, res) {
  try {
    if (req.usuario.id) await pool.query('UPDATE usuarios SET tutorial_visto = TRUE WHERE id = $1', [req.usuario.id]);
    return res.json({ ok: true });
  } catch (err) { return errorServidor(res, err); }
}

// ---------- Sesiones ----------
// POST /api/auth/logout -> cierra solo esta sesion
async function logout(req, res) {
  try {
    if (req.usuario.sid) await pool.query('UPDATE sesiones SET revocada = TRUE WHERE id = $1 AND usuario_id = $2', [req.usuario.sid, req.usuario.id]);
    return res.json({ ok: true });
  } catch (err) { return errorServidor(res, err); }
}

// POST /api/auth/logout-todas -> cierra todas, incluida esta
async function logoutTodas(req, res) {
  try {
    if (req.usuario.id) await cerrarSesiones(req.usuario.id);
    return res.json({ ok: true });
  } catch (err) { return errorServidor(res, err); }
}

// GET /api/auth/sesiones -> mis sesiones abiertas
async function listarSesiones(req, res) {
  try {
    if (!req.usuario.id) return res.json({ sesiones: [] });
    const { rows } = await pool.query(
      `SELECT id, dispositivo, creado_en, ultimo_uso FROM sesiones
        WHERE usuario_id = $1 AND NOT revocada AND ultimo_uso > NOW() - INTERVAL '7 days' AND creado_en > NOW() - INTERVAL '90 days'
        ORDER BY ultimo_uso DESC`, [req.usuario.id]);
    return res.json({ sesiones: rows.map((s) => ({ id: s.id, dispositivo: s.dispositivo || 'Dispositivo', creado_en: s.creado_en, ultimo_uso: s.ultimo_uso, actual: s.id === req.usuario.sid })) });
  } catch (err) { return errorServidor(res, err); }
}

// DELETE /api/auth/sesiones/:id -> cierra una sesion mia
async function cerrarSesionDe(req, res) {
  try {
    const id = String(req.params.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: 'Sesión no válida' });
    const r = await pool.query('UPDATE sesiones SET revocada = TRUE WHERE id = $1 AND usuario_id = $2 AND NOT revocada', [id, req.usuario.id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Esa sesión ya no está abierta' });
    return res.json({ ok: true });
  } catch (err) { return errorServidor(res, err); }
}

module.exports = {
  tutorialVisto, logout, logoutTodas, listarSesiones, cerrarSesionDe,
  registro, verificarCuenta, reenviarCodigo, login, invitado,
  olvidePassword, restablecerPassword, me, actualizarPerfil, actualizarPreferencias, cambiarPassword,
};
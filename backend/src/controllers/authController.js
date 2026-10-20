const bcrypt = require('bcrypt'); // si falla en Docker, cambia a require('bcryptjs') (misma API)
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

const firmarToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

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
      // Cuenta que nunca se verificó: se actualizan sus datos y se reenvía el código,
      // así nadie queda atorado por no haber recibido el primer código.
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
    const usuarioId = await consumirCodigo(correo, req.body.codigo, 'verificacion');
    if (!usuarioId) {
      return res.status(400).json({ error: 'Código incorrecto o expirado' });
    }

    const { rows } = await pool.query(
        'UPDATE usuarios SET verificado = TRUE WHERE id = $1 RETURNING *',
        [usuarioId]
    );
    const u = rows[0];
    const token = firmarToken({ id: u.id, rol: u.rol });
    return res.json({ token, usuario: usuarioPublico(u) });
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
    if (rows[0]) {
      extra = extraDev(await crearYEnviarCodigo(rows[0].id, correo, 'verificacion'));
    }
    // Misma respuesta exista o no el correo
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

    const token = firmarToken({ id: u.id, rol: u.rol });
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
    return res.json({ mensaje: 'Contraseña actualizada' });
  } catch (err) {
    return errorServidor(res, err);
  }
}

module.exports = {
  registro, verificarCuenta, reenviarCodigo, login, invitado,
  olvidePassword, restablecerPassword, me, actualizarPerfil, actualizarPreferencias, cambiarPassword,
};
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken, requerirRol } = require('../middleware/auth');
const { hayBloqueo } = require('../middleware/moderacion');
const { NOMBRE_VALIDO, enviarFoto } = require('../middleware/fotos');

const router = express.Router();

// Solo estudiantes y colaboradores participan (leen, publican, dan like y comentan). Los visitantes no.
router.use(verificarToken, requerirRol('estudiante', 'colaborador'));

const DIR_FOTOS = path.join(__dirname, '../../uploads/publicaciones');
const ACTIVIDADES = ['caminata', 'carrera', 'ciclismo', 'inclusivo', 'scooter'];
const MOTIVOS = ['ofensivo', 'spam', 'falso', 'otro'];
const MAX_FOTOS = 3;
const MAX_ETIQUETAS = 10;
const MAX_BYTES_FOTO = 1.5 * 1024 * 1024;

const limitePublicar = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false, message: { error: 'Publicaste muchas veces seguidas, espera un momento' } });
const limiteComentar = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados comentarios seguidos, espera un momento' } });
const limiteReaccion = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas acciones seguidas' } });

const texto = (v, max) => (typeof v === 'string' ? v.replace(/\s+\n/g, '\n').trim().slice(0, max) : '');
const entero = (v, min, max) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : null;
};
const idParam = (req) => {
  const n = Number(req.params.id);
  return Number.isInteger(n) && n > 0 ? n : null;
};
// Quien puede ver una publicacion: todos, solo amigos (amistad aceptada) o solo su autor. $yo = parametro con mi id.
const puedeVer = (yo, p = 'p') => `(${p}.usuario_id = ${yo} OR ${p}.privacidad = 'todos' OR (${p}.privacidad = 'amigos' AND EXISTS (
    SELECT 1 FROM amistades f WHERE f.estado = 'aceptada'
      AND ((f.solicitante_id = ${p}.usuario_id AND f.destinatario_id = ${yo}) OR (f.destinatario_id = ${p}.usuario_id AND f.solicitante_id = ${yo})))))`;
const PRIVACIDADES = ['todos', 'amigos', 'solo_yo'];
const error500 = (res, err) => { console.error(err); res.status(500).json({ error: 'Error interno del servidor' }); };

// ---------- Fotos: llegan como data URL (jpeg/png/webp), se validan y se guardan en backend/uploads ----------
function decodificarFoto(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(typeof dataUrl === 'string' ? dataUrl : '');
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length || buf.length > MAX_BYTES_FOTO) return null;
  // Se comprueba el contenido real, no solo lo que dice el encabezado
  const esJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const esPng = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const esWebp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
  const ext = esJpg ? 'jpg' : esPng ? 'png' : esWebp ? 'webp' : null;
  return ext ? { buf, ext } : null;
}

function guardarFoto({ buf, ext }) {
  fs.mkdirSync(DIR_FOTOS, { recursive: true });
  const nombre = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(DIR_FOTOS, nombre), buf);
  return nombre;
}

const borrarArchivos = (nombres) => nombres.forEach((n) => {
  if (/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(n)) fs.unlink(path.join(DIR_FOTOS, n), () => {});
});

// ---------- Listado ----------
const SELECT_PUBLICACION = `
  SELECT p.id, p.actividad, p.pie_foto, p.distancia_m, p.duracion_s, p.calorias, p.mostrar_estadisticas,
         p.ubicacion, p.privacidad, p.creado_en, p.editado_en,
         u.id AS autor_id, u.nombre AS autor_nombre, u.rol AS autor_rol,
         (SELECT COUNT(*) FROM publicacion_likes l WHERE l.publicacion_id = p.id)::int AS likes,
         EXISTS (SELECT 1 FROM publicacion_likes l WHERE l.publicacion_id = p.id AND l.usuario_id = $1) AS yo_di_like,
         (SELECT COUNT(*) FROM publicacion_comentarios c WHERE c.publicacion_id = p.id AND NOT ${hayBloqueo('$1', 'c.usuario_id')})::int AS comentarios,
         COALESCE((SELECT json_agg(f.archivo ORDER BY f.orden, f.id) FROM publicacion_fotos f WHERE f.publicacion_id = p.id), '[]'::json) AS fotos,
         COALESCE((SELECT json_agg(json_build_object('id', e.usuario_id, 'nombre', eu.nombre) ORDER BY e.creado_en, e.usuario_id)
                     FROM publicacion_etiquetas e JOIN usuarios eu ON eu.id = e.usuario_id
                    WHERE e.publicacion_id = p.id AND NOT ${hayBloqueo('$1', 'e.usuario_id')}), '[]'::json) AS etiquetas,
         EXISTS (SELECT 1 FROM publicacion_etiquetas e WHERE e.publicacion_id = p.id AND e.usuario_id = $1) AS yo_etiquetado
    FROM publicaciones p
    JOIN usuarios u ON u.id = p.usuario_id`;

function aJson(r, yo) {
  return {
    id: r.id,
    autor: { id: r.autor_id, nombre: r.autor_nombre, rol: r.autor_rol },
    actividad: r.actividad,
    pie_foto: r.pie_foto,
    distancia_m: r.distancia_m,
    duracion_s: r.duracion_s,
    calorias: r.calorias,
    mostrar_estadisticas: r.mostrar_estadisticas,
    ubicacion: r.ubicacion,
    privacidad: r.privacidad,
    creado_en: r.creado_en,
    editado_en: r.editado_en,
    fotos: r.fotos.map((n) => `/api/publicaciones/foto/${n}`),
    likes: r.likes,
    yo_di_like: r.yo_di_like,
    comentarios: r.comentarios,
    es_mio: r.autor_id === yo,
    etiquetas: r.etiquetas,
    yo_etiquetado: r.yo_etiquetado,
  };
}

// GET /api/publicaciones?antes=<id>&limite=10  -> mas recientes primero (paginado por id)
router.get('/', async (req, res) => {
  const yo = req.usuario.id;
  const limite = Math.min(Math.max(Number(req.query.limite) || 10, 1), 30);
  const antes = Number(req.query.antes);
  try {
    const params = [yo, limite];
    // No se muestran personas bloqueadas (de cualquiera de los dos lados) ni silenciadas
    let filtro = `WHERE ${puedeVer('$1')}
      AND NOT ${hayBloqueo('$1', 'p.usuario_id')}
      AND NOT EXISTS (SELECT 1 FROM silenciados s WHERE s.usuario_id = $1 AND s.silenciado_id = p.usuario_id)`;
    if (Number.isInteger(antes) && antes > 0) { params.push(antes); filtro += ` AND p.id < $3`; }
    const { rows } = await pool.query(`${SELECT_PUBLICACION} ${filtro} ORDER BY p.id DESC LIMIT $2`, params);
    res.json({ publicaciones: rows.map((r) => aJson(r, yo)), hay_mas: rows.length === limite });
  } catch (err) { error500(res, err); }
});

// ---------- Crear ----------
// Verdadero si TODOS los ids son amigos mios (aceptados), verificados y sin bloqueo
async function sonMisAmigos(yo, ids) {
  if (!ids.length) return true;
  const r = await pool.query(
    `SELECT u.id FROM usuarios u
       JOIN amistades a ON a.estado = 'aceptada'
        AND ((a.solicitante_id = $1 AND a.destinatario_id = u.id) OR (a.destinatario_id = $1 AND a.solicitante_id = u.id))
      WHERE u.id = ANY($2::int[]) AND u.verificado = TRUE AND NOT ${hayBloqueo('$1', 'u.id')}`, [yo, ids]);
  return r.rowCount === ids.length;
}
const limpiarIds = (v, yo) => [...new Set((Array.isArray(v) ? v : []).map(Number).filter((n) => Number.isInteger(n) && n > 0 && n !== yo))];

// POST /api/publicaciones { actividad, pie_foto?, distancia_m?, duracion_s?, calorias?, mostrar_estadisticas?, ubicacion?, privacidad?, fotos?: [dataUrl] }
router.post('/', limitePublicar, async (req, res) => {
  const b = req.body || {};
  const actividad = texto(b.actividad, 12);
  if (!ACTIVIDADES.includes(actividad)) return res.status(400).json({ error: 'Elige una actividad válida' });

  const pie = texto(b.pie_foto, 250);
  const fotosIn = Array.isArray(b.fotos) ? b.fotos : [];
  if (fotosIn.length > MAX_FOTOS) return res.status(400).json({ error: `Máximo ${MAX_FOTOS} fotos` });
  const fotos = [];
  for (const f of fotosIn) {
    const d = decodificarFoto(f);
    if (!d) return res.status(400).json({ error: 'Una de las fotos no es válida (usa JPG, PNG o WebP de menos de 1.5 MB)' });
    fotos.push(d);
  }
  if (!pie && !fotos.length) return res.status(400).json({ error: 'Escribe algo o agrega una foto' });

  const privacidad = PRIVACIDADES.includes(b.privacidad) ? b.privacidad : 'todos';

  // Etiquetas: solo amigos, sin bloqueos, y no en publicaciones solo para mi
  const yo = req.usuario.id;
  const etiquetas = [...new Set((Array.isArray(b.etiquetas) ? b.etiquetas : []).map(Number).filter((n) => Number.isInteger(n) && n > 0 && n !== yo))];
  if (etiquetas.length > MAX_ETIQUETAS) return res.status(400).json({ error: `Máximo ${MAX_ETIQUETAS} personas etiquetadas` });
  if (etiquetas.length && privacidad === 'solo_yo') return res.status(400).json({ error: 'Una publicación solo para ti no puede etiquetar a nadie' });
  if (etiquetas.length) {
    try {
      const amigos = await pool.query(
        `SELECT u.id FROM usuarios u
           JOIN amistades a ON a.estado = 'aceptada'
            AND ((a.solicitante_id = $1 AND a.destinatario_id = u.id) OR (a.destinatario_id = $1 AND a.solicitante_id = u.id))
          WHERE u.id = ANY($2::int[]) AND u.verificado = TRUE AND NOT ${hayBloqueo('$1', 'u.id')}`, [yo, etiquetas]);
      if (amigos.rowCount !== etiquetas.length) return res.status(400).json({ error: 'Solo puedes etiquetar a tus amigos' });
    } catch (err) { return error500(res, err); }
  }
  const guardados = [];
  const cliente = await pool.connect();
  try {
    fotos.forEach((f) => guardados.push(guardarFoto(f)));
    await cliente.query('BEGIN');
    const ins = await cliente.query(
      `INSERT INTO publicaciones (usuario_id, actividad, pie_foto, distancia_m, duracion_s, calorias, mostrar_estadisticas, ubicacion, privacidad)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        req.usuario.id, actividad, pie || null,
        entero(b.distancia_m, 0, 100000), entero(b.duracion_s, 0, 86400), entero(b.calorias, 0, 5000),
        b.mostrar_estadisticas !== false, texto(b.ubicacion, 120) || null, privacidad,
      ]
    );
    const id = ins.rows[0].id;
    for (let i = 0; i < guardados.length; i++) {
      await cliente.query('INSERT INTO publicacion_fotos (publicacion_id, archivo, orden) VALUES ($1,$2,$3)', [id, guardados[i], i]);
    }
    if (etiquetas.length) {
      await cliente.query('INSERT INTO publicacion_etiquetas (publicacion_id, usuario_id) SELECT $1, unnest($2::int[])', [id, etiquetas]);
      await cliente.query("INSERT INTO notificaciones (usuario_id, tipo, actor_id, publicacion_id) SELECT unnest($2::int[]), 'etiqueta', $3, $1", [id, etiquetas, yo]);
    }
    await cliente.query('COMMIT');
    res.status(201).json({ ok: true, id });
  } catch (err) {
    await cliente.query('ROLLBACK').catch(() => {});
    borrarArchivos(guardados);
    error500(res, err);
  } finally {
    cliente.release();
  }
});

// ---------- Foto de una publicacion: solo la ve quien puede ver la publicacion ----------
router.get('/foto/:archivo', async (req, res) => {
  const archivo = String(req.params.archivo || '');
  if (!NOMBRE_VALIDO.test(archivo)) return res.status(404).json({ error: 'No encontramos esa foto' });
  try {
    const yo = req.usuario.id;
    const r = await pool.query(
      `SELECT 1 FROM publicacion_fotos f JOIN publicaciones p ON p.id = f.publicacion_id
        WHERE f.archivo = $2 AND ${puedeVer('$1')} AND NOT ${hayBloqueo('$1', 'p.usuario_id')} LIMIT 1`, [yo, archivo]);
    if (!r.rowCount) return res.status(404).json({ error: 'No encontramos esa foto' });
    enviarFoto(res, DIR_FOTOS, archivo);
  } catch (err) { error500(res, err); }
});

// ---------- Una sola publicacion (para abrirla desde un aviso) ----------
router.get('/:id', async (req, res) => {
  const id = idParam(req);
  const yo = req.usuario.id;
  if (!id) return res.status(400).json({ error: 'Publicación inválida' });
  try {
    const { rows } = await pool.query(
      `${SELECT_PUBLICACION} WHERE p.id = $2 AND ${puedeVer('$1')} AND NOT ${hayBloqueo('$1', 'p.usuario_id')}`, [yo, id]);
    if (!rows.length) return res.status(404).json({ error: 'Esa publicación ya no está disponible' });
    res.json(aJson(rows[0], yo));
  } catch (err) { error500(res, err); }
});

// ---------- Editar mi publicacion: texto, ubicacion, privacidad y etiquetas (las fotos y las estadisticas no cambian) ----------
router.patch('/:id', limitePublicar, async (req, res) => {
  const id = idParam(req);
  const yo = req.usuario.id;
  if (!id) return res.status(400).json({ error: 'Publicación inválida' });
  const b = req.body || {};
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const act = await cliente.query(
      `SELECT p.pie_foto, p.ubicacion, p.privacidad, (SELECT COUNT(*) FROM publicacion_fotos f WHERE f.publicacion_id = p.id)::int AS n_fotos
         FROM publicaciones p WHERE p.id = $1 AND p.usuario_id = $2 FOR UPDATE`, [id, yo]);
    if (!act.rowCount) { await cliente.query('ROLLBACK'); return res.status(404).json({ error: 'No encontramos esa publicación' }); }
    const antes = act.rows[0];

    const pie = 'pie_foto' in b ? texto(b.pie_foto, 250) : (antes.pie_foto || '');
    const ubicacion = 'ubicacion' in b ? (texto(b.ubicacion, 120) || null) : antes.ubicacion;
    if ('privacidad' in b && !PRIVACIDADES.includes(b.privacidad)) { await cliente.query('ROLLBACK'); return res.status(400).json({ error: 'Privacidad no válida' }); }
    const privacidad = 'privacidad' in b ? b.privacidad : antes.privacidad;
    if (!pie && !antes.n_fotos) { await cliente.query('ROLLBACK'); return res.status(400).json({ error: 'Escribe algo o deja al menos una foto' }); }

    // Etiquetas: lista final deseada (si no la mandan, se conservan; si queda solo_yo, se quitan todas)
    const actuales = (await cliente.query('SELECT usuario_id FROM publicacion_etiquetas WHERE publicacion_id = $1', [id])).rows.map((r) => r.usuario_id);
    let finales = 'etiquetas' in b ? limpiarIds(b.etiquetas, yo) : actuales;
    if (privacidad === 'solo_yo') {
      if (limpiarIds(b.etiquetas, yo).length) { await cliente.query('ROLLBACK'); return res.status(400).json({ error: 'Una publicación solo para ti no puede etiquetar a nadie' }); }
      finales = [];
    }
    if (finales.length > MAX_ETIQUETAS) { await cliente.query('ROLLBACK'); return res.status(400).json({ error: `Máximo ${MAX_ETIQUETAS} personas etiquetadas` }); }
    const nuevas = finales.filter((x) => !actuales.includes(x));
    const quitadas = actuales.filter((x) => !finales.includes(x));
    if (!(await sonMisAmigos(yo, nuevas))) { await cliente.query('ROLLBACK'); return res.status(400).json({ error: 'Solo puedes etiquetar a tus amigos' }); }

    if (quitadas.length) {
      await cliente.query('DELETE FROM publicacion_etiquetas WHERE publicacion_id = $1 AND usuario_id = ANY($2::int[])', [id, quitadas]);
      await cliente.query("DELETE FROM notificaciones WHERE publicacion_id = $1 AND tipo = 'etiqueta' AND usuario_id = ANY($2::int[])", [id, quitadas]);
    }
    if (nuevas.length) {
      await cliente.query('INSERT INTO publicacion_etiquetas (publicacion_id, usuario_id) SELECT $1, unnest($2::int[])', [id, nuevas]);
      await cliente.query("INSERT INTO notificaciones (usuario_id, tipo, actor_id, publicacion_id) SELECT unnest($2::int[]), 'etiqueta', $3, $1", [id, nuevas, yo]);
    }
    const cambio = pie !== (antes.pie_foto || '') || ubicacion !== antes.ubicacion || privacidad !== antes.privacidad || nuevas.length || quitadas.length;
    await cliente.query(
      `UPDATE publicaciones SET pie_foto = $2, ubicacion = $3, privacidad = $4, editado_en = CASE WHEN $5 THEN NOW() ELSE editado_en END WHERE id = $1`,
      [id, pie || null, ubicacion, privacidad, !!cambio]);
    await cliente.query('COMMIT');
    const { rows } = await pool.query(`${SELECT_PUBLICACION} WHERE p.id = $2`, [yo, id]);
    res.json(aJson(rows[0], yo));
  } catch (err) {
    await cliente.query('ROLLBACK').catch(() => {});
    error500(res, err);
  } finally { cliente.release(); }
});

// ---------- Quitarme una etiqueta (la puede quitar la persona etiquetada) ----------
router.delete('/:id/etiqueta', async (req, res) => {
  const id = idParam(req);
  if (!id) return res.status(400).json({ error: 'Publicación inválida' });
  try {
    const r = await pool.query('DELETE FROM publicacion_etiquetas WHERE publicacion_id = $1 AND usuario_id = $2', [id, req.usuario.id]);
    await pool.query("DELETE FROM notificaciones WHERE publicacion_id = $1 AND usuario_id = $2 AND tipo = 'etiqueta'", [id, req.usuario.id]);
    if (!r.rowCount) return res.status(404).json({ error: 'No estás etiquetada(o) en esa publicación' });
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

// ---------- Borrar la propia publicacion ----------
router.delete('/:id', async (req, res) => {
  const id = idParam(req);
  if (!id) return res.status(400).json({ error: 'Publicación inválida' });
  try {
    const fotos = await pool.query('SELECT archivo FROM publicacion_fotos WHERE publicacion_id = $1', [id]);
    const del = await pool.query('DELETE FROM publicaciones WHERE id = $1 AND usuario_id = $2', [id, req.usuario.id]);
    if (!del.rowCount) return res.status(404).json({ error: 'No encontramos esa publicación' });
    borrarArchivos(fotos.rows.map((f) => f.archivo));
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

// Una publicacion que yo puedo ver (publica o mia)
async function visible(id, yo) {
  const r = await pool.query(
    `SELECT 1 FROM publicaciones p WHERE p.id = $1 AND ${puedeVer('$2')} AND NOT ${hayBloqueo('$2', 'p.usuario_id')}`, [id, yo]);
  return r.rowCount > 0;
}

// ---------- Like (alterna) ----------
router.post('/:id/like', limiteReaccion, async (req, res) => {
  const id = idParam(req);
  if (!id) return res.status(400).json({ error: 'Publicación inválida' });
  try {
    if (!(await visible(id, req.usuario.id))) return res.status(404).json({ error: 'No encontramos esa publicación' });
    const quitar = await pool.query('DELETE FROM publicacion_likes WHERE publicacion_id = $1 AND usuario_id = $2', [id, req.usuario.id]);
    if (!quitar.rowCount) {
      await pool.query('INSERT INTO publicacion_likes (publicacion_id, usuario_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, req.usuario.id]);
    }
    const total = await pool.query('SELECT COUNT(*)::int AS n FROM publicacion_likes WHERE publicacion_id = $1', [id]);
    res.json({ yo_di_like: !quitar.rowCount, likes: total.rows[0].n });
  } catch (err) { error500(res, err); }
});

// ---------- Comentarios ----------
router.get('/:id/comentarios', async (req, res) => {
  const id = idParam(req);
  if (!id) return res.status(400).json({ error: 'Publicación inválida' });
  try {
    if (!(await visible(id, req.usuario.id))) return res.status(404).json({ error: 'No encontramos esa publicación' });
    const { rows } = await pool.query(
      `SELECT c.id, c.texto, c.creado_en, u.id AS autor_id, u.nombre AS autor_nombre, u.rol AS autor_rol,
              p.usuario_id AS dueno_publicacion
         FROM publicacion_comentarios c
         JOIN usuarios u ON u.id = c.usuario_id
         JOIN publicaciones p ON p.id = c.publicacion_id
        WHERE c.publicacion_id = $1 AND NOT ${hayBloqueo('$2', 'c.usuario_id')}
        ORDER BY c.id ASC LIMIT 200`, [id, req.usuario.id]
    );
    res.json(rows.map((c) => ({
      id: c.id, texto: c.texto, creado_en: c.creado_en,
      autor: { id: c.autor_id, nombre: c.autor_nombre, rol: c.autor_rol },
      puedo_borrar: c.autor_id === req.usuario.id || c.dueno_publicacion === req.usuario.id,
    })));
  } catch (err) { error500(res, err); }
});

router.post('/:id/comentarios', limiteComentar, async (req, res) => {
  const id = idParam(req);
  const t = texto(req.body && req.body.texto, 300);
  if (!id) return res.status(400).json({ error: 'Publicación inválida' });
  if (!t) return res.status(400).json({ error: 'Escribe un comentario' });
  try {
    if (!(await visible(id, req.usuario.id))) return res.status(404).json({ error: 'No encontramos esa publicación' });
    const ins = await pool.query(
      'INSERT INTO publicacion_comentarios (publicacion_id, usuario_id, texto) VALUES ($1,$2,$3) RETURNING id', [id, req.usuario.id, t]
    );
    res.status(201).json({ ok: true, id: ins.rows[0].id });
  } catch (err) { error500(res, err); }
});

// Borra un comentario propio, o cualquiera dentro de una publicacion propia
router.delete('/:id/comentarios/:cid', async (req, res) => {
  const id = idParam(req);
  const cid = Number(req.params.cid);
  if (!id || !Number.isInteger(cid) || cid < 1) return res.status(400).json({ error: 'Comentario inválido' });
  try {
    const del = await pool.query(
      `DELETE FROM publicacion_comentarios c USING publicaciones p
        WHERE c.id = $1 AND c.publicacion_id = $2 AND p.id = c.publicacion_id
          AND (c.usuario_id = $3 OR p.usuario_id = $3)`, [cid, id, req.usuario.id]
    );
    if (!del.rowCount) return res.status(404).json({ error: 'No encontramos ese comentario' });
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

// ---------- Reportar una publicacion ajena ----------
router.post('/:id/reportar', limiteReaccion, async (req, res) => {
  const id = idParam(req);
  const motivo = texto(req.body && req.body.motivo, 20);
  if (!id) return res.status(400).json({ error: 'Publicación inválida' });
  if (!MOTIVOS.includes(motivo)) return res.status(400).json({ error: 'Motivo inválido' });
  try {
    if (!(await visible(id, req.usuario.id))) return res.status(404).json({ error: 'No encontramos esa publicación' });
    await pool.query(
      `INSERT INTO publicacion_reportes (publicacion_id, usuario_id, motivo) VALUES ($1,$2,$3)
       ON CONFLICT (publicacion_id, usuario_id) DO UPDATE SET motivo = EXCLUDED.motivo`, [id, req.usuario.id, motivo]
    );
    res.status(201).json({ ok: true });
  } catch (err) { error500(res, err); }
});

module.exports = router;

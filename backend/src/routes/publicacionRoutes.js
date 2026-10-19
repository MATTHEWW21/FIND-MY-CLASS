const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken, requerirRol } = require('../middleware/auth');

const router = express.Router();

// Solo estudiantes y colaboradores participan (leen, publican, dan like y comentan). Los visitantes no.
router.use(verificarToken, requerirRol('estudiante', 'colaborador'));

const DIR_FOTOS = path.join(__dirname, '../../uploads/publicaciones');
const ACTIVIDADES = ['caminata', 'carrera', 'ciclismo', 'inclusivo', 'scooter'];
const MOTIVOS = ['ofensivo', 'spam', 'falso', 'otro'];
const MAX_FOTOS = 3;
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
         p.ubicacion, p.privacidad, p.creado_en,
         u.id AS autor_id, u.nombre AS autor_nombre, u.rol AS autor_rol,
         (SELECT COUNT(*) FROM publicacion_likes l WHERE l.publicacion_id = p.id)::int AS likes,
         EXISTS (SELECT 1 FROM publicacion_likes l WHERE l.publicacion_id = p.id AND l.usuario_id = $1) AS yo_di_like,
         (SELECT COUNT(*) FROM publicacion_comentarios c WHERE c.publicacion_id = p.id)::int AS comentarios,
         COALESCE((SELECT json_agg(f.archivo ORDER BY f.orden, f.id) FROM publicacion_fotos f WHERE f.publicacion_id = p.id), '[]'::json) AS fotos
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
    fotos: r.fotos.map((n) => `/uploads/publicaciones/${n}`),
    likes: r.likes,
    yo_di_like: r.yo_di_like,
    comentarios: r.comentarios,
    es_mio: r.autor_id === yo,
  };
}

// GET /api/publicaciones?antes=<id>&limite=10  -> mas recientes primero (paginado por id)
router.get('/', async (req, res) => {
  const yo = req.usuario.id;
  const limite = Math.min(Math.max(Number(req.query.limite) || 10, 1), 30);
  const antes = Number(req.query.antes);
  try {
    const params = [yo, limite];
    let filtro = `WHERE (p.privacidad = 'todos' OR p.usuario_id = $1)`;
    if (Number.isInteger(antes) && antes > 0) { params.push(antes); filtro += ` AND p.id < $3`; }
    const { rows } = await pool.query(`${SELECT_PUBLICACION} ${filtro} ORDER BY p.id DESC LIMIT $2`, params);
    res.json({ publicaciones: rows.map((r) => aJson(r, yo)), hay_mas: rows.length === limite });
  } catch (err) { error500(res, err); }
});

// ---------- Crear ----------
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

  const privacidad = b.privacidad === 'solo_yo' ? 'solo_yo' : 'todos';
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
  const r = await pool.query(`SELECT 1 FROM publicaciones WHERE id = $1 AND (privacidad = 'todos' OR usuario_id = $2)`, [id, yo]);
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
        WHERE c.publicacion_id = $1
        ORDER BY c.id ASC LIMIT 200`, [id]
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

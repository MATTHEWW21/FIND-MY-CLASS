const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken, requerirRol } = require('../middleware/auth');
const { soloVistaCompleta } = require('../middleware/comunidad');
const { hayBloqueo } = require('../middleware/moderacion');
const { NOMBRE_VALIDO, enviarFoto } = require('../middleware/fotos');

const router = express.Router();
router.use(verificarToken, requerirRol('estudiante', 'colaborador'), soloVistaCompleta);

const DIR_FOTOS = path.join(__dirname, '../../uploads/mensajes');
const MAX_BYTES_FOTO = 1.5 * 1024 * 1024;
const MAX_TEXTO = 1000;

const limiteEnviar = rateLimit({ windowMs: 5 * 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false, message: { error: 'Estás enviando muchos mensajes seguidos, espera un momento' } });
// La pantalla consulta cada pocos segundos: se deja un limite holgado solo para frenar abusos
const limiteLeer = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas consultas, espera un momento' } });

// GET /api/mensajes/foto/:archivo -> solo la ve quien la envio o quien la recibio (y sin bloqueo entre ambos)
router.get('/foto/:archivo', async (req, res) => {
  const archivo = String(req.params.archivo || '');
  if (!NOMBRE_VALIDO.test(archivo)) return res.status(404).json({ error: 'No encontramos esa foto' });
  try {
    const yo = req.usuario.id;
    const r = await pool.query(
      `SELECT 1 FROM mensajes m WHERE m.foto = $2 AND (m.de_id = $1 OR m.para_id = $1)
          AND NOT ${hayBloqueo('$1', 'CASE WHEN m.de_id = $1 THEN m.para_id ELSE m.de_id END')} LIMIT 1`, [yo, archivo]);
    if (!r.rowCount) return res.status(404).json({ error: 'No encontramos esa foto' });
    enviarFoto(res, DIR_FOTOS, archivo);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error interno del servidor' }); }
});

const idDe = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : null; };
const error500 = (res, err) => { console.error(err); res.status(500).json({ error: 'Error interno del servidor' }); };

// ---------- Fotos (misma validacion que las publicaciones) ----------
function decodificarFoto(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(typeof dataUrl === 'string' ? dataUrl : '');
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length || buf.length > MAX_BYTES_FOTO) return null;
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

async function sonAmigos(a, b) {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM amistades WHERE estado = 'aceptada'
        AND ((solicitante_id = $1 AND destinatario_id = $2) OR (solicitante_id = $2 AND destinatario_id = $1))`,
    [a, b]
  );
  return rowCount > 0;
}

const aMensaje = (m, yo) => ({
  id: m.id, mio: m.de_id === yo, texto: m.texto, foto: m.foto, creado_en: m.creado_en, leido: !!m.leido_en,
});

// GET /api/mensajes/conversaciones -> amigos con su ultimo mensaje y los no leidos
router.get('/conversaciones', limiteLeer, async (req, res) => {
  try {
    const yo = req.usuario.id;
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.apellido,
              (SELECT COUNT(*) FROM mensajes m WHERE m.de_id = u.id AND m.para_id = $1 AND m.leido_en IS NULL)::int AS sin_leer,
              lm.id AS ultimo_id, lm.texto, lm.foto, lm.creado_en, (lm.de_id = $1) AS mio
         FROM amistades a
         JOIN usuarios u ON u.id = CASE WHEN a.solicitante_id = $1 THEN a.destinatario_id ELSE a.solicitante_id END
         LEFT JOIN LATERAL (
              SELECT m.id, m.de_id, m.texto, m.foto, m.creado_en FROM mensajes m
               WHERE (m.de_id = $1 AND m.para_id = u.id) OR (m.de_id = u.id AND m.para_id = $1)
               ORDER BY m.id DESC LIMIT 1) lm ON TRUE
        WHERE a.estado = 'aceptada' AND (a.solicitante_id = $1 OR a.destinatario_id = $1)
        ORDER BY lm.id DESC NULLS LAST, u.nombre`,
      [yo]
    );
    const pend = await pool.query(
      "SELECT COUNT(*)::int AS n FROM amistades WHERE destinatario_id = $1 AND estado = 'pendiente'", [yo]
    );
    res.json({
      solicitudes_pendientes: pend.rows[0].n,
      amigos: rows.map((r) => ({
        id: r.id, nombre: r.nombre, apellido: r.apellido, sin_leer: r.sin_leer,
        ultimo: r.ultimo_id ? { texto: r.texto, foto: !!r.foto, creado_en: r.creado_en, mio: r.mio } : null,
      })),
    });
  } catch (err) { error500(res, err); }
});

// GET /api/mensajes/con/:amigoId?despues=<id>
//   sin "despues": los ultimos 50. Con "despues": solo los nuevos (asi se consulta cada pocos segundos).
router.get('/con/:amigoId', limiteLeer, async (req, res) => {
  try {
    const yo = req.usuario.id;
    const amigo = idDe(req.params.amigoId);
    if (!amigo || !(await sonAmigos(yo, amigo))) return res.status(403).json({ error: 'Solo puedes chatear con tus amigos' });
    const despues = idDe(req.query.despues) || 0;

    const par = '((m.de_id = $1 AND m.para_id = $2) OR (m.de_id = $2 AND m.para_id = $1))';
    const { rows } = despues
      ? await pool.query(`SELECT m.* FROM mensajes m WHERE ${par} AND m.id > $3 ORDER BY m.id ASC LIMIT 100`, [yo, amigo, despues])
      : await pool.query(`SELECT * FROM (SELECT m.* FROM mensajes m WHERE ${par} ORDER BY m.id DESC LIMIT 50) x ORDER BY id ASC`, [yo, amigo]);

    // Lo que me mandaron queda como leido
    await pool.query(
      'UPDATE mensajes SET leido_en = NOW() WHERE de_id = $1 AND para_id = $2 AND leido_en IS NULL',
      [amigo, yo]
    );
    // Hasta que mensaje mio ya leyo la otra persona (para las palomitas dobles)
    const leidos = await pool.query(
      'SELECT COALESCE(MAX(id), 0)::int AS hasta FROM mensajes WHERE de_id = $1 AND para_id = $2 AND leido_en IS NOT NULL',
      [yo, amigo]
    );
    res.json({ mensajes: rows.map((m) => aMensaje(m, yo)), leidos_hasta: leidos.rows[0].hasta });
  } catch (err) { error500(res, err); }
});

// POST /api/mensajes/con/:amigoId { texto?, foto? }
router.post('/con/:amigoId', limiteEnviar, async (req, res) => {
  let archivo = null;
  try {
    const yo = req.usuario.id;
    const amigo = idDe(req.params.amigoId);
    if (!amigo || !(await sonAmigos(yo, amigo))) return res.status(403).json({ error: 'Solo puedes chatear con tus amigos' });

    const body = req.body || {};
    const texto = typeof body.texto === 'string' ? body.texto.replace(/\s+\n/g, '\n').trim().slice(0, MAX_TEXTO) : '';
    let fotoDecodificada = null;
    if (body.foto) {
      fotoDecodificada = decodificarFoto(body.foto);
      if (!fotoDecodificada) return res.status(400).json({ error: 'La foto no es válida o pesa demasiado' });
    }
    if (!texto && !fotoDecodificada) return res.status(400).json({ error: 'Escribe un mensaje o elige una foto' });

    if (fotoDecodificada) archivo = guardarFoto(fotoDecodificada);
    const { rows } = await pool.query(
      'INSERT INTO mensajes (de_id, para_id, texto, foto) VALUES ($1, $2, $3, $4) RETURNING *',
      [yo, amigo, texto || null, archivo]
    );
    res.status(201).json(aMensaje(rows[0], yo));
  } catch (err) {
    if (archivo) fs.unlink(path.join(DIR_FOTOS, archivo), () => {});
    error500(res, err);
  }
});

module.exports = router;

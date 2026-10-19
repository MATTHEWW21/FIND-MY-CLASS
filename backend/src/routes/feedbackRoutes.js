const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Frena el spam: 30 envios cada 15 min por IP
const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados envíos, intenta más tarde' },
});

const CATEGORIAS = ['camino', 'bache', 'escalera', 'iluminacion', 'mobiliario', 'limpieza', 'otro'];
// Misma zona que el mapa (Campus CU)
const LIM = { latMin: 20.685, latMax: 20.701, lngMin: -103.426, lngMax: -103.409 };

// Los visitantes (invitados) tambien pueden enviar, pero sin usuario asociado
function idUsuario(req) {
  const u = req.usuario || {};
  return !u.invitado && Number.isInteger(u.id) ? u.id : null;
}

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// POST /api/feedback/calificaciones  { estrellas, comentario?, destino_clave?, destino_nombre? }
router.post('/calificaciones', limitador, verificarToken, async (req, res) => {
  const estrellas = Number(req.body.estrellas);
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
    return res.status(400).json({ error: 'Elige de 1 a 5 estrellas' });
  }
  try {
    await pool.query(
      `INSERT INTO calificaciones (usuario_id, destino_clave, destino_nombre, estrellas, comentario)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        idUsuario(req),
        texto(req.body.destino_clave, 40) || null,
        texto(req.body.destino_nombre, 150) || null,
        estrellas,
        texto(req.body.comentario, 500) || null,
      ]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/feedback/incidencias  { categoria, descripcion?, latitud, longitud }
router.post('/incidencias', limitador, verificarToken, async (req, res) => {
  const categoria = texto(req.body.categoria, 20);
  const lat = Number(req.body.latitud);
  const lng = Number(req.body.longitud);
  if (!CATEGORIAS.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría inválida' });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)
      || lat < LIM.latMin || lat > LIM.latMax || lng < LIM.lngMin || lng > LIM.lngMax) {
    return res.status(400).json({ error: 'La ubicación debe estar dentro del campus' });
  }
  try {
    await pool.query(
      `INSERT INTO incidencias (usuario_id, categoria, descripcion, latitud, longitud)
       VALUES ($1, $2, $3, $4, $5)`,
      [idUsuario(req), categoria, texto(req.body.descripcion, 200) || null, lat, lng]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

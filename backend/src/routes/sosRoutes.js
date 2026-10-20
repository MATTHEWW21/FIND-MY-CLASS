const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();
// Cualquier persona con sesion (incluidos los visitantes) puede pedir ayuda: es una funcion de seguridad
router.use(verificarToken);

const TIPOS = ['lesion', 'mareo', 'desorientacion', 'medica', 'seguridad', 'vehicular', 'ansiedad'];
// Campus CU (un poco de margen): fuera de esto la ubicacion se guarda como desconocida
const LAT = [20.680, 20.706];
const LNG = [-103.432, -103.404];

const limiteSos = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Ya enviaste varias alertas seguidas. Si es una emergencia, llama directamente a seguridad.' } });

// GET /api/sos/config -> numero de seguridad del campus (se define en el .env)
router.get('/config', (req, res) => {
  const tel = (process.env.SEGURIDAD_UAG_TELEFONO || '').replace(/[^\d+]/g, '');
  res.json({ telefono: tel.length >= 8 ? tel : null });
});

// POST /api/sos { tipo, lat?, lng? } -> deja registrada la alerta (para que seguridad la pueda consultar)
router.post('/', limiteSos, async (req, res) => {
  try {
    const b = req.body || {};
    const tipo = String(b.tipo || '');
    if (!TIPOS.includes(tipo)) return res.status(400).json({ error: 'Tipo de problema no válido' });

    const lat = Number(b.lat), lng = Number(b.lng);
    const ubicado = Number.isFinite(lat) && Number.isFinite(lng) && lat >= LAT[0] && lat <= LAT[1] && lng >= LNG[0] && lng <= LNG[1];
    const { rows } = await pool.query(
      `INSERT INTO sos_alertas (usuario_id, tipo, latitud, longitud) VALUES ($1, $2, $3, $4)
       RETURNING id, tipo, creado_en`,
      [req.usuario.id || null, tipo, ubicado ? lat : null, ubicado ? lng : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

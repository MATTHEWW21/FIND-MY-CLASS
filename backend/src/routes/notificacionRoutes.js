const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken, requerirRol } = require('../middleware/auth');
const { soloVistaCompleta } = require('../middleware/comunidad');
const { hayBloqueo } = require('../middleware/moderacion');

const router = express.Router();
router.use(verificarToken, requerirRol('estudiante', 'colaborador'), soloVistaCompleta);

const limite = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas consultas, espera un momento' } });
const error500 = (res, err) => { console.error(err); res.status(500).json({ error: 'Error interno del servidor' }); };

// GET /api/notificaciones -> los ultimos 30 avisos y cuantos no se han leido
router.get('/', limite, async (req, res) => {
  try {
    const yo = req.usuario.id;
    const { rows } = await pool.query(
      `SELECT n.id, n.tipo, n.leida, n.creado_en, n.publicacion_id, u.id AS actor_id, u.nombre AS actor_nombre
         FROM notificaciones n
         JOIN usuarios u ON u.id = n.actor_id
        WHERE n.usuario_id = $1 AND NOT ${hayBloqueo('$1', 'n.actor_id')}
        ORDER BY n.id DESC LIMIT 30`, [yo]);
    res.json({
      no_leidas: rows.filter((r) => !r.leida).length,
      items: rows.map((r) => ({
        id: r.id, tipo: r.tipo, leida: r.leida, creado_en: r.creado_en, publicacion_id: r.publicacion_id,
        actor: { id: r.actor_id, nombre: r.actor_nombre },
      })),
    });
  } catch (err) { error500(res, err); }
});

// POST /api/notificaciones/leidas -> marca todo como leido
router.post('/leidas', limite, async (req, res) => {
  try {
    await pool.query('UPDATE notificaciones SET leida = TRUE WHERE usuario_id = $1 AND leida = FALSE', [req.usuario.id]);
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

module.exports = router;

const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken, requerirRol } = require('../middleware/auth');
const { soloVistaCompleta } = require('../middleware/comunidad');

const router = express.Router();
router.use(verificarToken, requerirRol('estudiante', 'colaborador'), soloVistaCompleta);

const MOTIVOS = ['acoso', 'spam', 'suplantacion', 'inapropiado', 'otro'];
const limiteAcciones = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas acciones seguidas, espera un momento' } });
const limiteReportar = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Enviaste muchos reportes seguidos, espera un momento' } });

const idDe = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : null; };
const error500 = (res, err) => { console.error(err); res.status(500).json({ error: 'Error interno del servidor' }); };

// Al bloquear desaparecen las etiquetas y avisos que hubiera entre las dos personas
async function limpiarEntre(cliente, a, b) {
  await cliente.query(
    `DELETE FROM publicacion_etiquetas e USING publicaciones p
      WHERE e.publicacion_id = p.id AND ((p.usuario_id = $1 AND e.usuario_id = $2) OR (p.usuario_id = $2 AND e.usuario_id = $1))`, [a, b]);
  await cliente.query('DELETE FROM notificaciones WHERE (usuario_id = $1 AND actor_id = $2) OR (usuario_id = $2 AND actor_id = $1)', [a, b]);
}

// La persona existe y no me bloqueo (si me bloqueo se responde igual que si no existiera, para no revelarlo)
async function existeVisible(yo, otro) {
  const r = await pool.query(
    `SELECT 1 FROM usuarios u
      WHERE u.id = $1 AND u.verificado = TRUE
        AND NOT EXISTS (SELECT 1 FROM bloqueos b WHERE b.bloqueador_id = u.id AND b.bloqueado_id = $2)`,
    [otro, yo]
  );
  return r.rowCount > 0;
}

// GET /api/moderacion/lista -> a quien bloquee y a quien silencie (para poder deshacerlo desde Ajustes)
router.get('/lista', async (req, res) => {
  try {
    const yo = req.usuario.id;
    const b = await pool.query(
      `SELECT u.id, u.nombre, u.apellido FROM bloqueos x JOIN usuarios u ON u.id = x.bloqueado_id
        WHERE x.bloqueador_id = $1 ORDER BY x.creado_en DESC`, [yo]);
    const s = await pool.query(
      `SELECT u.id, u.nombre, u.apellido FROM silenciados x JOIN usuarios u ON u.id = x.silenciado_id
        WHERE x.usuario_id = $1 ORDER BY x.creado_en DESC`, [yo]);
    res.json({ bloqueados: b.rows, silenciados: s.rows });
  } catch (err) { error500(res, err); }
});

// POST /api/moderacion/bloquear/:id  (quita la amistad y el silencio, si los habia)
router.post('/bloquear/:id', limiteAcciones, async (req, res) => {
  const yo = req.usuario.id;
  const otro = idDe(req.params.id);
  if (!otro || otro === yo) return res.status(400).json({ error: 'Persona no válida' });
  const cliente = await pool.connect();
  try {
    if (!(await existeVisible(yo, otro))) return res.status(404).json({ error: 'No encontramos a esa persona' });
    await cliente.query('BEGIN');
    await cliente.query('INSERT INTO bloqueos (bloqueador_id, bloqueado_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [yo, otro]);
    await cliente.query(
      `DELETE FROM amistades WHERE (solicitante_id = $1 AND destinatario_id = $2) OR (solicitante_id = $2 AND destinatario_id = $1)`, [yo, otro]);
    await cliente.query('DELETE FROM silenciados WHERE usuario_id = $1 AND silenciado_id = $2', [yo, otro]);
    await limpiarEntre(cliente, yo, otro);
    await cliente.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await cliente.query('ROLLBACK').catch(() => {});
    error500(res, err);
  } finally { cliente.release(); }
});

// DELETE /api/moderacion/bloquear/:id  (desbloquear; la amistad NO se restaura, hay que volver a agregarse)
router.delete('/bloquear/:id', limiteAcciones, async (req, res) => {
  const otro = idDe(req.params.id);
  if (!otro) return res.status(400).json({ error: 'Persona no válida' });
  try {
    await pool.query('DELETE FROM bloqueos WHERE bloqueador_id = $1 AND bloqueado_id = $2', [req.usuario.id, otro]);
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

// POST /api/moderacion/silenciar/:id
router.post('/silenciar/:id', limiteAcciones, async (req, res) => {
  const yo = req.usuario.id;
  const otro = idDe(req.params.id);
  if (!otro || otro === yo) return res.status(400).json({ error: 'Persona no válida' });
  try {
    if (!(await existeVisible(yo, otro))) return res.status(404).json({ error: 'No encontramos a esa persona' });
    await pool.query('INSERT INTO silenciados (usuario_id, silenciado_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [yo, otro]);
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

// DELETE /api/moderacion/silenciar/:id
router.delete('/silenciar/:id', limiteAcciones, async (req, res) => {
  const otro = idDe(req.params.id);
  if (!otro) return res.status(400).json({ error: 'Persona no válida' });
  try {
    await pool.query('DELETE FROM silenciados WHERE usuario_id = $1 AND silenciado_id = $2', [req.usuario.id, otro]);
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

// POST /api/moderacion/reportar/:id { motivo, comentario?, bloquear? }
router.post('/reportar/:id', limiteReportar, async (req, res) => {
  const yo = req.usuario.id;
  const otro = idDe(req.params.id);
  const b = req.body || {};
  const motivo = typeof b.motivo === 'string' ? b.motivo.trim().slice(0, 20) : '';
  const comentario = typeof b.comentario === 'string' ? b.comentario.replace(/\s+\n/g, '\n').trim().slice(0, 300) : '';
  if (!otro || otro === yo) return res.status(400).json({ error: 'Persona no válida' });
  if (!MOTIVOS.includes(motivo)) return res.status(400).json({ error: 'Elige un motivo para el reporte' });
  const cliente = await pool.connect();
  try {
    const existe = await pool.query('SELECT 1 FROM usuarios WHERE id = $1 AND verificado = TRUE', [otro]);
    if (!existe.rowCount) return res.status(404).json({ error: 'No encontramos a esa persona' });
    await cliente.query('BEGIN');
    await cliente.query(
      `INSERT INTO reportes_usuario (reportante_id, reportado_id, motivo, comentario) VALUES ($1,$2,$3,$4)
       ON CONFLICT (reportante_id, reportado_id)
       DO UPDATE SET motivo = EXCLUDED.motivo, comentario = EXCLUDED.comentario, estado = 'abierto', creado_en = NOW()`,
      [yo, otro, motivo, comentario || null]
    );
    if (b.bloquear === true) {
      await cliente.query('INSERT INTO bloqueos (bloqueador_id, bloqueado_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [yo, otro]);
      await cliente.query(
        `DELETE FROM amistades WHERE (solicitante_id = $1 AND destinatario_id = $2) OR (solicitante_id = $2 AND destinatario_id = $1)`, [yo, otro]);
      await cliente.query('DELETE FROM silenciados WHERE usuario_id = $1 AND silenciado_id = $2', [yo, otro]);
      await limpiarEntre(cliente, yo, otro);
    }
    await cliente.query('COMMIT');
    res.status(201).json({ ok: true });
  } catch (err) {
    await cliente.query('ROLLBACK').catch(() => {});
    error500(res, err);
  } finally { cliente.release(); }
});

module.exports = router;

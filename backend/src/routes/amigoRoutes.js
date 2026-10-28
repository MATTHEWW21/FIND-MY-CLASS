const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken, requerirRol } = require('../middleware/auth');
const { soloVistaCompleta } = require('../middleware/comunidad');
const { hayBloqueo } = require('../middleware/moderacion');

const router = express.Router();
router.use(verificarToken, requerirRol('estudiante', 'colaborador'), soloVistaCompleta);

const limiteBuscar = rateLimit({ windowMs: 5 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas búsquedas seguidas, espera un momento' } });
const limiteSolicitar = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Enviaste muchas solicitudes seguidas, espera un momento' } });

const idDe = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : null; };
const error500 = (res, err) => { console.error(err); res.status(500).json({ error: 'Error interno del servidor' }); };

// GET /api/amigos -> amigos, solicitudes recibidas y enviadas
router.get('/', async (req, res) => {
  try {
    const yo = req.usuario.id;
    const { rows } = await pool.query(
      `SELECT a.id AS amistad_id, a.estado, (a.solicitante_id = $1) AS la_envie,
              u.id, u.nombre, u.apellido
         FROM amistades a
         JOIN usuarios u ON u.id = CASE WHEN a.solicitante_id = $1 THEN a.destinatario_id ELSE a.solicitante_id END
        WHERE a.solicitante_id = $1 OR a.destinatario_id = $1
        ORDER BY u.nombre, u.apellido`,
      [yo]
    );
    const persona = (r) => ({ amistad_id: r.amistad_id, id: r.id, nombre: r.nombre, apellido: r.apellido });
    res.json({
      amigos: rows.filter((r) => r.estado === 'aceptada').map(persona),
      recibidas: rows.filter((r) => r.estado === 'pendiente' && !r.la_envie).map(persona),
      enviadas: rows.filter((r) => r.estado === 'pendiente' && r.la_envie).map(persona),
    });
  } catch (err) { error500(res, err); }
});

// GET /api/amigos/buscar?q=nombre -> personas que se pueden agregar (solo nombre, nunca el correo)
router.get('/buscar', limiteBuscar, async (req, res) => {
  try {
    const yo = req.usuario.id;
    const q = String(req.query.q || '').trim().slice(0, 40);
    if (q.length < 3) return res.json([]);
    const patron = '%' + q.replace(/[\\%_]/g, '\\$&') + '%';
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.rol, a.id AS amistad_id, a.estado, (a.solicitante_id = $1) AS la_envie
         FROM usuarios u
         LEFT JOIN amistades a
                ON (a.solicitante_id = $1 AND a.destinatario_id = u.id)
                OR (a.destinatario_id = $1 AND a.solicitante_id = u.id)
        WHERE u.id <> $1 AND u.verificado = TRUE AND u.rol IN ('estudiante','colaborador')
          AND NOT (u.rol = 'colaborador' AND u.vista_preferida = 'simplificada')
          AND NOT ${hayBloqueo('$1', 'u.id')}
          AND (u.nombre || ' ' || COALESCE(u.apellido, '')) ILIKE $2
        ORDER BY u.nombre, u.apellido
        LIMIT 10`,
      [yo, patron]
    );
    res.json(rows.map((r) => ({
      id: r.id, nombre: r.nombre, apellido: r.apellido, rol: r.rol, amistad_id: r.amistad_id || null,
      relacion: !r.estado ? 'ninguna' : r.estado === 'aceptada' ? 'amigo' : r.la_envie ? 'enviada' : 'recibida',
    })));
  } catch (err) { error500(res, err); }
});

// GET /api/amigos/perfil/:id -> perfil publico (solo nombre, rol y conteos; nunca correo, telefono ni registro)
router.get('/perfil/:id', async (req, res) => {
  try {
    const yo = req.usuario.id;
    const id = idDe(req.params.id);
    if (!id) return res.status(400).json({ error: 'Persona no válida' });
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.rol,
              (SELECT COUNT(*)::int FROM amistades x
                WHERE x.estado = 'aceptada' AND (x.solicitante_id = u.id OR x.destinatario_id = u.id)) AS n_amigos,
              (SELECT COUNT(*)::int FROM publicaciones p WHERE p.usuario_id = u.id AND (p.privacidad = 'todos' OR (p.privacidad = 'amigos' AND (a.estado = 'aceptada' OR u.id = $1)))) AS n_publicaciones,
              EXISTS (SELECT 1 FROM bloqueos bl WHERE bl.bloqueador_id = $1 AND bl.bloqueado_id = u.id) AS bloqueado_por_mi,
              EXISTS (SELECT 1 FROM silenciados si WHERE si.usuario_id = $1 AND si.silenciado_id = u.id) AS silenciado,
              a.id AS amistad_id, a.estado, (a.solicitante_id = $1) AS la_envie
         FROM usuarios u
         LEFT JOIN amistades a
                ON (a.solicitante_id = $1 AND a.destinatario_id = u.id)
                OR (a.destinatario_id = $1 AND a.solicitante_id = u.id)
        WHERE u.id = $2 AND NOT EXISTS (SELECT 1 FROM bloqueos bt WHERE bt.bloqueador_id = u.id AND bt.bloqueado_id = $1) AND u.verificado = TRUE AND u.rol IN ('estudiante','colaborador')
          AND NOT (u.rol = 'colaborador' AND u.vista_preferida = 'simplificada')`,
      [yo, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontramos a esa persona' });
    const r = rows[0];
    res.json({
      id: r.id, nombre: r.nombre, apellido: r.apellido, rol: r.rol,
      n_amigos: r.n_amigos, n_publicaciones: r.n_publicaciones,
      es_yo: r.id === yo,
      bloqueado_por_mi: r.bloqueado_por_mi,
      silenciado: r.silenciado,
      amistad_id: r.amistad_id || null,
      relacion: r.id === yo ? 'yo' : !r.estado ? 'ninguna' : r.estado === 'aceptada' ? 'amigo' : r.la_envie ? 'enviada' : 'recibida',
    });
  } catch (err) { error500(res, err); }
});

// POST /api/amigos/solicitar { usuario_id }
router.post('/solicitar', limiteSolicitar, async (req, res) => {
  try {
    const yo = req.usuario.id;
    const otro = idDe(req.body && req.body.usuario_id);
    if (!otro || otro === yo) return res.status(400).json({ error: 'Persona no válida' });

    const destino = await pool.query(
      `SELECT 1 FROM usuarios u WHERE u.id = $1 AND u.verificado = TRUE AND u.rol IN ('estudiante','colaborador')
          AND NOT (u.rol = 'colaborador' AND u.vista_preferida = 'simplificada')
          AND NOT ${hayBloqueo('$2', 'u.id')}`,
      [otro, yo]
    );
    if (!destino.rowCount) return res.status(404).json({ error: 'No encontramos a esa persona' });

    const previa = await pool.query(
      `SELECT id, estado, solicitante_id FROM amistades
        WHERE (solicitante_id = $1 AND destinatario_id = $2) OR (solicitante_id = $2 AND destinatario_id = $1)`,
      [yo, otro]
    );
    if (previa.rowCount) {
      const p = previa.rows[0];
      if (p.estado === 'aceptada') return res.status(409).json({ error: 'Ya son amigos' });
      if (p.solicitante_id === otro) {
        // Esa persona ya te habia enviado solicitud: se aceptan mutuamente
        await pool.query("UPDATE amistades SET estado = 'aceptada' WHERE id = $1", [p.id]);
        return res.json({ estado: 'aceptada' });
      }
      return res.status(409).json({ error: 'Ya enviaste una solicitud a esta persona' });
    }
    await pool.query('INSERT INTO amistades (solicitante_id, destinatario_id) VALUES ($1, $2)', [yo, otro]);
    res.status(201).json({ estado: 'pendiente' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe una solicitud con esta persona' });
    error500(res, err);
  }
});

// POST /api/amigos/:id/aceptar  (solo quien recibio la solicitud)
router.post('/:id/aceptar', async (req, res) => {
  try {
    const id = idDe(req.params.id);
    if (!id) return res.status(400).json({ error: 'Solicitud no válida' });
    const r = await pool.query(
      "UPDATE amistades SET estado = 'aceptada' WHERE id = $1 AND destinatario_id = $2 AND estado = 'pendiente'",
      [id, req.usuario.id]
    );
    if (!r.rowCount) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

// DELETE /api/amigos/:id  (rechazar, cancelar o quitar amigo; cualquiera de los dos)
router.delete('/:id', async (req, res) => {
  try {
    const id = idDe(req.params.id);
    if (!id) return res.status(400).json({ error: 'Solicitud no válida' });
    const yo = req.usuario.id;
    const r = await pool.query(
      'DELETE FROM amistades WHERE id = $1 AND (solicitante_id = $2 OR destinatario_id = $2)',
      [id, yo]
    );
    if (!r.rowCount) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (err) { error500(res, err); }
});

module.exports = router;

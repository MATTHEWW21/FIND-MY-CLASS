const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Una sesion deja de servir si: se cerro (revocada), pasaron 7 dias sin usarla, pasaron 90 dias desde que se inicio, o la cuenta se suspendio.
const DIAS_INACTIVIDAD = 7;
const DIAS_MAXIMO = 90;

// Valida el token y deja los datos en req.usuario ({ id, rol, sid } o { rol:'visitante', invitado:true })
async function verificarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sesión requerida' });

  let datos;
  try {
    datos = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }

  // Visitantes: token corto sin cuenta
  if (datos.invitado) { req.usuario = datos; return next(); }

  // Tokens sin sesion (de antes de esta version): hay que volver a iniciar sesion una vez
  if (!datos.sid || !datos.id) return res.status(401).json({ error: 'Sesión inválida o expirada' });

  try {
    const { rows } = await pool.query(
      `SELECT s.ultimo_uso, u.rol
         FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.id = $1 AND s.usuario_id = $2 AND NOT s.revocada AND u.activo
          AND s.ultimo_uso > NOW() - ($3 || ' days')::interval
          AND s.creado_en  > NOW() - ($4 || ' days')::interval`,
      [datos.sid, datos.id, DIAS_INACTIVIDAD, DIAS_MAXIMO]);
    if (!rows.length) return res.status(401).json({ error: 'Sesión inválida o expirada' });

    // "Ultimo uso" se renueva como maximo cada hora para no escribir en cada peticion
    if (Date.now() - new Date(rows[0].ultimo_uso).getTime() > 60 * 60 * 1000) {
      pool.query('UPDATE sesiones SET ultimo_uso = NOW() WHERE id = $1', [datos.sid]).catch(() => {});
    }
    req.usuario = { id: datos.id, rol: rows[0].rol, sid: datos.sid };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Restringe una ruta a ciertos roles. Uso: requerirRol('estudiante', 'colaborador')
function requerirRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, requerirRol, DIAS_MAXIMO };

const pool = require('../config/db');

// Amigos y mensajes son solo para estudiantes y colaboradores en vista completa
// (igual que el feed). Se revisa en la base por si la vista cambio despues de iniciar sesion.
async function soloVistaCompleta(req, res, next) {
    try {
        const { rows } = await pool.query(
            'SELECT rol, vista_preferida FROM usuarios WHERE id = $1 AND verificado = TRUE',
            [req.usuario.id]
        );
        const u = rows[0];
        if (!u || (u.rol === 'colaborador' && u.vista_preferida === 'simplificada')) {
            return res.status(403).json({ error: 'Tu vista no incluye esta función' });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { soloVistaCompleta };
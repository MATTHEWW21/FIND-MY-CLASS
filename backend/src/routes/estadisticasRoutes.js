const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');

const router = express.Router();

// Solo cifras agregadas (conteos y sumas): no devuelve nombres, correos ni mensajes de nadie.
// Se protege con la misma llave de administrador del .env (ADMIN_API_KEY), enviada en el encabezado x-admin-key.
// Si ADMIN_API_KEY no está definida, el panel queda desactivado.
function requerirAdmin(req, res, next) {
    const esperada = process.env.ADMIN_API_KEY || '';
    const recibida = String(req.headers['x-admin-key'] || '');
    const a = Buffer.from(esperada);
    const b = Buffer.from(recibida);
    const ok = esperada.length >= 16 && a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) return res.status(403).json({ status: 'fail', message: 'Llave incorrecta' });
    next();
}

// Frena a quien intente adivinar la llave: 30 intentos cada 15 min por IP
const limitador = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Demasiados intentos, espera unos minutos' },
});

// Cada consulta va por separado: si una tabla todavía no existe, esa parte sale vacía y el resto funciona
async function filas(sql) {
    try {
        return (await pool.query(sql)).rows;
    } catch (err) {
        console.error('estadisticas:', err.message);
        return null;
    }
}
const uno = async (sql) => {
    const r = await filas(sql);
    return r && r[0] ? r[0] : null;
};
const num = (v) => (v === null || v === undefined ? 0 : Number(v));

// Serie de los últimos N días con ceros en los días sin datos
function serieDias(rows, dias) {
    const mapa = new Map((rows || []).map((r) => [r.dia, num(r.n)]));
    const out = [];
    // Los días se cuentan en hora de Guadalajara, igual que en las consultas
    const hoyTxt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date()); // AAAA-MM-DD
    const [y, m, dd] = hoyTxt.split('-').map(Number);
    for (let i = dias - 1; i >= 0; i--) {
        const clave = new Date(Date.UTC(y, m - 1, dd - i)).toISOString().slice(0, 10);
        out.push({ dia: clave, n: mapa.get(clave) || 0 });
    }
    return out;
}

// GET /api/estadisticas
router.get('/', limitador, requerirAdmin, async (req, res) => {
    const [
        usuariosTot, usuariosRol, usuariosDia,
        actTot, actTipo, actOrigen, actDia,
        pubTot, interacciones, reportes,
        incTot, incCat, incEstado,
        califs, sos, sosTipo, msjs, amigos,
        mapaDatos,
    ] = await Promise.all([
        uno(`SELECT COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE verificado) AS verificados,
                    COUNT(*) FILTER (WHERE vista_preferida = 'simplificada') AS simplificada,
                    COUNT(*) FILTER (WHERE creado_en >= NOW() - INTERVAL '7 days') AS nuevos_7d
             FROM usuarios`),
        filas(`SELECT rol, COUNT(*) AS n FROM usuarios GROUP BY rol ORDER BY n DESC`),
        filas(`SELECT TO_CHAR(creado_en::date, 'YYYY-MM-DD') AS dia, COUNT(*) AS n
               FROM (SELECT (creado_en AT TIME ZONE 'UTC') AT TIME ZONE 'America/Mexico_City' AS creado_en FROM usuarios) u
               WHERE creado_en >= NOW() - INTERVAL '31 days' GROUP BY 1`),

        uno(`SELECT COUNT(*) AS total,
                    COALESCE(SUM(distancia_m), 0) AS metros,
                    COALESCE(SUM(duracion_s), 0) AS segundos,
                    COALESCE(SUM(calorias), 0) AS calorias,
                    COUNT(DISTINCT usuario_id) AS personas
             FROM actividades`),
        filas(`SELECT tipo, COUNT(*) AS n FROM actividades GROUP BY tipo ORDER BY n DESC`),
        filas(`SELECT origen, COUNT(*) AS n FROM actividades GROUP BY origen ORDER BY n DESC`),
        filas(`SELECT TO_CHAR(creado_en::date, 'YYYY-MM-DD') AS dia, COUNT(*) AS n
               FROM (SELECT creado_en AT TIME ZONE 'America/Mexico_City' AS creado_en FROM actividades) a
               WHERE creado_en >= NOW() - INTERVAL '31 days' GROUP BY 1`),

        uno(`SELECT COUNT(*) AS total, COUNT(DISTINCT usuario_id) AS personas FROM publicaciones`),
        uno(`SELECT (SELECT COUNT(*) FROM publicacion_likes) AS likes,
                    (SELECT COUNT(*) FROM publicacion_comentarios) AS comentarios,
                    (SELECT COUNT(*) FROM publicacion_fotos) AS fotos`),
        uno(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE estado = 'abierto') AS abiertos FROM publicacion_reportes`),

        uno(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE estado <> 'resuelta') AS pendientes FROM incidencias`),
        filas(`SELECT categoria, COUNT(*) AS n FROM incidencias GROUP BY categoria ORDER BY n DESC`),
        filas(`SELECT estado, COUNT(*) AS n FROM incidencias GROUP BY estado ORDER BY n DESC`),

        uno(`SELECT COUNT(*) AS total, ROUND(AVG(estrellas)::numeric, 2) AS promedio FROM calificaciones`),
        uno(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE estado = 'nueva') AS nuevas FROM sos_alertas`),
        filas(`SELECT tipo, COUNT(*) AS n FROM sos_alertas GROUP BY tipo ORDER BY n DESC`),
        uno(`SELECT COUNT(*) AS total FROM mensajes`),
        uno(`SELECT COUNT(*) AS total FROM amistades WHERE estado = 'aceptada'`),

        uno(`SELECT (SELECT COUNT(*) FROM edificios) AS edificios,
                    (SELECT COUNT(*) FROM aulas) AS aulas,
                    (SELECT COUNT(*) FROM puntos) AS puntos,
                    (SELECT COUNT(*) FROM rutas) AS tramos,
                    (SELECT COUNT(*) FROM rutas WHERE tipo = 'escaleras') AS escaleras,
                    (SELECT COUNT(*) FROM rutas WHERE tipo = 'rampa') AS rampas`),
    ]);

    const lista = (rows, clave) => (rows || []).map((r) => ({ nombre: r[clave], n: num(r.n) }));

    res.json({
        status: 'success',
        generado_en: new Date().toISOString(),
        usuarios: {
            total: num(usuariosTot?.total),
            verificados: num(usuariosTot?.verificados),
            vista_simplificada: num(usuariosTot?.simplificada),
            nuevos_7d: num(usuariosTot?.nuevos_7d),
            por_rol: lista(usuariosRol, 'rol'),
            por_dia: serieDias(usuariosDia, 30),
        },
        actividades: {
            total: num(actTot?.total),
            personas: num(actTot?.personas),
            km: Math.round(num(actTot?.metros) / 10) / 100,
            horas: Math.round(num(actTot?.segundos) / 36) / 100,
            calorias: num(actTot?.calorias),
            por_tipo: lista(actTipo, 'tipo'),
            por_origen: lista(actOrigen, 'origen'),
            por_dia: serieDias(actDia, 30),
        },
        comunidad: {
            publicaciones: num(pubTot?.total),
            autores: num(pubTot?.personas),
            likes: num(interacciones?.likes),
            comentarios: num(interacciones?.comentarios),
            fotos: num(interacciones?.fotos),
            reportes: num(reportes?.total),
            reportes_abiertos: num(reportes?.abiertos),
            mensajes: num(msjs?.total),
            amistades: num(amigos?.total),
        },
        incidencias: {
            total: num(incTot?.total),
            pendientes: num(incTot?.pendientes),
            por_categoria: lista(incCat, 'categoria'),
            por_estado: lista(incEstado, 'estado'),
        },
        calificaciones: { total: num(califs?.total), promedio: califs?.promedio === null || califs?.promedio === undefined ? null : Number(califs.promedio) },
        sos: { total: num(sos?.total), nuevas: num(sos?.nuevas), por_tipo: lista(sosTipo, 'tipo') },
        mapa: {
            edificios: num(mapaDatos?.edificios),
            aulas: num(mapaDatos?.aulas),
            puntos: num(mapaDatos?.puntos),
            tramos: num(mapaDatos?.tramos),
            escaleras: num(mapaDatos?.escaleras),
            rampas: num(mapaDatos?.rampas),
        },
    });
});

module.exports = router;

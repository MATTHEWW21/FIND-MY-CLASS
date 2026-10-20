const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verificarToken, requerirRol } = require('../middleware/auth');

const router = express.Router();
router.use(verificarToken, requerirRol('estudiante', 'colaborador'));

const PESO_KG = 70; // peso de referencia (aproximado), el mismo que usa "Nueva publicacion"
const MET = { caminata: 3.5, carrera: 9, ciclismo: 6.8, inclusivo: 3, scooter: 4 };
// Velocidad maxima creible (m/s) por actividad: sirve para descartar datos imposibles
const VEL_MAX = { caminata: 4, carrera: 9, ciclismo: 20, inclusivo: 5, scooter: 12 };
const ZONA = 'America/Mexico_City';

const limiteGuardar = rateLimit({ windowMs: 15 * 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false, message: { error: 'Guardaste muchas actividades seguidas, espera un momento' } });
const error500 = (res, err) => { console.error(err); res.status(500).json({ error: 'Error interno del servidor' }); };
const entero = (v) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Math.round(Number(v)) : null);

const calorias = (tipo, duracionS) => Math.round(MET[tipo] * PESO_KG * (duracionS / 3600));

// POST /api/actividades { tipo, distancia_m, duracion_s, origen?, destino? }
router.post('/', limiteGuardar, async (req, res) => {
  try {
    const b = req.body || {};
    const tipo = String(b.tipo || '');
    const distancia = entero(b.distancia_m);
    const duracion = entero(b.duracion_s);
    const origen = b.origen === 'mapa' ? 'mapa' : 'tracker';
    const destino = typeof b.destino === 'string' && b.destino.trim() ? b.destino.trim().slice(0, 120) : null;

    if (!MET[tipo]) return res.status(400).json({ error: 'Tipo de actividad no válido' });
    if (distancia === null || distancia < 0 || distancia > 200000 || duracion === null || duracion < 1 || duracion > 86400) {
      return res.status(400).json({ error: 'Distancia o duración no válidas' });
    }
    if (distancia / duracion > VEL_MAX[tipo]) {
      return res.status(400).json({ error: 'La velocidad registrada no es posible para esta actividad' });
    }
    // Las calorias se calculan aqui: no se confia en el valor que mande el telefono
    const cal = calorias(tipo, duracion);
    const { rows } = await pool.query(
      `INSERT INTO actividades (usuario_id, tipo, origen, distancia_m, duracion_s, calorias, destino)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, tipo, origen, distancia_m, duracion_s, calorias, destino, creado_en`,
      [req.usuario.id, tipo, origen, distancia, duracion, cal, destino]
    );
    res.status(201).json(rows[0]);
  } catch (err) { error500(res, err); }
});

// ---------- Racha y premios ----------
const MS_DIA = 24 * 3600 * 1000;
const aMs = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const lunesDe = (ms) => ms - ((new Date(ms).getUTCDay() + 6) % 7) * MS_DIA; // la semana empieza el lunes

// Racha: periodos seguidos con al menos una actividad. Si hoy (o esta semana) aun no hay, la racha no se pierde todavia.
function rachas(diasIso, hoyIso) {
  const hoy = aMs(hoyIso);
  const dias = new Set(diasIso.map(aMs));
  const semanas = new Set(diasIso.map((d) => lunesDe(aMs(d))));

  const contar = (conjunto, paso, inicio) => {
    let n = 0;
    let t = conjunto.has(inicio) ? inicio : inicio - paso;
    while (conjunto.has(t)) { n++; t -= paso; }
    return n;
  };
  const mejor = Array.from(semanas).sort((a, b) => a - b).reduce((acc, t) => {
    const racha = semanas.has(t - 7 * MS_DIA) ? acc.actual + 1 : 1;
    return { actual: racha, max: Math.max(acc.max, racha) };
  }, { actual: 0, max: 0 }).max;

  return {
    racha_semanas: contar(semanas, 7 * MS_DIA, lunesDe(hoy)),
    mejor_racha_semanas: mejor,
    dias_activo: contar(dias, MS_DIA, hoy),
  };
}

const km = (m) => (m / 1000).toFixed(1).replace(/\.0$/, '');
function premios(s) {
  const lista = [
    { clave: 'primera',  icono: '⭐', color: 'blue',  nombre: 'Primera actividad',  descripcion: 'Registra tu primera actividad',
      ok: s.total >= 1, progreso: `${Math.min(s.total, 1)}/1` },
    { clave: 'diez',     icono: '🏅', color: 'green', nombre: '10 actividades',     descripcion: 'Registra 10 actividades',
      ok: s.total >= 10, progreso: `${Math.min(s.total, 10)}/10` },
    { clave: 'km5',      icono: '🎖️', color: 'red',   nombre: '5 km acumulados',    descripcion: 'Suma 5 km entre todas tus actividades',
      ok: s.metros >= 5000, progreso: `${km(Math.min(s.metros, 5000))}/5 km` },
    { clave: 'larga',    icono: '🥇', color: 'blue',  nombre: 'Recorrido de 5 km',  descripcion: 'Haz una actividad de 5 km o más',
      ok: s.maxMetros >= 5000, progreso: `${km(Math.min(s.maxMetros, 5000))}/5 km` },
    { clave: 'racha4',   icono: '🔥', color: 'green', nombre: '4 semanas seguidas', descripcion: 'Mantén una racha de 4 semanas',
      ok: s.mejor_racha_semanas >= 4, progreso: `${Math.min(s.mejor_racha_semanas, 4)}/4` },
    { clave: 'km25',     icono: '🏆', color: 'red',   nombre: '25 km acumulados',   descripcion: 'Suma 25 km entre todas tus actividades',
      ok: s.metros >= 25000, progreso: `${km(Math.min(s.metros, 25000))}/25 km` },
  ];
  return lista.map(({ ok, ...p }) => ({ ...p, obtenido: ok }));
}

// GET /api/actividades/resumen -> todo lo que muestra el perfil
router.get('/resumen', async (req, res) => {
  try {
    const yo = req.usuario.id;
    const [tot, rec, dias, hoy] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total, COALESCE(SUM(distancia_m), 0)::int AS metros,
                COALESCE(SUM(duracion_s), 0)::int AS segundos, COALESCE(MAX(distancia_m), 0)::int AS max_metros
           FROM actividades WHERE usuario_id = $1`, [yo]),
      pool.query(
        `SELECT id, tipo, distancia_m, duracion_s, calorias, destino, creado_en,
                (creado_en AT TIME ZONE '${ZONA}')::date::text AS dia
           FROM actividades WHERE usuario_id = $1 ORDER BY creado_en DESC, id DESC LIMIT 20`, [yo]),
      pool.query(
        `SELECT DISTINCT (creado_en AT TIME ZONE '${ZONA}')::date::text AS dia
           FROM actividades WHERE usuario_id = $1 ORDER BY dia DESC LIMIT 500`, [yo]),
      pool.query(`SELECT (NOW() AT TIME ZONE '${ZONA}')::date::text AS hoy, ((NOW() AT TIME ZONE '${ZONA}')::date - 1)::text AS ayer`),
    ]);
    const t = tot.rows[0];
    const r = rachas(dias.rows.map((x) => x.dia), hoy.rows[0].hoy);
    const stats = { total: t.total, metros: t.metros, maxMetros: t.max_metros, mejor_racha_semanas: r.mejor_racha_semanas };
    res.json({
      hoy: hoy.rows[0].hoy,
      ayer: hoy.rows[0].ayer,
      total_actividades: t.total,
      total_metros: t.metros,
      total_segundos: t.segundos,
      ...r,
      recientes: rec.rows,
      premios: premios(stats),
    });
  } catch (err) { error500(res, err); }
});

module.exports = router;
module.exports._interno = { rachas, premios, calorias };

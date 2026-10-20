const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/mapa/lugares
// Todo lo que se puede mostrar en el mapa y buscar: edificios + lugares/servicios que ya tienen coordenadas.
// El buscador del frontend filtra esta lista (son ~100 elementos, así que es rápido y no necesita un endpoint por búsqueda).
router.get('/lugares', async (req, res) => {
  try {
    const edificios = await pool.query(
        `SELECT id, codigo, nombre, latitud, longitud
         FROM edificios
         WHERE latitud IS NOT NULL AND longitud IS NOT NULL
         ORDER BY codigo`
    );
    const servicios = await pool.query(
        `SELECT id, nombre, tipo, numero_mapa, latitud, longitud, es_accesible
         FROM servicios
         WHERE latitud IS NOT NULL AND longitud IS NOT NULL AND tipo IS NOT NULL
         ORDER BY tipo, numero_mapa, id`
    );

    const lista = [
      ...edificios.rows.map((e) => ({
        clave: `edificio-${e.id}`,
        tipo: 'edificio',
        nombre: e.nombre,
        codigo: e.codigo,
        numero: null,
        lat: Number(e.latitud),
        lng: Number(e.longitud),
        es_accesible: null,
      })),
      ...servicios.rows.map((s) => ({
        clave: `servicio-${s.id}`,
        tipo: s.tipo,
        nombre: s.nombre,
        codigo: null,
        numero: s.numero_mapa,
        lat: Number(s.latitud),
        lng: Number(s.longitud),
        es_accesible: s.es_accesible,
      })),
    ];
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/mapa/grafo
// La red de caminos: puntos (nodos) y rutas (tramos entre dos puntos). Con esto el frontend calcula el camino mas corto.
router.get('/grafo', async (req, res) => {
  try {
    const puntos = await pool.query(
        `SELECT id, nombre, latitud, longitud, es_accesible FROM puntos ORDER BY id`
    );
    const rutas = await pool.query(
        `SELECT *
         FROM rutas
         WHERE origen_punto_id IS NOT NULL AND destino_punto_id IS NOT NULL
         ORDER BY id`
    );
    res.json({
      puntos: puntos.rows.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        lat: Number(p.latitud),
        lng: Number(p.longitud),
        es_accesible: p.es_accesible !== false,
      })),
      rutas: rutas.rows.map((r) => ({
        id: r.id,
        origen: r.origen_punto_id,
        destino: r.destino_punto_id,
        metros: r.distancia_metros === null ? null : Number(r.distancia_metros),
        es_accesible: r.es_accesible !== false,
        tipo: r.tipo || (r.es_accesible === false ? 'escaleras' : 'normal'),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
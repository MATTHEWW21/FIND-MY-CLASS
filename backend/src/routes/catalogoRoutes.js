const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Listas para los desplegables (solo lectura, sin datos sensibles).

router.get('/edificios', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, codigo, nombre FROM edificios ORDER BY codigo, nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/carreras', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre FROM carreras ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Estancias del colaborador según su espacio de trabajo: ?tipo=sala_maestro | cubiculo_oficina
const TIPOS_ESPACIO = ['sala_maestro', 'cubiculo_oficina'];

router.get('/estancias', async (req, res) => {
  try {
    const tipo = String(req.query.tipo || '');
    if (!TIPOS_ESPACIO.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de espacio no válido' });
    }
    const { rows } = await pool.query(
      `SELECT a.id,
              e.nombre || ', ' || CASE WHEN a.piso = 0 THEN 'PB' ELSE 'P' || a.piso END || ', ' || a.codigo AS etiqueta
         FROM aulas a
         JOIN edificios e ON e.id = a.edificio_id
        WHERE a.tipo = $1
        ORDER BY e.codigo, a.piso, a.codigo`,
      [tipo]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/edificios -> Obtener todos los edificios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM edificios ORDER BY id ASC');
        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al obtener edificios' });
    }
});

// GET /api/edificios/:id -> Obtener un edificio especifico con sus servicios
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const edificioResult = await pool.query('SELECT * FROM edificios WHERE id = $1', [id]);

        if (edificioResult.rows.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'Edificio no encontrado' });
        }

        // Obtener los servicios asociados a este edificio
        const serviciosResult = await pool.query('SELECT * FROM servicios WHERE edificio_id = $1', [id]);

        const edificio = edificioResult.rows[0];
        edificio.servicios = serviciosResult.rows;

        res.json({
            status: 'success',
            data: edificio
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al obtener el edificio' });
    }
});

// POST /api/edificios -> Crear un edificio
router.post('/', async (req, res) => {
    const { nombre, codigo, categoria_id, latitud, longitud, imagen_url } = req.body;

    if (!nombre || !latitud || !longitud) {
        return res.status(400).json({
            status: 'fail',
            message: 'Los campos nombre, latitud y longitud son obligatorios'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO edificios (nombre, codigo, categoria_id, latitud, longitud, imagen_url) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre, codigo, categoria_id || null, latitud, longitud, imagen_url || null]
        );

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al registrar el edificio' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/servicios -> Obtener todos los servicios (con opcion de filtrar por es_accesible)
router.get('/', async (req, res) => {
    const { solo_accesibles } = req.query;
    try {
        let query = 'SELECT * FROM servicios';
        const queryParams = [];

        if (solo_accesibles === 'true') {
            query += ' WHERE es_accesible = $1';
            queryParams.push(true);
        }

        query += ' ORDER BY id ASC';

        const result = await pool.query(query, queryParams);
        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al obtener servicios' });
    }
});

module.exports = router;
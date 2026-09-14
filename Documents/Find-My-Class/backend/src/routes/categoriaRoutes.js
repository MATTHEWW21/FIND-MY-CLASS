const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/categorias -> Obtener todas las categorias
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al obtener categorías' });
    }
});

module.exports = router;
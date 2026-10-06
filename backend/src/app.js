const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
require('dotenv').config();

// Importar rutas
const edificioRoutes = require('./routes/edificioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const servicioRoutes = require('./routes/servicioRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir los archivos estáticos del frontend para abrirlos desde el cel o navegador
app.use(express.static(path.join(__dirname, '../../frontend')));

// Montar rutas de la API
app.use('/api/edificios', edificioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/servicios', servicioRoutes);

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'OK',
            message: 'API Find My Class en línea',
            db_time: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'ERROR', message: 'Falla al conectar a la Base de Datos' });
    }
});

// IMPORTANTE: Agregamos '0.0.0.0' para escuchar en toda la red local
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
const express = require('express');
const cors = require('cors');
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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
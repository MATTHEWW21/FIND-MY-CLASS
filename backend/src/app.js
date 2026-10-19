const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
require('dotenv').config();

// Importar rutas
const edificioRoutes = require('./routes/edificioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const authRoutes = require('./routes/authRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const mapaRoutes = require('./routes/mapaRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
// Las publicaciones llevan fotos (base64): este límite mayor va ANTES del express.json() general
app.use('/api/publicaciones', express.json({ limit: '8mb' }));
app.use(express.json());

// Servir los archivos estáticos del frontend para abrirlos desde el cel o navegador
app.use(express.static(path.join(__dirname, '../../frontend')));

// Fotos de las publicaciones (se guardan en backend/uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// Montar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/catalogos', catalogoRoutes);
app.use('/api/mapa', mapaRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/publicaciones', publicacionRoutes);
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
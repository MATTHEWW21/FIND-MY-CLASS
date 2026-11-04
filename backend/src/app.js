require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./config/db');
const { cabecerasSeguras, corsConfig, apiNoEncontrada, manejadorErrores } = require('./middleware/seguridad');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('Falta JWT_SECRET en el .env (minimo 32 caracteres).');
    process.exit(1);
}

const edificioRoutes = require('./routes/edificioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const authRoutes = require('./routes/authRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const mapaRoutes = require('./routes/mapaRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const amigoRoutes = require('./routes/amigoRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const sosRoutes = require('./routes/sosRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes');
const moderacionRoutes = require('./routes/moderacionRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

app.use(cabecerasSeguras);
app.use(corsConfig());
app.use('/api/publicaciones', express.json({ limit: '8mb' }));
app.use('/api/mensajes', express.json({ limit: '3mb' }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/catalogos', catalogoRoutes);
app.use('/api/mapa', mapaRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/amigos', amigoRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/actividades', actividadRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/moderacion', moderacionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/edificios', edificioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/servicios', servicioRoutes);

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

app.use('/api', apiNoEncontrada);
app.use(manejadorErrores);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

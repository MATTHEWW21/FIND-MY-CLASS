const cors = require('cors');

const CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'"
].join('; ');

function cabecerasSeguras(req, res, next) {
    if (!req.path.startsWith('/herramienta_')) res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self), camera=(self), payment=(), usb=()');
    res.removeHeader('X-Powered-By');
    next();
}

function corsConfig() {
    const lista = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (lista.length) return cors({ origin: lista });
    if (process.env.NODE_ENV === 'production') return (req, res, next) => next();
    return cors();
}

function apiNoEncontrada(req, res) {
    res.status(404).json({ error: 'No encontrado' });
}

function manejadorErrores(err, req, res, next) {
    if (res.headersSent) return next(err);
    if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'El archivo o los datos son demasiado grandes' });
    if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) return res.status(400).json({ error: 'Datos mal formados' });
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { cabecerasSeguras, corsConfig, apiNoEncontrada, manejadorErrores };

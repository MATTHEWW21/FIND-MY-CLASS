const cors = require('cors');

// Cabeceras que le dicen al navegador que sea mas estricto. No usamos una politica CSP porque el mapa carga Leaflet de unpkg
// y varias paginas tienen estilos en linea; con esto no se rompe nada y se cubre lo basico.
function cabecerasSeguras(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');                 // no adivinar tipos de archivo
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');                     // que otra pagina no meta la app en un iframe
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // El mapa necesita ubicacion y la guia por voz el microfono; el resto de permisos se apagan
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self), camera=(self), payment=(), usb=()');
    res.removeHeader('X-Powered-By');
    next();
}

// La app y la API salen del mismo servidor, asi que normalmente no hace falta CORS.
//  - CORS_ORIGIN en el .env (varios separados por coma): solo esos origenes.
//  - Sin CORS_ORIGIN y en desarrollo: abierto (como antes, para probar desde WebStorm o el celular).
//  - Sin CORS_ORIGIN y NODE_ENV=production: cerrado.
function corsConfig() {
    const lista = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (lista.length) return cors({ origin: lista });
    if (process.env.NODE_ENV === 'production') return (req, res, next) => next();
    return cors();
}

// Ruta de API que no existe: responde JSON (antes salia una pagina HTML de error)
function apiNoEncontrada(req, res) {
    res.status(404).json({ error: 'No encontrado' });
}

// Cualquier error sin atrapar: se registra en el servidor y a la persona solo le llega un mensaje general (nunca el stack)
// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, req, res, next) {
    if (res.headersSent) return next(err);
    if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'El archivo o los datos son demasiado grandes' });
    if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) return res.status(400).json({ error: 'Datos mal formados' });
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { cabecerasSeguras, corsConfig, apiNoEncontrada, manejadorErrores };

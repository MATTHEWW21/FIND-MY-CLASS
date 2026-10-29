const path = require('path');

const NOMBRE_VALIDO = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

// Envia una foto guardada en disco. Solo se llama despues de comprobar que la persona tiene permiso de verla.
function enviarFoto(res, carpeta, archivo) {
  res.sendFile(archivo, {
    root: carpeta,
    dotfiles: 'deny',
    headers: { 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' },
  }, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'No encontramos esa foto' });
  });
}

module.exports = { NOMBRE_VALIDO, enviarFoto };

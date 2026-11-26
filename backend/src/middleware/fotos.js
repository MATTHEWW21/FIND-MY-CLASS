const path = require('path');

const NOMBRE_VALIDO = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

function decodificarFoto(dataUrl, maxBytes) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(typeof dataUrl === 'string' ? dataUrl : '');
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length || buf.length > maxBytes) return null;
  const esJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const esPng = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const esWebp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
  const ext = esJpg ? 'jpg' : esPng ? 'png' : esWebp ? 'webp' : null;
  return ext ? { buf, ext } : null;
}

function enviarFoto(res, carpeta, archivo) {
  res.sendFile(archivo, {
    root: carpeta,
    dotfiles: 'deny',
    headers: { 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' },
  }, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'No encontramos esa foto' });
  });
}

module.exports = { NOMBRE_VALIDO, enviarFoto, decodificarFoto };

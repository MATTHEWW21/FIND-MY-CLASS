const express = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Frena fuerza bruta en endpoints sensibles: 20 intentos cada 15 min por IP
const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, intenta más tarde' },
});

router.post('/registro', limitador, ctrl.registro);
router.post('/verificar', limitador, ctrl.verificarCuenta);
router.post('/reenviar-codigo', limitador, ctrl.reenviarCodigo);
router.post('/login', limitador, ctrl.login);
router.post('/invitado', ctrl.invitado);
router.post('/olvide-password', limitador, ctrl.olvidePassword);
router.post('/restablecer-password', limitador, ctrl.restablecerPassword);

router.get('/me', verificarToken, ctrl.me);
router.patch('/me', verificarToken, ctrl.actualizarPerfil);
router.put('/me/preferencias', verificarToken, ctrl.actualizarPreferencias);

module.exports = router;

const express = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Frena fuerza bruta. Cada grupo lleva su propio contador por IP, para que unos no gasten los intentos de otros.
const mensajeLimite = { error: 'Demasiados intentos, intenta más tarde' };
const base = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false, message: mensajeLimite };

// Iniciar sesion: 10 fallos cada 15 min (los inicios de sesion correctos no cuentan)
const limitadorLogin = rateLimit({ ...base, max: 10, skipSuccessfulRequests: true });
// Registro, codigos y contraseñas: 20 cada 15 min
const limitador = rateLimit({ ...base, max: 20 });
// Entrar como invitado: antes no tenia limite
const limitadorInvitado = rateLimit({ ...base, max: 60 });

router.post('/registro', limitador, ctrl.registro);
router.post('/verificar', limitador, ctrl.verificarCuenta);
router.post('/reenviar-codigo', limitador, ctrl.reenviarCodigo);
router.post('/login', limitadorLogin, ctrl.login);
router.post('/invitado', limitadorInvitado, ctrl.invitado);
router.post('/olvide-password', limitador, ctrl.olvidePassword);
router.post('/restablecer-password', limitador, ctrl.restablecerPassword);

router.get('/me', verificarToken, ctrl.me);
router.patch('/me', verificarToken, ctrl.actualizarPerfil);
router.post('/me/password', verificarToken, limitadorLogin, ctrl.cambiarPassword);
router.put('/me/preferencias', verificarToken, ctrl.actualizarPreferencias);

module.exports = router;
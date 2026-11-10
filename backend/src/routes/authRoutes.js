const express = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

const mensajeLimite = { error: 'Demasiados intentos, intenta más tarde' };
const base = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false, message: mensajeLimite };

const limitadorLogin = rateLimit({ ...base, max: 10, skipSuccessfulRequests: true });
const limitador = rateLimit({ ...base, max: 20 });
const limitadorInvitado = rateLimit({ ...base, max: 60 });

router.post('/registro', limitador, ctrl.registro);
router.post('/verificar', limitador, ctrl.verificarCuenta);
router.post('/reenviar-codigo', limitador, ctrl.reenviarCodigo);
router.post('/login', limitadorLogin, ctrl.login);
router.post('/invitado', limitadorInvitado, ctrl.invitado);
router.post('/olvide-password', limitador, ctrl.olvidePassword);
router.post('/restablecer-password', limitador, ctrl.restablecerPassword);

router.post('/logout', verificarToken, ctrl.logout);
router.post('/logout-todas', verificarToken, limitador, ctrl.logoutTodas);
router.get('/sesiones', verificarToken, ctrl.listarSesiones);
router.delete('/sesiones/:id', verificarToken, ctrl.cerrarSesionDe);

router.get('/me', verificarToken, ctrl.me);
router.patch('/me', verificarToken, ctrl.actualizarPerfil);
router.post('/me/password', verificarToken, limitadorLogin, ctrl.cambiarPassword);
router.delete('/me', verificarToken, limitadorLogin, ctrl.eliminarCuenta);
router.post('/me/tutorial-visto', verificarToken, ctrl.tutorialVisto);
router.put('/me/preferencias', verificarToken, ctrl.actualizarPreferencias);

module.exports = router;
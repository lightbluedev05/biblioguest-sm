const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth_controller');
const auth = require('../middleware/authMiddleware');

// ============================================================
// RUTAS PÚBLICAS
// ============================================================

// Login universal (estudiante, bibliotecario, administrador)
router.post('/login', controller.login);

// Setup inicial - crear primer admin (solo funciona si no hay admins)
router.post('/setup', controller.setup);

// Registro de estudiante (público para auto-registro)
router.post('/registro/estudiante', auth.optionalToken, controller.registroEstudiante);

// ============================================================
// RUTAS PROTEGIDAS
// ============================================================

// Obtener perfil del usuario autenticado
router.get('/me', auth.requireAuth, controller.getPerfil);

// Registro de bibliotecario (solo admins)
router.post('/registro/bibliotecario', auth.requireAdmin, controller.registroBibliotecario);

// Registro de administrador (solo admins)
router.post('/registro/administrador', auth.requireAdmin, controller.registroAdministrador);

module.exports = router;

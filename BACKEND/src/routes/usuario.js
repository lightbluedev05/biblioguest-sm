const express = require('express');
const router = express.Router();

const controller = require('../controllers/usuario_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// ============================================================
// RUTAS PARA ESTUDIANTES (ver sus propios datos)
// ============================================================

// Mis invitaciones pendientes a reservas de cubículo
router.get('/usuario/invitaciones', auth.requireAuth, controller.getMisInvitaciones);

// Mis reservas de cubículo (donde soy parte del grupo)
router.get('/usuario/mis-reservas-cubiculo', auth.requireAuth, controller.getMisReservasCubiculo);

// ============================================================
// RUTAS PARA BIBLIO/ADMIN (gestión de usuarios)
// ============================================================

// Buscar usuarios con filtros y paginación
router.get('/usuario', auth.requireBibliotecarioOrAdmin, validation.validatePagination, controller.getUsuarios);

// Detalle de un usuario
router.get('/usuario/:id', auth.requireBibliotecarioOrAdmin, controller.getUsuarioById);

// Actividad del usuario (reservas/préstamos activos)
router.get('/usuario/:id/actividad', auth.requireBibliotecarioOrAdmin, controller.getUsuarioActividad);

// Crear usuario (estudiante)
router.post('/usuario', auth.requireBibliotecarioOrAdmin, controller.createUsuario);

// Actualizar usuario
router.put('/usuario/:id', auth.requireBibliotecarioOrAdmin, controller.updateUsuario);

// Eliminar usuario (soft delete)
router.delete('/usuario/:id', auth.requireBibliotecarioOrAdmin, controller.deleteUsuario);

module.exports = router;

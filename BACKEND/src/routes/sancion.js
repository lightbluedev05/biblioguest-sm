const express = require('express');
const router = express.Router();

const controller = require('../controllers/sancion_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// ============================================================
// RUTAS PARA ESTUDIANTES (ver sus propias sanciones)
// ============================================================

router.get('/sancion/mis-sanciones', auth.requireAuth, controller.getMisSanciones);

// ============================================================
// RUTAS PARA BIBLIO/ADMIN (gestión de sanciones)
// ============================================================

// Listar sanciones con filtros y paginación
router.get('/sancion', auth.requireBibliotecarioOrAdmin, validation.validatePagination, controller.getSanciones);

// Detalle de una sanción
router.get('/sancion/:id', auth.requireBibliotecarioOrAdmin, controller.getSancionById);

// Crear sanción
router.post('/sancion', auth.requireBibliotecarioOrAdmin, controller.createSancion);

// Modificar sanción
router.put('/sancion/:id', auth.requireBibliotecarioOrAdmin, controller.updateSancion);

// Cancelar sanción (solo admin)
router.post('/sancion/:id/cancelar', auth.requireAdmin, controller.cancelarSancion);

module.exports = router;

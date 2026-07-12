const express = require('express');
const router = express.Router();
const controller = require('../controllers/prestamoLibro_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Requiere autenticación (cualquier rol puede ver)
router.get('/prestamoLibro', auth.requireAuth, validation.validatePagination, controller.getPrestamo);
router.get('/prestamoLibro/:id', auth.requireAuth, controller.getPrestamoById);
router.get('/prestamoLibro/:id/detalle', auth.requireAuth, controller.getPrestamoDetalleById);

// Crear préstamo - Cualquier usuario autenticado
router.post('/prestamoLibro', auth.requireAuth, controller.createPrestamo);

// Cancelar - Usuario autenticado (estudiante puede cancelar el suyo)
router.post('/prestamoLibro/:id/cancelar', auth.requireAuth, controller.cancelarPrestamo);

// Operaciones de staff - Solo bibliotecarios y admins
router.post('/prestamoLibro/:id/entregar', auth.requireBibliotecarioOrAdmin, controller.asignarBibliotecario);
router.post('/prestamoLibro/:id/devolver', auth.requireBibliotecarioOrAdmin, controller.devolverPrestamo);

module.exports = router;
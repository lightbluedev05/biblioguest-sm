const express = require('express');
const router = express.Router();

const controller = require('../controllers/reservaCubiculo_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Requiere autenticación
router.get('/reservaCubiculo', auth.requireAuth, validation.validatePagination, controller.getReservaCubiculo);
router.get('/reservaCubiculo/:id', auth.requireAuth, controller.getReservaCubiculoById);
router.get('/reservaCubiculo/:id/detalle', auth.requireAuth, controller.getReservaCubiculoDetalle);

// Crear y gestionar invitaciones - Cualquier usuario autenticado
router.post('/reservaCubiculo', auth.requireAuth, controller.crearReservaCubiculo);
router.post('/reservaCubiculo/:id/aceptar', auth.requireAuth, controller.aceptarInvitacion);
router.post('/reservaCubiculo/:id/rechazar', auth.requireAuth, controller.rechazarInvitacion);
router.post('/reservaCubiculo/:id/confirmar', auth.requireAuth, controller.confirmarReserva);
router.delete('/reservaCubiculo/:id', auth.requireAuth, controller.cancelarReserva);

// Operaciones de staff - Solo bibliotecarios y admins
router.post('/reservaCubiculo/:id/ingreso', auth.requireBibliotecarioOrAdmin, controller.registrarIngreso);
router.post('/reservaCubiculo/:id/finalizar', auth.requireBibliotecarioOrAdmin, controller.finalizarReserva);

module.exports = router;

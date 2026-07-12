const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservaLaptop_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Disponibilidad - Público
router.get('/reservaLaptop/disponibilidad', controller.getDisponibilidad);

// Lectura - Requiere autenticación
router.get('/reservaLaptop', auth.requireAuth, validation.validatePagination, controller.getReserva);
router.get('/reservaLaptop/:id', auth.requireAuth, controller.getReservaByID);

// Crear y cancelar - Cualquier usuario autenticado
router.post('/reservaLaptop', auth.requireAuth, controller.crearReserva);
router.delete('/reservaLaptop/:id', auth.requireAuth, controller.cancelarReserva);

// Confirmar (Entregar) - Solo bibliotecarios y admins
router.post('/reservaLaptop/:id/confirmar', auth.requireBibliotecarioOrAdmin, controller.confirmarReserva);

// Finalizar - Solo bibliotecarios y admins
router.post('/reservaLaptop/:id/finalizar', auth.requireBibliotecarioOrAdmin, controller.finalizarReserva);

module.exports = router;

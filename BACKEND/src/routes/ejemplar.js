const express = require('express');
const router = express.Router();
const controller = require('../controllers/ejemplar_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Público (para ver disponibilidad)
router.get('/ejemplar', validation.validatePagination, controller.getEjemplar);
router.get('/ejemplar/:id', controller.getEjemplarById);

// Modificación - Solo bibliotecarios y admins
router.post('/ejemplar', auth.requireBibliotecarioOrAdmin, controller.createEjemplar);
router.put('/ejemplar/:id', auth.requireBibliotecarioOrAdmin, controller.updateEjemplar);
router.delete('/ejemplar/:id', auth.requireAdmin, controller.deleteEjemplar);

// Acciones de estado - Solo bibliotecarios y admins
router.post('/ejemplar/:id/deteriorar', auth.requireBibliotecarioOrAdmin, controller.deteriorarEjemplar);
router.post('/ejemplar/:id/restaurar', auth.requireBibliotecarioOrAdmin, controller.restaurarEjemplar);

module.exports = router;
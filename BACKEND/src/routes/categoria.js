const express = require('express');
const router = express.Router();

const controller = require('../controllers/categoria_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Público
router.get('/categoria', validation.validatePagination, controller.getCategoria);
router.get('/categoria/:id', controller.getCategoriaById);

// Modificación - Solo bibliotecarios y admins
router.post('/categoria', auth.requireBibliotecarioOrAdmin, controller.createCategoria);
router.put('/categoria/:id', auth.requireBibliotecarioOrAdmin, controller.updateCategoria);
router.delete('/categoria/:id', auth.requireAdmin, controller.deleteCategoria);

module.exports = router;

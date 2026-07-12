const express = require('express');
const router = express.Router();

const controller = require('../controllers/autor_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Público
router.get('/autor', validation.validatePagination, controller.getAutor);
router.get('/autor/:id', controller.getAutorById);

// Modificación - Solo bibliotecarios y admins
router.post('/autor', auth.requireBibliotecarioOrAdmin, controller.createAutor);
router.put('/autor/:id', auth.requireBibliotecarioOrAdmin, controller.updateAutor);
router.delete('/autor/:id', auth.requireAdmin, controller.deleteAutor);

module.exports = router;

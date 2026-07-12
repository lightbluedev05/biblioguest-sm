const express = require('express');
const router = express.Router();

const controller = require('../controllers/etiqueta_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Público
router.get('/etiqueta', validation.validatePagination, controller.getEtiqueta);
router.get('/etiqueta/:id', controller.getEtiquetaById);

// Modificación - Solo bibliotecarios y admins
router.post('/etiqueta', auth.requireBibliotecarioOrAdmin, controller.createEtiqueta);
router.put('/etiqueta/:id', auth.requireBibliotecarioOrAdmin, controller.updateEtiqueta);
router.delete('/etiqueta/:id', auth.requireAdmin, controller.deleteEtiqueta);

module.exports = router;

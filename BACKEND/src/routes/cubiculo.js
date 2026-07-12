const express = require('express');
const router = express.Router();

const controller = require('../controllers/cubiculo_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Público (para ver disponibilidad)
router.get('/cubiculo', validation.validatePagination, controller.getCubiculo);
router.get('/cubiculo/:id', controller.getCubiculoById);

// Modificación - Solo admins crean/eliminan, bibliotecarios pueden actualizar
router.post('/cubiculo', auth.requireAdmin, controller.createCubiculo);
router.put('/cubiculo/:id', auth.requireBibliotecarioOrAdmin, controller.updateCubiculo);
router.delete('/cubiculo/:id', auth.requireAdmin, controller.deleteCubiculo);

module.exports = router;

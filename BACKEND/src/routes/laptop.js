const express = require('express');
const router = express.Router();
const controller = require('../controllers/laptop_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Público (para ver disponibilidad)
router.get('/laptop', validation.validatePagination, controller.getLaptop);
router.get('/laptop/:idLaptop', controller.getLaptopById);

// Modificación - Solo admins crean/eliminan, bibliotecarios pueden actualizar
router.post('/laptop', auth.requireAdmin, controller.createLaptop);
router.put('/laptop/:idLaptop', auth.requireBibliotecarioOrAdmin, controller.updateLaptop);
router.delete('/laptop/:idLaptop', auth.requireAdmin, controller.disableLaptop);

module.exports = router;
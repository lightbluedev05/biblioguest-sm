const express = require('express');
const router = express.Router();

const controller = require('../controllers/bibliotecario_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// ============================================================
// RUTAS PARA ADMIN (gestión de bibliotecarios)
// ============================================================

// Listar bibliotecarios con filtros y paginación
router.get('/bibliotecario', auth.requireAdmin, validation.validatePagination, controller.getBibliotecarios);

// Detalle de un bibliotecario
router.get('/bibliotecario/:id', auth.requireAdmin, controller.getBibliotecarioById);

// Crear bibliotecario
router.post('/bibliotecario', auth.requireAdmin, controller.createBibliotecario);

// Actualizar bibliotecario
router.put('/bibliotecario/:id', auth.requireAdmin, controller.updateBibliotecario);

// Eliminar bibliotecario
router.delete('/bibliotecario/:id', auth.requireAdmin, controller.deleteBibliotecario);

module.exports = router;

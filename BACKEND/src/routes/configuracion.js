const express = require('express');
const router = express.Router();

const controller = require('../controllers/configuracion_controller');
const auth = require('../middleware/authMiddleware');

// ============================================================
// RUTAS PARA ADMIN (configuración del sistema)
// ============================================================

// Obtener configuración
router.get('/configuracion', auth.requireAdmin, controller.getConfiguracion);

// Actualizar configuración
router.put('/configuracion', auth.requireAdmin, controller.updateConfiguracion);

module.exports = router;

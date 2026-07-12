const express = require('express');
const router = express.Router();

const controller = require('../controllers/dashboard_controller');
const auth = require('../middleware/authMiddleware');

// Dashboard para admin/bibliotecario
router.get('/dashboard/admin', auth.requireBibliotecarioOrAdmin, controller.getDashboardAdmin);

// Dashboard para estudiante
router.get('/dashboard/estudiante', auth.requireAuth, controller.getDashboardEstudiante);

module.exports = router;

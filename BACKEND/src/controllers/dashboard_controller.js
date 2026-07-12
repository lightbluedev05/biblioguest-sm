const dashboardModel = require('../models/dashboard_model');
const respuesta = require('../util/respuestas');

// ============================================================
// GET - Dashboard Admin/Bibliotecario
// ============================================================

exports.getDashboardAdmin = async (req, res, next) => {
  try {
    const data = await dashboardModel.getDashboardAdmin();
    respuesta.success(req, res, data, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET - Dashboard Estudiante
// ============================================================

exports.getDashboardEstudiante = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id;
    const data = await dashboardModel.getDashboardEstudiante(idUsuario);
    respuesta.success(req, res, data, 200);
  } catch (error) {
    next(error);
  }
};

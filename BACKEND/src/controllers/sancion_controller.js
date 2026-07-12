const sancionModel = require('../models/sancion_model');
const respuesta = require('../util/respuestas');

// ============================================================
// GET - Listar sanciones (biblio/admin)
// ============================================================

exports.getSanciones = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination || { page: 1, limit: 10 };
    const { idUsuario, estado, fechaDesde, fechaHasta } = req.query;

    const filtros = { idUsuario, estado, fechaDesde, fechaHasta };

    const total = await sancionModel.countSanciones(filtros);
    const sanciones = await sancionModel.getSanciones({ page, limit }, filtros);

    respuesta.success(req, res, {
      total,
      page,
      limit,
      data: sanciones
    }, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET - Sanción por ID (biblio/admin)
// ============================================================

exports.getSancionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sancion = await sancionModel.getSancionById(id);

    if (!sancion) {
      return respuesta.error(req, res, 'Sanción no encontrada', 404);
    }

    respuesta.success(req, res, sancion, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET - Mis sanciones (estudiante autenticado)
// ============================================================

exports.getMisSanciones = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id;
    const rol = req.usuario.rol;

    // Solo estudiantes tienen sanciones
    if (rol !== 'estudiante') {
      return respuesta.success(req, res, [], 200);
    }

    const sanciones = await sancionModel.getSancionesByUsuario(idUsuario);
    respuesta.success(req, res, sanciones, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST - Crear sanción (biblio/admin)
// ============================================================

exports.createSancion = async (req, res, next) => {
  try {
    const { idUsuario, fechaInicio, fechaFin, motivo } = req.body;

    const idSancion = await sancionModel.createSancion({
      idUsuario,
      fechaInicio,
      fechaFin,
      motivo
    });

    respuesta.success(req, res, {
      mensaje: 'Sanción creada exitosamente',
      idSancion
    }, 201);
  } catch (error) {
    if (error.message) {
      return respuesta.error(req, res, error.message, 400);
    }
    next(error);
  }
};

// ============================================================
// PUT - Modificar sanción (biblio/admin)
// ============================================================

exports.updateSancion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fechaInicio, fechaFin, motivo, estado } = req.body;

    const affected = await sancionModel.updateSancion(id, {
      fechaInicio,
      fechaFin,
      motivo,
      estado
    });

    if (affected === 0) {
      return respuesta.error(req, res, 'Sanción no encontrada o sin cambios', 404);
    }

    respuesta.success(req, res, { mensaje: 'Sanción actualizada' }, 200);
  } catch (error) {
    if (error.message) {
      return respuesta.error(req, res, error.message, 400);
    }
    next(error);
  }
};

// ============================================================
// POST - Cancelar sanción (admin)
// ============================================================

exports.cancelarSancion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const affected = await sancionModel.cancelarSancion(id);

    if (affected === 0) {
      return respuesta.error(req, res, 'Sanción no encontrada o ya cancelada', 404);
    }

    respuesta.success(req, res, { mensaje: 'Sanción cancelada' }, 200);
  } catch (error) {
    next(error);
  }
};

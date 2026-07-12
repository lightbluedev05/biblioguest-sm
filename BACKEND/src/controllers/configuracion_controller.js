const configuracionModel = require('../models/configuracion_model');
const respuesta = require('../util/respuestas');

// ============================================================
// GET - Obtener configuración del sistema
// ============================================================

exports.getConfiguracion = async (req, res, next) => {
  try {
    let config = await configuracionModel.getConfiguracion();

    // Si no existe, crear una por defecto
    if (!config) {
      const idNormas = await configuracionModel.createConfiguracion({});
      config = await configuracionModel.getConfiguracion();
    }

    respuesta.success(req, res, config, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT - Actualizar configuración del sistema
// ============================================================

exports.updateConfiguracion = async (req, res, next) => {
  try {
    const { diasPrestamoLibros, diasAnticipacionLibros, diasAnticipacionCubiculos, diasAnticipacionLaptops } = req.body;

    let config = await configuracionModel.getConfiguracion();

    if (!config) {
      // Crear si no existe
      await configuracionModel.createConfiguracion({
        diasPrestamoLibros,
        diasAnticipacionLibros,
        diasAnticipacionCubiculos,
        diasAnticipacionLaptops
      });
      return respuesta.success(req, res, { mensaje: 'Configuración creada correctamente' }, 201);
    }

    const rowsAffected = await configuracionModel.updateConfiguracion(config.ID_NORMAS_BIBLIOTECA, {
      diasPrestamoLibros,
      diasAnticipacionLibros,
      diasAnticipacionCubiculos,
      diasAnticipacionLaptops
    });

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'No se realizaron cambios', 400);
    }

    respuesta.success(req, res, { mensaje: 'Configuración actualizada correctamente' }, 200);
  } catch (error) {
    next(error);
  }
};

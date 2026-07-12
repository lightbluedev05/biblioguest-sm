const service = require('../services/etiqueta_service');
const respuesta = require('../util/respuestas');

exports.getEtiqueta = async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const filtros = {
      nombre: req.query.nombre,
      descripcion: req.query.descripcion,
    };

    const result = await service.getEtiqueta(pagination, filtros);
    return respuesta.success(req, res, result, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.getEtiquetaById = async (req, res) => {
  try {
    const idEtiqueta = req.params.id;
    const etiqueta = await service.getEtiquetaById(idEtiqueta);

    if (!etiqueta) {
      return respuesta.error(req, res, 'Etiqueta no encontrada', 404);
    }

    return respuesta.success(req, res, etiqueta, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.createEtiqueta = async (req, res) => {
  try {
    const data = req.body;

    if (!data.nombre) {
      return respuesta.error(
        req,
        res,
        'Campo requerido: nombre',
        400
      );
    }

    const result = await service.createEtiqueta(data);

    return respuesta.success(
      req,
      res,
      {
        mensaje: 'Etiqueta creada exitosamente',
        idEtiqueta: result.idEtiqueta,
      },
      201
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.updateEtiqueta = async (req, res) => {
  try {
    const idEtiqueta = req.params.id;
    const data = req.body;

    if (data.nombre === undefined && data.descripcion === undefined) {
      return respuesta.error(
        req,
        res,
        'Debe enviar al menos un campo para actualizar',
        400
      );
    }

    const rows = await service.updateEtiqueta(idEtiqueta, data);

    if (rows === 0) {
      return respuesta.error(req, res, 'Etiqueta no encontrada', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Etiqueta actualizada correctamente' },
      200
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.deleteEtiqueta = async (req, res) => {
  try {
    const idEtiqueta = req.params.id;

    const rows = await service.deleteEtiqueta(idEtiqueta);

    if (rows === 0) {
      return respuesta.error(req, res, 'Etiqueta no encontrada', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Etiqueta eliminada correctamente' },
      200
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

const service = require('../services/cubiculo_service');
const respuesta = require('../util/respuestas');

exports.getCubiculo = async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const filtros = {
      capacidadMin: req.query.capacidadMin,
      capacidadMax: req.query.capacidadMax,
      idBiblioteca: req.query.idBiblioteca,
      estado: req.query.estado,
    };

    const result = await service.getCubiculo(pagination, filtros);
    return respuesta.success(req, res, result, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.getCubiculoById = async (req, res) => {
  try {
    const idCubiculo = req.params.id;
    const cubiculo = await service.getCubiculoById(idCubiculo);

    if (!cubiculo) {
      return respuesta.error(req, res, 'Cubículo no encontrado', 404);
    }

    return respuesta.success(req, res, cubiculo, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.createCubiculo = async (req, res) => {
  try {
    const data = req.body;

    if (data.capacidad === undefined || data.idBiblioteca === undefined) {
      return respuesta.error(
        req,
        res,
        'Campos requeridos: capacidad, idBiblioteca',
        400
      );
    }

    const result = await service.createCubiculo(data);

    return respuesta.success(
      req,
      res,
      {
        mensaje: 'Cubículo creado exitosamente',
        idCubiculo: result.idCubiculo,
      },
      201
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.updateCubiculo = async (req, res) => {
  try {
    const idCubiculo = req.params.id;
    const data = req.body;

    if (
      data.capacidad === undefined &&
      data.idBiblioteca === undefined &&
      data.estado === undefined
    ) {
      return respuesta.error(
        req,
        res,
        'Debe enviar al menos un campo para actualizar (capacidad, idBiblioteca o estado)',
        400
      );
    }

    const rows = await service.updateCubiculo(idCubiculo, data);

    if (rows === 0) {
      return respuesta.error(req, res, 'Cubículo no encontrado', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Cubículo actualizado correctamente' },
      200
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.deleteCubiculo = async (req, res) => {
  try {
    const idCubiculo = req.params.id;

    const rows = await service.deleteCubiculo(idCubiculo);

    if (rows === 0) {
      return respuesta.error(req, res, 'Cubículo no encontrado', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Cubículo eliminado correctamente' },
      200
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

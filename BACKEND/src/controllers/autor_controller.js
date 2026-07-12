const service = require('../services/autor_service');
const respuesta = require('../util/respuestas');

exports.getAutor = async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const filtros = {
      nombre: req.query.nombre,
      apellido: req.query.apellido,
      nacionalidad: req.query.nacionalidad,
    };

    const result = await service.getAutor(pagination, filtros);
    return respuesta.success(req, res, result, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.getAutorById = async (req, res) => {
  try {
    const idAutor = req.params.id;
    const autor = await service.getAutorById(idAutor);

    if (!autor) {
      return respuesta.error(req, res, 'Autor no encontrado', 404);
    }

    return respuesta.success(req, res, autor, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.createAutor = async (req, res) => {
  try {
    const data = req.body;

    if (!data.nombre || !data.apellido) {
      return respuesta.error(
        req,
        res,
        'Campos requeridos: nombre y apellido',
        400
      );
    }

    const result = await service.createAutor(data);

    return respuesta.success(
      req,
      res,
      {
        mensaje: 'Autor creado exitosamente',
        idAutor: result.idAutor,
      },
      201
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.updateAutor = async (req, res) => {
  try {
    const idAutor = req.params.id;
    const data = req.body;

    if (
      data.nombre === undefined &&
      data.apellido === undefined &&
      data.nacionalidad === undefined
    ) {
      return respuesta.error(
        req,
        res,
        'Debe enviar al menos un campo para actualizar',
        400
      );
    }

    const rows = await service.updateAutor(idAutor, data);

    if (rows === 0) {
      return respuesta.error(req, res, 'Autor no encontrado', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Autor actualizado correctamente' },
      200
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.deleteAutor = async (req, res) => {
  try {
    const idAutor = req.params.id;

    const rows = await service.deleteAutor(idAutor);

    if (rows === 0) {
      return respuesta.error(req, res, 'Autor no encontrado', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Autor eliminado correctamente' },
      200
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

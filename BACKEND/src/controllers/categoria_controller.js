const service = require('../services/categoria_service');
const respuesta = require('../util/respuestas');

exports.getCategoria = async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const filtros = {
      nombre: req.query.nombre,
      descripcion: req.query.descripcion,
    };

    const result = await service.getCategoria(pagination, filtros);
    return respuesta.success(req, res, result, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.getCategoriaById = async (req, res) => {
  try {
    const idCategoria = req.params.id;
    const categoria = await service.getCategoriaById(idCategoria);

    if (!categoria) {
      return respuesta.error(req, res, 'Categoría no encontrada', 404);
    }

    return respuesta.success(req, res, categoria, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.createCategoria = async (req, res) => {
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

    const result = await service.createCategoria(data);

    return respuesta.success(
      req,
      res,
      {
        mensaje: 'Categoría creada exitosamente',
        idCategoria: result.idCategoria,
      },
      201
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.updateCategoria = async (req, res) => {
  try {
    const idCategoria = req.params.id;
    const data = req.body;

    if (data.nombre === undefined && data.descripcion === undefined) {
      return respuesta.error(
        req,
        res,
        'Debe enviar al menos un campo para actualizar',
        400
      );
    }

    const rows = await service.updateCategoria(idCategoria, data);

    if (rows === 0) {
      return respuesta.error(req, res, 'Categoría no encontrada', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Categoría actualizada correctamente' },
      200
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.deleteCategoria = async (req, res) => {
  try {
    const idCategoria = req.params.id;

    const rows = await service.deleteCategoria(idCategoria);

    if (rows === 0) {
      return respuesta.error(req, res, 'Categoría no encontrada', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Categoría eliminada correctamente' },
      200
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

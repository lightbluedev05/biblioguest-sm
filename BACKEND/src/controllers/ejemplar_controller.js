const service = require('../services/ejemplar_service');
const respuesta = require('../util/respuestas');

exports.getEjemplar = async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const filtros = {
      idLibro: req.query.idLibro,
      idBiblioteca: req.query.idBiblioteca,
      estado: req.query.estado,
      codigoBarra: req.query.codigoBarra,
    };

    const result = await service.getEjemplar(pagination, filtros);
    return respuesta.success(req, res, result, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.getEjemplarById = async (req, res) => {
  try {
    const idEjemplar = req.params.id; // ruta: /ejemplar/:id
    const ejemplar = await service.getEjemplarById(idEjemplar);

    if (!ejemplar) {
      return respuesta.error(req, res, 'Ejemplar no encontrado', 404);
    }

    return respuesta.success(req, res, ejemplar, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.createEjemplar = async (req, res) => {
  try {
    const data = req.body;

    if (!data.idLibro) {
      return respuesta.error(req, res, 'El campo idLibro es obligatorio', 400);
    }

    const result = await service.createEjemplar(data);

    return respuesta.success(
      req,
      res,
      {
        mensaje: 'Ejemplar creado exitosamente',
        idEjemplar: result.idEjemplar,
      },
      201
    );
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.updateEjemplar = async (req, res) => {
  try {
    const idEjemplar = req.params.id;
    const data = req.body;

    const rowsAffected = await service.updateEjemplar(idEjemplar, data);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Ejemplar no encontrado o sin cambios', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Ejemplar actualizado exitosamente',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.deleteEjemplar = async (req, res) => {
  try {
    const idEjemplar = req.params.id;

    const rowsAffected = await service.deleteEjemplar(idEjemplar);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Ejemplar no encontrado', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Ejemplar eliminado exitosamente',
    }, 200);
  } catch (error) {
    return respuesta.error(
      req,
      res,
      'No se pudo eliminar el ejemplar. Es posible que tenga préstamos asociados.',
      400
    );
  }
};

exports.deteriorarEjemplar = async (req, res) => {
  try {
    const idEjemplar = req.params.id;

    const rowsAffected = await service.deteriorarEjemplar(idEjemplar);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Ejemplar no encontrado', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Ejemplar marcado como deteriorado',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.restaurarEjemplar = async (req, res) => {
  try {
    const idEjemplar = req.params.id;

    const rowsAffected = await service.restaurarEjemplar(idEjemplar);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Ejemplar no encontrado', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Ejemplar marcado como disponible',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

const service = require('../services/laptop_service');
const respuesta = require('../util/respuestas');

exports.getLaptop = async (req, res) => {
  try{
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    }

    const dataBusqueda = req.query;

    const result = await service.getLaptop(pagination, dataBusqueda);
    respuesta.success(req, res, result, 200);
  } catch (error){
    respuesta.error(req, res, error.message, 500);
  }
}

exports.getLaptopById = async (req, res) => {
  try{
    const idLaptop = req.params.idLaptop;
    const result = await service.getLaptopById(idLaptop);

    if (result === null) {
      respuesta.error(req, res, 'Laptop no encontrada', 404);
      return;
    }

    respuesta.success(req, res, result, 200);
  } catch (error){
    respuesta.error(req, res, error.message, 500);
  }
}

exports.createLaptop = async (req, res) => {
  try {
    const data = req.body;
    const result = await service.createLaptop(data);

    return respuesta.success(req, res, result, 201);
  } catch (error) {
    console.error(error);
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.updateLaptop = async (req, res) => {
  try {
    const idLaptop = req.params.idLaptop;
    const data = req.body;

    const rowsAffected = await service.updateLaptop(idLaptop, data);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Laptop no encontrada', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Laptop actualizada correctamente' },
      200
    );
  } catch (error) {
    console.error(error);
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.disableLaptop = async (req, res) => {
  try {
    const idLaptop = req.params.idLaptop;
    const rowsAffected = await service.disableLaptop(idLaptop);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Laptop no encontrada', 404);
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Laptop deshabilitada correctamente' },
      200
    );
  } catch (error) {
    console.error('Error al deshabilitar laptop:', error);
    return respuesta.error(
      req,
      res,
      `No se pudo deshabilitar la laptop: ${error.message}`,
      400
    );
  }
}
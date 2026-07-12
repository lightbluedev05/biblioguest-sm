const service = require('../services/reservaLaptop_service');
const respuesta = require('../util/respuestas');

exports.getDisponibilidad = async (req, res) => {
  try {
    const dataBusqueda = req.query;
    const result = await service.getDisponibilidad(dataBusqueda);
    respuesta.success(req, res, result, 200);
  } catch (error) {
    respuesta.error(req, res, error.message, 500);
  }
}

exports.crearReserva = async (req, res) => {
  console.log("Crear Reserva Controller");
  try {
    const dataReserva = req.body;
    const result = await service.crearReserva(dataReserva);
    respuesta.success(req, res, result, 201);
  } catch (error) {
    respuesta.error(req, res, error.message, 400);
  }
}

exports.cancelarReserva = async (req, res) => {
  try {
    const idReserva = req.params.id;
    const result = await service.cancelarReserva(idReserva);
    respuesta.success(req, res, result, 200);
  } catch (error) {
    respuesta.error(req, res, error.message, 400);
  }
}

exports.getReservaByID = async (req, res) => {
  try {
    const idReserva = req.params.id;
    const result = await service.getReservaByID(idReserva);
    respuesta.success(req, res, result, 200);
  } catch (error) {
    respuesta.error(req, res, error.message, 500);
  }
}

exports.getReserva = async (req, res) => {
  try{
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    }

    const dataBusqueda = req.query;

    const result = await service.getReserva(pagination, dataBusqueda);
    respuesta.success(req, res, result, 200);
  } catch (error){
    respuesta.error(req, res, error.message, 500);
  }
}

exports.finalizarReserva = async (req, res) => {
  console.log("Finalizar Reserva Controller");
  try {
    const idReserva = req.params.id;
    const result = await service.finalizarReserva(idReserva);

    console.log("Resultado de finalizarReserva:", result);

    if(result === null){
      return res.status(404).json({
        error: true,
        status: 404,
        message: 'Reserva no encontrada o ya finalizada'
      })
    }

    return res.status(200).json({
      error: false,
      status: 200,
      message: 'Reserva finalizada exitosamente'
    })
  } catch (error) {
    respuesta.error(req, res, error.message, 400);
  }
}

exports.confirmarReserva = async (req, res) => {
  try {
    const idReserva = req.params.id;
    // El idBibliotecario viene en el body o del token. 
    // Idealmente del token, pero si el frontend lo manda en body, usaremos eso + validación.
    // Usaremos req.user.idUsuario si está disponible (bibliotecario logueado).
    // Asumiendo que el middleware de auth pone el usuario en req.user
    const idBibliotecario = req.body.idBibliotecario || (req.user ? req.user.idUsuario : null);

    if (!idBibliotecario) {
       return respuesta.error(req, res, "Se requiere idBibliotecario", 400);
    }

    const result = await service.confirmarReserva(idReserva, idBibliotecario);

    if(result === null){
        return res.status(404).json({
            error: true,
            status: 404,
            message: 'Reserva no encontrada o no está activa'
        });
    }

    return respuesta.success(req, res, { message: 'Reserva confirmada exitosamente' }, 200);

  } catch (error) {
    respuesta.error(req, res, error.message, 400);
  }
}

const service = require('../services/reservaCubiculo_service');
const respuesta = require('../util/respuestas');

exports.getReservaCubiculo = async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const filtros = {
      fechaReserva:    req.query.fechaReserva,
      idGrupoUsuarios: req.query.idGrupoUsuarios,
      idCubiculo:      req.query.idCubiculo,
      estado:          req.query.estado,
      idBibliotecario: req.query.idBibliotecario,
    };

    const result = await service.getReservaCubiculo(pagination, filtros);
    return respuesta.success(req, res, result, 200);
  } catch (error) {
    const msg = error.message || 'Error al obtener reservas de cubículo';
    if (msg.includes('ORA-200')) {
      return respuesta.error(req, res, msg, 400);
    }
    return respuesta.error(req, res, msg, 500);
  }
};

exports.getReservaCubiculoById = async (req, res) => {
  try {
    const idReserva = req.params.id;
    const reserva = await service.getReservaCubiculoById(idReserva);

    if (!reserva) {
      return respuesta.error(req, res, 'Reserva de cubículo no encontrada', 404);
    }

    return respuesta.success(req, res, reserva, 200);
  } catch (error) {
    const msg = error.message || 'Error al obtener la reserva';
    return respuesta.error(req, res, msg, 500);
  }
};

exports.crearReservaCubiculo = async (req, res) => {
  try {
    const data = req.body;
    const result = await service.crearReservaCubiculo(data);
    return respuesta.success(req, res, result, 201);
  } catch (error) {
    const msg = error.message || 'Error al crear la reserva de cubículo';
    if (msg.includes('ORA-200')) {
      return respuesta.error(req, res, msg, 400);
    }
    return respuesta.error(req, res, msg, 500);
  }
};

exports.aceptarInvitacion = async (req, res) => {
  try {
    const idReserva = req.params.id;
    const { idUsuario } = req.body;

    if (!idUsuario) {
      return respuesta.error(
        req,
        res,
        'idUsuario es obligatorio en el cuerpo de la petición',
        400
      );
    }

    const rows = await service.aceptarInvitacion(idReserva, idUsuario);
    if (rows === 0) {
      return respuesta.error(
        req,
        res,
        'No se encontró invitación para este usuario en esta reserva',
        404
      );
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Invitación aceptada' },
      200
    );
  } catch (error) {
    const msg = error.message || 'Error al aceptar invitación';
    if (msg.includes('ORA-200')) {
      return respuesta.error(req, res, msg, 400);
    }
    return respuesta.error(req, res, msg, 500);
  }
};

exports.rechazarInvitacion = async (req, res) => {
  try {
    const idReserva = req.params.id;
    const { idUsuario } = req.body;

    if (!idUsuario) {
      return respuesta.error(
        req,
        res,
        'idUsuario es obligatorio en el cuerpo de la petición',
        400
      );
    }

    const rows = await service.rechazarInvitacion(idReserva, idUsuario);
    if (rows === 0) {
      return respuesta.error(
        req,
        res,
        'No se encontró invitación para este usuario en esta reserva',
        404
      );
    }

    return respuesta.success(
      req,
      res,
      { mensaje: 'Invitación rechazada' },
      200
    );
  } catch (error) {
    const msg = error.message || 'Error al rechazar invitación';
    if (msg.includes('ORA-200')) {
      return respuesta.error(req, res, msg, 400);
    }
    return respuesta.error(req, res, msg, 500);
  }
};

exports.confirmarReserva = async (req, res) => {
  try {
    const idReserva = req.params.id;

    const reserva = await service.getReservaCubiculoById(idReserva);
    if (!reserva) {
      return respuesta.error(req, res, 'Reserva de cubículo no encontrada', 404);
    }

    await service.confirmarReserva(idReserva);
    return respuesta.success(
      req,
      res,
      { mensaje: 'Reserva confirmada correctamente' },
      200
    );
  } catch (error) {
    const msg = error.message || 'Error al confirmar la reserva';
    if (msg.includes('ORA-200')) {
      return respuesta.error(req, res, msg, 400);
    }
    return respuesta.error(req, res, msg, 500);
  }
};

exports.registrarIngreso = async (req, res) => {
  try {
    const idReserva = req.params.id;
    const { idBibliotecario } = req.body;

    if (!idBibliotecario) {
      return respuesta.error(
        req,
        res,
        'idBibliotecario es obligatorio en el cuerpo de la petición',
        400
      );
    }

    const reserva = await service.getReservaCubiculoById(idReserva);
    if (!reserva) {
      return respuesta.error(req, res, 'Reserva de cubículo no encontrada', 404);
    }

    await service.registrarIngreso(idReserva, idBibliotecario);
    return respuesta.success(
      req,
      res,
      { mensaje: 'Ingreso registrado correctamente' },
      200
    );
  } catch (error) {
    const msg = error.message || 'Error al registrar ingreso';
    if (msg.includes('ORA-200')) {
      return respuesta.error(req, res, msg, 400);
    }
    return respuesta.error(req, res, msg, 500);
  }
};

exports.finalizarReserva = async (req, res) => {
  try {
    const idReserva = req.params.id;

    const reserva = await service.getReservaCubiculoById(idReserva);
    if (!reserva) {
      return respuesta.error(req, res, 'Reserva de cubículo no encontrada', 404);
    }

    await service.finalizarReserva(idReserva);
    return respuesta.success(
      req,
      res,
      { mensaje: 'Reserva finalizada correctamente' },
      200
    );
  } catch (error) {
    const msg = error.message || 'Error al finalizar la reserva';
    if (msg.includes('ORA-200')) {
      return respuesta.error(req, res, msg, 400);
    }
    return respuesta.error(req, res, msg, 500);
  }
};

exports.cancelarReserva = async (req, res) => {
  try {
    const idReserva = req.params.id;

    const reserva = await service.getReservaCubiculoById(idReserva);
    if (!reserva) {
      return respuesta.error(req, res, 'Reserva de cubículo no encontrada', 404);
    }

    await service.cancelarReserva(idReserva);
    return respuesta.success(
      req,
      res,
      { mensaje: 'Reserva cancelada correctamente' },
      200
    );
  } catch (error) {
    const msg = error.message || 'Error al cancelar la reserva';
    if (msg.includes('ORA-200')) {
      return respuesta.error(req, res, msg, 400);
    }
    return respuesta.error(req, res, msg, 500);
  }
};

exports.getReservaCubiculoDetalle = async (req, res) => {
  try {
    const idReserva = req.params.id;

    const detalle = await service.getReservaCubiculoDetalle(idReserva);

    if (!detalle) {
      return respuesta.error(req, res, 'Reserva de cubículo no encontrada', 404);
    }

    respuesta.success(req, res, detalle, 200);
  } catch (error) {
    respuesta.error(req, res, error.message || 'Error interno del servidor', 500);
  }
};

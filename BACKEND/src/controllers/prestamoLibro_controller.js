const service = require('../services/prestamoLibro_service');
const respuesta = require('../util/respuestas');

exports.getPrestamo = async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const filtros = {
      idUsuario:        req.query.idUsuario,
      idBibliotecario:  req.query.idBibliotecario,
      idEjemplar:       req.query.idEjemplar,
      estado:           req.query.estado,
      fechaInicioDesde: req.query.fechaInicioDesde,
      fechaInicioHasta: req.query.fechaInicioHasta,
      fechaFinDesde:    req.query.fechaFinDesde,
      fechaFinHasta:    req.query.fechaFinHasta,
    };

    const result = await service.getPrestamo(pagination, filtros);
    return respuesta.success(req, res, result, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.getPrestamoById = async (req, res) => {
  try {
    const idPrestamo = req.params.id;
    const prestamo = await service.getPrestamoById(idPrestamo);

    if (!prestamo) {
      return respuesta.error(req, res, 'Préstamo no encontrado', 404);
    }

    return respuesta.success(req, res, prestamo, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.getPrestamoDetalleById = async (req, res) => {
  try {
    const idPrestamo = req.params.id;
    const detalle = await service.getPrestamoDetalleById(idPrestamo);

    if (!detalle) {
      return respuesta.error(req, res, 'Préstamo no encontrado', 404);
    }

    return respuesta.success(req, res, detalle, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
};

exports.createPrestamo = async (req, res) => {
  try {
    const data = req.body;

    if (!data.idUsuario || !data.idEjemplar || !data.fechaInicio || !data.fechaFin) {
      return respuesta.error(
        req,
        res,
        'Parámetros requeridos: idUsuario, idEjemplar, fechaInicio, fechaFin',
        400
      );
    }

    const result = await service.createPrestamo(data);

    return respuesta.success(
      req,
      res,
      {
        mensaje: 'Préstamo creado exitosamente',
        idPrestamo: result.idPrestamo,
      },
      201
    );
  } catch (error) {
    const msg = error.message || '';

    if (msg.includes('ORA-20030')) {
      return respuesta.error(req, res, 'Debe indicar fecha de inicio y fecha de fin', 400);
    }
    if (msg.includes('ORA-20031')) {
      return respuesta.error(req, res, 'La fecha de inicio no puede ser anterior a hoy', 400);
    }
    if (msg.includes('ORA-20032')) {
      return respuesta.error(req, res, 'La fecha de fin no puede ser anterior a la fecha de inicio', 400);
    }
    if (msg.includes('ORA-20033')) {
      return respuesta.error(
        req,
        res,
        'Para iniciar un préstamo hoy, la solicitud debe registrarse antes de las 12:00',
        400
      );
    }
    if (msg.includes('ORA-20035')) {
      return respuesta.error(
        req,
        res,
        'La duración solicitada excede el máximo permitido por la biblioteca',
        400
      );
    }

    return respuesta.error(req, res, msg, 500);
  }
};

exports.devolverPrestamo = async (req, res) => {
  try {
    const idPrestamo = req.params.id;
    const fechaDevolucion = req.body.fechaDevolucion; // opcional (YYYY-MM-DD)

    await service.devolverPrestamo(idPrestamo, fechaDevolucion);

    return respuesta.success(
      req,
      res,
      { mensaje: 'Préstamo devuelto correctamente' },
      200
    );
  } catch (error) {
    const msg = error.message || '';

    if (msg.includes('ORA-01403')) {
      return respuesta.error(req, res, 'Préstamo no encontrado', 404);
    }
    if (msg.includes('ORA-20004')) {
      return respuesta.error(req, res, 'El préstamo ya fue devuelto', 400);
    }
    if (msg.includes('ORA-20040')) {
      return respuesta.error(
        req,
        res,
        'La devolución solo se puede registrar entre las 08:00 y las 10:00',
        400
      );
    }

    return respuesta.error(req, res, msg, 500);
  }
};

exports.asignarBibliotecario = async (req, res) => {
  try {
    const idPrestamo = req.params.id;
    const { idBibliotecario } = req.body;

    if (!idBibliotecario) {
      return respuesta.error(req, res, 'El campo idBibliotecario es obligatorio', 400);
    }

    await service.asignarBibliotecario(idPrestamo, idBibliotecario);

    return respuesta.success(
      req,
      res,
      { mensaje: 'Bibliotecario asignado correctamente al préstamo' },
      200
    );
  } catch (error) {
    const msg = error.message || '';

    if (msg.includes('ORA-01403')) {
      return respuesta.error(req, res, 'Préstamo no encontrado', 404);
    }
    if (msg.includes('ORA-20036')) {
      return respuesta.error(req, res, 'El préstamo ya tiene un bibliotecario asignado', 400);
    }
    if (msg.includes('ORA-20037')) {
      return respuesta.error(
        req,
        res,
        'El préstamo aún no inicia; no se puede entregar el libro',
        400
      );
    }
    if (msg.includes('ORA-20038')) {
      return respuesta.error(
        req,
        res,
        'El préstamo ya ha vencido; no se puede entregar el libro',
        400
      );
    }
    if (msg.includes('ORA-20039')) {
      return respuesta.error(
        req,
        res,
        'El libro solo se puede entregar entre las 10:00 y las 12:00',
        400
      );
    }

    return respuesta.error(req, res, msg, 500);
  }
};

exports.cancelarPrestamo = async (req, res) => {
  try {
    const idPrestamo = req.params.id;

    await service.cancelarPrestamo(idPrestamo);

    return respuesta.success(
      req,
      res,
      { mensaje: 'Préstamo cancelado correctamente' },
      200
    );
  } catch (error) {
    const msg = error.message || '';

    if (msg.includes('ORA-01403')) {
      return respuesta.error(req, res, 'Préstamo no encontrado', 404);
    }
    if (msg.includes('ORA-20041')) {
      return respuesta.error(
        req,
        res,
        'El préstamo ya fue devuelto; no se puede cancelar',
        400
      );
    }
    if (msg.includes('ORA-20042')) {
      return respuesta.error(
        req,
        res,
        'No se puede cancelar un préstamo en curso o vencido',
        400
      );
    }
    if (msg.includes('ORA-20043')) {
      return respuesta.error(
        req,
        res,
        'No se puede cancelar un préstamo ya entregado',
        400
      );
    }

    return respuesta.error(req, res, msg, 500);
  }
};

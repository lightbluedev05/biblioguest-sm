const model = require('../models/reservaCubiculo_model');

exports.getReservaCubiculo = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const reservas = await model.getReservasCubiculo(pagination, data);
  const total = await model.countReservasCubiculo(data);

  return {
    data: reservas,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit,
    },
  };
};

exports.getReservaCubiculoById = async (idReserva) => {
  const reserva = await model.getReservaCubiculoById(idReserva);
  return reserva || null;
};

exports.crearReservaCubiculo = async (data) => {
  return model.crearBorradorReservaCubiculo(data);
};

exports.aceptarInvitacion = async (idReserva, idUsuario) => {
  return model.aceptarInvitacion(idReserva, idUsuario);
};

exports.rechazarInvitacion = async (idReserva, idUsuario) => {
  return model.rechazarInvitacion(idReserva, idUsuario);
};

exports.confirmarReserva = async (idReserva) => {
  await model.confirmarReserva(idReserva);
  return true;
};

exports.registrarIngreso = async (idReserva, idBibliotecario) => {
  await model.registrarIngreso(idReserva, idBibliotecario);
  return true;
};

exports.finalizarReserva = async (idReserva) => {
  await model.finalizarReserva(idReserva);
  return true;
};

exports.cancelarReserva = async (idReserva) => {
  await model.cancelarReserva(idReserva);
  return true;
};

exports.getReservaCubiculoDetalle = async (idReserva) => {
  const rows = await model.getReservaCubiculoDetalleById(idReserva);

  if (!rows || rows.length === 0) {
    return null;
  }

  const header = rows[0];

  const detalle = {
    reserva: {
      idReserva: header.ID_RESERVA,
      idGrupoUsuarios: header.ID_GRUPO_USUARIOS,
      idCubiculo: header.ID_CUBICULO,
      idBibliotecario: header.ID_BIBLIOTECARIO,
      fechaSolicitud: header.FECHA_SOLICITUD,
      fechaReserva: header.FECHA_RESERVA,
      horaInicio: header.HORA_INICIO,
      horaFin: header.HORA_FIN,
      estado: header.ESTADO
    },
    cubiculo: {
      idCubiculo: header.ID_CUBICULO,
      capacidad: header.CAPACIDAD_CUBICULO,
      estado: header.ESTADO_CUBICULO,
      biblioteca: {
        idBiblioteca: header.ID_BIBLIOTECA,
        nombre: header.NOMBRE_BIBLIOTECA
      }
    },
    bibliotecario: header.ID_BIBLIOTECARIO
      ? {
          idBibliotecario: header.ID_BIBLIOTECARIO,
          nombre: header.NOMBRE_BIBLIOTECARIO,
          correo: header.CORREO_BIBLIOTECARIO,
          turno: header.TURNO_BIBLIOTECARIO
        }
      : null,
    miembros: rows
      .filter(r => r.ID_USUARIO)
      .map(r => ({
        idUsuario: r.ID_USUARIO,
        nombre: r.NOMBRE_USUARIO,
        codigoInstitucional: r.CODIGO_INSTITUCIONAL,
        correo: r.CORREO_USUARIO,
        estadoMiembro: r.ESTADO_MIEMBRO
      }))
  };

  return detalle;
};

const model = require('../models/reservaLaptop_model');

exports.getDisponibilidad = async (data) => {
  const horarios = await model.getDisponibilidad(data);
  return horarios;
}

exports.crearReserva = async (data) => {
  const reserva = await model.crearReserva(data);
  return reserva;
}

exports.cancelarReserva = async (idReserva) => {
  const result = await model.cancelarReserva(idReserva);
  return result;
}

exports.getReservaByID = async (idReserva) => {
  const reserva = await model.getReservaByID(idReserva);
  return reserva;
}

exports.getReserva = async (pagination = {}, data) => {

  const { page, limit } = pagination;
  const reservas = await model.getReserva(pagination, data);
  const total = await model.countReserva(data);

  return {
    data: reservas,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit
    }
  };
}

exports.finalizarReserva = async (idReserva) => {
  const result = await model.finalizarReserva(idReserva);

  console.log("Resultado de finalizarReserva en service:", result);

  if(result === 0){
    return null;
  }

  return true;
}

exports.confirmarReserva = async (idReserva, idBibliotecario) => {
  const result = await model.confirmarReserva(idReserva, idBibliotecario);
  
  if(result === 0) {
    return null;
  }
  return true;
}

const model = require('../models/prestamoLibro_model');

exports.getPrestamo = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const prestamos = await model.getPrestamos(pagination, data);
  const total = await model.countPrestamos(data);

  return {
    data: prestamos,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit,
    },
  };
};

exports.getPrestamoById = async (idPrestamo) => {
  const prestamo = await model.getPrestamoById(idPrestamo);
  return prestamo || null;
};

exports.getPrestamoDetalleById = async (idPrestamo) => {
  const detalle = await model.getPrestamoDetalleById(idPrestamo);
  return detalle || null;
};

exports.createPrestamo = async (data) => {
  const idPrestamo = await model.createPrestamo(data);
  return { idPrestamo };
};

exports.devolverPrestamo = async (idPrestamo, fechaDevolucion) => {
  await model.devolverPrestamo(idPrestamo, fechaDevolucion);
  return true;
};

exports.asignarBibliotecario = async (idPrestamo, idBibliotecario) => {
  await model.asignarBibliotecario(idPrestamo, idBibliotecario);
  return true;
};

exports.cancelarPrestamo = async (idPrestamo) => {
  await model.cancelarPrestamo(idPrestamo);
  return true;
};


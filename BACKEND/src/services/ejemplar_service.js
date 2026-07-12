const model = require('../models/ejemplar_model');

exports.getEjemplar = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const ejemplares = await model.getEjemplares(pagination, data);
  const total = await model.countEjemplares(data);

  return {
    data: ejemplares,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit,
    },
  };
};

exports.getEjemplarById = async (idEjemplar) => {
  const ejemplar = await model.getEjemplarById(idEjemplar);
  return ejemplar || null;
};

exports.createEjemplar = async (data) => {
  const idEjemplar = await model.createEjemplar(data);
  return { idEjemplar };
};

exports.updateEjemplar = async (idEjemplar, data) => {
  const rowsAffected = await model.updateEjemplar(idEjemplar, data);
  return rowsAffected;
};

exports.deleteEjemplar = async (idEjemplar) => {
  const rowsAffected = await model.deleteEjemplar(idEjemplar);
  return rowsAffected;
};

exports.deteriorarEjemplar = async (idEjemplar) => {
  const rowsAffected = await model.deteriorarEjemplar(idEjemplar);
  return rowsAffected;
};

exports.restaurarEjemplar = async (idEjemplar) => {
  const rowsAffected = await model.restaurarEjemplar(idEjemplar);
  return rowsAffected;
};

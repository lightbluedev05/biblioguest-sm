const model = require('../models/cubiculo_model');

exports.getCubiculo = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const cubiculos = await model.getCubiculos(pagination, data);
  const total = await model.countCubiculos(data);

  return {
    data: cubiculos,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit,
    },
  };
};

exports.getCubiculoById = async (idCubiculo) => {
  const cubiculo = await model.getCubiculoById(idCubiculo);
  return cubiculo || null;
};

exports.createCubiculo = async (data) => {
  const idCubiculo = await model.createCubiculo(data);
  return { idCubiculo };
};

exports.updateCubiculo = async (idCubiculo, data) => {
  const rows = await model.updateCubiculo(idCubiculo, data);
  return rows;
};

exports.deleteCubiculo = async (idCubiculo) => {
  const rows = await model.deleteCubiculo(idCubiculo);
  return rows;
};

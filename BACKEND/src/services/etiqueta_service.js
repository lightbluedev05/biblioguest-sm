const model = require('../models/etiqueta_model');

exports.getEtiqueta = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const etiquetas = await model.getEtiquetas(pagination, data);
  const total = await model.countEtiquetas(data);

  return {
    data: etiquetas,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit,
    },
  };
};

exports.getEtiquetaById = async (idEtiqueta) => {
  const etiqueta = await model.getEtiquetaById(idEtiqueta);
  return etiqueta || null;
};

exports.createEtiqueta = async (data) => {
  const idEtiqueta = await model.createEtiqueta(data);
  return { idEtiqueta };
};

exports.updateEtiqueta = async (idEtiqueta, data) => {
  const rows = await model.updateEtiqueta(idEtiqueta, data);
  return rows;
};

exports.deleteEtiqueta = async (idEtiqueta) => {
  const rows = await model.deleteEtiqueta(idEtiqueta);
  return rows;
};

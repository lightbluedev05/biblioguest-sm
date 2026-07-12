const model = require('../models/categoria_model');

exports.getCategoria = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const categorias = await model.getCategorias(pagination, data);
  const total = await model.countCategorias(data);

  return {
    data: categorias,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit,
    },
  };
};

exports.getCategoriaById = async (idCategoria) => {
  const categoria = await model.getCategoriaById(idCategoria);
  return categoria || null;
};

exports.createCategoria = async (data) => {
  const idCategoria = await model.createCategoria(data);
  return { idCategoria };
};

exports.updateCategoria = async (idCategoria, data) => {
  const rows = await model.updateCategoria(idCategoria, data);
  return rows;
};

exports.deleteCategoria = async (idCategoria) => {
  const rows = await model.deleteCategoria(idCategoria);
  return rows;
};

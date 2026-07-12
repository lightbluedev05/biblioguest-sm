const model = require('../models/autor_model');

exports.getAutor = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const autores = await model.getAutores(pagination, data);
  const total = await model.countAutores(data);

  return {
    data: autores,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit,
    },
  };
};

exports.getAutorById = async (idAutor) => {
  const autor = await model.getAutorById(idAutor);
  return autor || null;
};

exports.createAutor = async (data) => {
  const idAutor = await model.createAutor(data);
  return { idAutor };
};

exports.updateAutor = async (idAutor, data) => {
  const rows = await model.updateAutor(idAutor, data);
  return rows;
};

exports.deleteAutor = async (idAutor) => {
  const rows = await model.deleteAutor(idAutor);
  return rows;
};

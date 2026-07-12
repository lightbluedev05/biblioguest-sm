const model = require('../models/laptop_model');

exports.getLaptop = async (pagination = {}, data) => {
  const { page, limit } = pagination;
  const laptops = await model.getLaptops(pagination, data);
  const total = await model.countLaptops(data);

  return {
    data: laptops,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit
    }
  }
}

exports.getLaptopById = async (idLaptop) => {
  const laptop = await model.getLaptopById(idLaptop);
  return laptop || null;
}

exports.createLaptop = async (data) => {
  // Validación mínima (lo demás lo hace Oracle con constraints)
  const { numeroSerie, sistemaOperativo, marca, modelo } = data;

  if (!numeroSerie || !sistemaOperativo || !marca || !modelo) {
    throw new Error('Parámetros requeridos: numeroSerie, sistemaOperativo, marca, modelo');
  }

  const idLaptop = await model.createLaptop(data);

  return {
    idLaptop,
    mensaje: 'Laptop creada exitosamente',
  };
}

exports.updateLaptop = async (idLaptop, data) => {
  const rowsAffected = await model.updateLaptop(idLaptop, data);
  return rowsAffected;
}

exports.disableLaptop = async (idLaptop) => {
  const rowsAffected = await model.disableLaptop(idLaptop);
  return rowsAffected;
}

const model = require('../models/libro_model');

exports.getLibros = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const libros = await model.getLibros(pagination, data);
  const total = await model.countLibros(data);

  return {
    data: libros,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit,
    },
  };
};

exports.getLibroById = async (idLibro) => {
  const libro = await model.getLibroById(idLibro);
  return libro || null;
};

exports.getLibroDetalleById = async (idLibro) => {
  const row = await model.getLibroDetalleById(idLibro);
  if (!row) return null;

  // Función helper para parsear string de LISTAGG a array de objetos
  const parseListagg = (str, parser) => {
    if (!str) return [];
    return str.split(', ').map(parser).filter(Boolean);
  };

  // Parsear autores (formato: "Nombre Apellido, Nombre Apellido")
  const autores = parseListagg(row.AUTORES, (nombreCompleto) => {
    const parts = nombreCompleto.trim().split(' ');
    if (parts.length < 2) return { nombre: nombreCompleto.trim(), apellido: '' };
    const apellido = parts.pop();
    const nombre = parts.join(' ');
    return { nombre, apellido };
  });

  // Parsear categorías (formato: "Cat1, Cat2")
  const categorias = parseListagg(row.CATEGORIAS, (nombre) => ({
    nombre: nombre.trim()
  }));

  // Parsear etiquetas (formato: "Tag1, Tag2")
  const etiquetas = parseListagg(row.ETIQUETAS, (nombre) => ({
    nombre: nombre.trim()
  }));

  return {
    idLibro: row.ID_LIBRO,
    isbn: row.ISBN,
    titulo: row.TITULO,
    subtitulo: row.SUBTITULO,
    editorial: row.EDITORIAL,
    nroEdicion: row.NRO_EDICION,
    anio: row.ANIO,
    autores,
    categorias,
    etiquetas,
    ejemplaresDisponibles: row.EJEMPLARES_DISPONIBLES || 0,
    totalEjemplares: row.TOTAL_EJEMPLARES || 0
  };
};

exports.createLibro = async (data) => {
  const idLibro = await model.createLibro(data);
  return { idLibro };
};

exports.updateLibro = async (idLibro, data) => {
  const rowsAffected = await model.updateLibro(idLibro, data);
  return rowsAffected;
};

exports.deleteLibro = async (idLibro) => {
  const rowsAffected = await model.deleteLibro(idLibro);
  return rowsAffected;
};

//---------- AUTORES DEL LIBRO -------------

exports.setAutoresLibro = async (idLibro, idsAutores) => {
  await model.setAutoresLibro(idLibro, idsAutores);
  return true;
};

exports.removeAutorLibro = async (idLibro, idAutor) => {
  const rowsAffected = await model.removeAutorLibro(idLibro, idAutor);
  return rowsAffected;
};

//---------------- CATEGORIAS DEL LIBRO -----------

exports.setCategoriasLibro = async (idLibro, idsCategorias) => {
  await model.setCategoriasLibro(idLibro, idsCategorias);
  return true;
};

exports.removeCategoriaLibro = async (idLibro, idCategoria) => {
  const rowsAffected = await model.removeCategoriaLibro(idLibro, idCategoria);
  return rowsAffected;
};

//-------------- ETIQUETAS DEL LIBRO ------------------

exports.setEtiquetasLibro = async (idLibro, idsEtiquetas) => {
  await model.setEtiquetasLibro(idLibro, idsEtiquetas);
  return true;
};

exports.removeEtiquetaLibro = async (idLibro, idEtiqueta) => {
  const rowsAffected = await model.removeEtiquetaLibro(idLibro, idEtiqueta);
  return rowsAffected;
};
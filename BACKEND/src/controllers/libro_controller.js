const service = require('../services/libro_service');
const respuesta = require('../util/respuestas');

exports.getLibros = async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const filtros = {
      isbn: req.query.isbn,
      titulo: req.query.titulo,
      subtitulo: req.query.subtitulo,
      editorial: req.query.editorial,
      anio: req.query.anio,
    };

    const result = await service.getLibros(pagination, filtros);
    return respuesta.success(req, res, result, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.getLibroById = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const libro = await service.getLibroById(idLibro);

    if (!libro) {
      return respuesta.error(req, res, 'Libro no encontrado', 404);
    }

    return respuesta.success(req, res, libro, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.getLibroDetalleById = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const detalle = await service.getLibroDetalleById(idLibro);

    if (!detalle) {
      return respuesta.error(req, res, 'Libro no encontrado', 404);
    }

    return respuesta.success(req, res, detalle, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.createLibro = async (req, res) => {
  try {
    const data = req.body;

    if (!data.titulo) {
      return respuesta.error(req, res, 'El campo titulo es obligatorio', 400);
    }

    const result = await service.createLibro(data);
    return respuesta.success(req, res, {
      mensaje: 'Libro creado exitosamente',
      idLibro: result.idLibro,
    }, 201);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.updateLibro = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const data = req.body;

    const rowsAffected = await service.updateLibro(idLibro, data);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Libro no encontrado o sin cambios', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Libro actualizado exitosamente',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.deleteLibro = async (req, res) => {
  try {
    const idLibro = req.params.id;

    const rowsAffected = await service.deleteLibro(idLibro);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Libro no encontrado', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Libro eliminado exitosamente',
    }, 200);
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    return respuesta.error(
      req,
      res,
      `No se pudo eliminar el libro: ${error.message}`,
      400
    );
  }
}

//--------------- GESTION DE AUTORES DEL LIBRO -------------

exports.setAutoresLibro = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const { autores } = req.body;

    if (!Array.isArray(autores)) {
      return respuesta.error(req, res, 'El campo "autores" debe ser un array de IDs', 400);
    }

    await service.setAutoresLibro(idLibro, autores);

    return respuesta.success(req, res, {
      mensaje: 'Autores del libro actualizados correctamente',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.removeAutorLibro = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const idAutor = req.params.idAutor;

    const rowsAffected = await service.removeAutorLibro(idLibro, idAutor);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Relación libro-autor no encontrada', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Autor eliminado del libro correctamente',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}

//----------- GESTION DE CATEGORIAS DEL LIBRO -----------

exports.setCategoriasLibro = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const { categorias } = req.body;

    if (!Array.isArray(categorias)) {
      return respuesta.error(req, res, 'El campo "categorias" debe ser un array de IDs', 400);
    }

    await service.setCategoriasLibro(idLibro, categorias);

    return respuesta.success(req, res, {
      mensaje: 'Categorías del libro actualizadas correctamente',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}

exports.removeCategoriaLibro = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const idCategoria = req.params.idCategoria;

    const rowsAffected = await service.removeCategoriaLibro(idLibro, idCategoria);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Relación libro-categoría no encontrada', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Categoría eliminada del libro correctamente',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}


//-------------------- GESTION DE ETIQUETAS DEL LIBRO ------------

exports.setEtiquetasLibro = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const { etiquetas } = req.body;

    if (!Array.isArray(etiquetas)) {
      return respuesta.error(req, res, 'El campo "etiquetas" debe ser un array de IDs', 400);
    }

    await service.setEtiquetasLibro(idLibro, etiquetas);

    return respuesta.success(req, res, {
      mensaje: 'Etiquetas del libro actualizadas correctamente',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}


exports.removeEtiquetaLibro = async (req, res) => {
  try {
    const idLibro = req.params.id;
    const idEtiqueta = req.params.idEtiqueta;

    const rowsAffected = await service.removeEtiquetaLibro(idLibro, idEtiqueta);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'Relación libro-etiqueta no encontrada', 404);
    }

    return respuesta.success(req, res, {
      mensaje: 'Etiqueta eliminada del libro correctamente',
    }, 200);
  } catch (error) {
    return respuesta.error(req, res, error.message, 500);
  }
}
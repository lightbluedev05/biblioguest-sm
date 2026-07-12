const bibliotecarioModel = require('../models/bibliotecario_model');
const authModel = require('../models/auth_model');
const authService = require('../services/auth_service');
const respuesta = require('../util/respuestas');

// ============================================================
// GET - Listar bibliotecarios (admin)
// ============================================================

exports.getBibliotecarios = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination || { page: 1, limit: 10 };
    const { nombre, correo, turno } = req.query;

    const filtros = { nombre, correo, turno };

    const total = await bibliotecarioModel.countBibliotecarios(filtros);
    const bibliotecarios = await bibliotecarioModel.getBibliotecarios({ page, limit }, filtros);

    respuesta.success(req, res, {
      total,
      page,
      limit,
      data: bibliotecarios
    }, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET - Bibliotecario por ID (admin)
// ============================================================

exports.getBibliotecarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bibliotecario = await bibliotecarioModel.getBibliotecarioById(id);

    if (!bibliotecario) {
      return respuesta.error(req, res, 'Bibliotecario no encontrado', 404);
    }

    respuesta.success(req, res, bibliotecario, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST - Crear bibliotecario (admin)
// ============================================================

exports.createBibliotecario = async (req, res, next) => {
  try {
    const { nombre, correo, turno, password } = req.body;

    if (!nombre || !correo) {
      return respuesta.error(req, res, 'Nombre y correo son requeridos', 400);
    }

    // Verificar duplicados
    const existeCorreo = await authModel.findBibliotecarioByCorreo(correo);
    if (existeCorreo) {
      return respuesta.error(req, res, 'El correo ya está registrado', 409);
    }

    // Hash password (default: correo)
    const passwordToHash = password || correo;
    const passwordHash = await authService.hashPassword(passwordToHash);

    const idBibliotecario = await authModel.createBibliotecario({
      nombre,
      correo,
      turno: turno || null,
      passwordHash
    });

    respuesta.success(req, res, { idBibliotecario, mensaje: 'Bibliotecario creado exitosamente' }, 201);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT - Actualizar bibliotecario (admin)
// ============================================================

exports.updateBibliotecario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, correo, turno } = req.body;

    const bibliotecario = await bibliotecarioModel.getBibliotecarioById(id);
    if (!bibliotecario) {
      return respuesta.error(req, res, 'Bibliotecario no encontrado', 404);
    }

    const rowsAffected = await bibliotecarioModel.updateBibliotecario(id, {
      nombre,
      correo,
      turno
    });

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'No se realizaron cambios', 400);
    }

    respuesta.success(req, res, { mensaje: 'Bibliotecario actualizado correctamente' }, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE - Eliminar bibliotecario (admin)
// ============================================================

exports.deleteBibliotecario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bibliotecario = await bibliotecarioModel.getBibliotecarioById(id);
    if (!bibliotecario) {
      return respuesta.error(req, res, 'Bibliotecario no encontrado', 404);
    }

    const rowsAffected = await bibliotecarioModel.deleteBibliotecario(id);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'No se pudo desactivar el bibliotecario', 400);
    }

    respuesta.success(req, res, { mensaje: 'Bibliotecario desactivado correctamente' }, 200);
  } catch (error) {
    next(error);
  }
};

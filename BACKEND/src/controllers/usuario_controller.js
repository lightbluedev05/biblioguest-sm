const usuarioModel = require('../models/usuario_model');
const respuesta = require('../util/respuestas');

// ============================================================
// GET - Listar usuarios (biblio/admin)
// ============================================================

exports.getUsuarios = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination || { page: 1, limit: 10 };
    const { nombre, codigo, correo, estado, idUnidad } = req.query;

    const filtros = { nombre, codigo, correo, estado, idUnidad };

    const total = await usuarioModel.countUsuarios(filtros);
    const usuarios = await usuarioModel.getUsuarios({ page, limit }, filtros);

    respuesta.success(req, res, {
      total,
      page,
      limit,
      data: usuarios
    }, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET - Usuario por ID (biblio/admin)
// ============================================================

exports.getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioModel.getUsuarioById(id);

    if (!usuario) {
      return respuesta.error(req, res, 'Usuario no encontrado', 404);
    }

    respuesta.success(req, res, usuario, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET - Mis invitaciones pendientes (estudiante autenticado)
// ============================================================

exports.getMisInvitaciones = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id;
    const rol = req.usuario.rol;

    // Solo estudiantes reciben invitaciones
    if (rol !== 'estudiante') {
      return respuesta.success(req, res, [], 200);
    }

    const invitaciones = await usuarioModel.getInvitacionesPendientes(idUsuario);
    respuesta.success(req, res, invitaciones, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET - Mis reservas de cubículo (estudiante autenticado)
// ============================================================

exports.getMisReservasCubiculo = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id;
    const rol = req.usuario.rol;

    if (rol !== 'estudiante') {
      return respuesta.success(req, res, [], 200);
    }

    const reservas = await usuarioModel.getMisReservasCubiculo(idUsuario);
    respuesta.success(req, res, reservas, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST - Crear usuario (biblio/admin)
// ============================================================

const authModel = require('../models/auth_model');
const authService = require('../services/auth_service');

exports.createUsuario = async (req, res, next) => {
  try {
    const { nombre, codigoInstitucional, correo, idUnidad, password } = req.body;

    if (!nombre || !codigoInstitucional || !correo) {
      return respuesta.error(req, res, 'Nombre, código institucional y correo son requeridos', 400);
    }

    // Verificar duplicados
    const existeCodigo = await authModel.findUsuarioByCodigo(codigoInstitucional);
    if (existeCodigo) {
      return respuesta.error(req, res, 'El código institucional ya está registrado', 409);
    }

    const existeCorreo = await authModel.findUsuarioByCorreo(correo);
    if (existeCorreo) {
      return respuesta.error(req, res, 'El correo ya está registrado', 409);
    }

    // Hash password (default: código institucional)
    const passwordToHash = password || codigoInstitucional;
    const passwordHash = await authService.hashPassword(passwordToHash);

    const idUsuario = await authModel.createUsuario({
      nombre,
      codigoInstitucional,
      correo,
      estado: 'activo',
      idUnidad: idUnidad || null,
      passwordHash
    });

    respuesta.success(req, res, { idUsuario, mensaje: 'Usuario creado exitosamente' }, 201);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT - Actualizar usuario (biblio/admin)
// ============================================================

exports.updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, correo, estado, idUnidad } = req.body;

    const usuario = await usuarioModel.getUsuarioById(id);
    if (!usuario) {
      return respuesta.error(req, res, 'Usuario no encontrado', 404);
    }

    const rowsAffected = await usuarioModel.updateUsuario(id, {
      nombre,
      correo,
      estado,
      idUnidad
    });

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'No se realizaron cambios', 400);
    }

    respuesta.success(req, res, { mensaje: 'Usuario actualizado correctamente' }, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE - Eliminar usuario (soft delete - biblio/admin)
// ============================================================

exports.deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await usuarioModel.getUsuarioById(id);
    if (!usuario) {
      return respuesta.error(req, res, 'Usuario no encontrado', 404);
    }

    const rowsAffected = await usuarioModel.deleteUsuario(id);

    if (rowsAffected === 0) {
      return respuesta.error(req, res, 'No se pudo bloquear el usuario', 400);
    }

    respuesta.success(req, res, { mensaje: 'Usuario bloqueado correctamente' }, 200);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET - Actividad del usuario (reservas y préstamos activos)
// ============================================================

exports.getUsuarioActividad = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await usuarioModel.getUsuarioById(id);
    if (!usuario) {
      return respuesta.error(req, res, 'Usuario no encontrado', 404);
    }

    const actividad = await usuarioModel.getUsuarioActividad(id);
    respuesta.success(req, res, actividad, 200);
  } catch (error) {
    next(error);
  }
};

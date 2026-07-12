const authService = require('../services/auth_service');
const respuesta = require('../util/respuestas');

/**
 * POST /auth/login
 * Login universal para todos los roles
 */
exports.login = async (req, res, next) => {
  try {
    const { identificador, password } = req.body;
    
    const result = await authService.login(identificador, password);
    
    respuesta.success(req, res, result, 200);
  } catch (error) {
    if (error.status) {
      return respuesta.error(req, res, error.message, error.status);
    }
    next(error);
  }
};

/**
 * POST /auth/registro/estudiante
 * Registro de estudiante
 * - Auto-registro (público) si no hay token
 * - Admin puede registrar también
 */
exports.registroEstudiante = async (req, res, next) => {
  try {
    const creador = req.usuario || null;
    const result = await authService.registerEstudiante(req.body, creador);
    
    respuesta.success(req, res, {
      mensaje: 'Estudiante registrado exitosamente',
      ...result
    }, 201);
  } catch (error) {
    if (error.status) {
      return respuesta.error(req, res, error.message, error.status);
    }
    next(error);
  }
};

/**
 * POST /auth/registro/bibliotecario
 * Registro de bibliotecario (solo admins)
 */
exports.registroBibliotecario = async (req, res, next) => {
  try {
    const adminId = req.usuario.id;
    const result = await authService.registerBibliotecario(req.body, adminId);
    
    respuesta.success(req, res, {
      mensaje: 'Bibliotecario registrado exitosamente',
      ...result
    }, 201);
  } catch (error) {
    if (error.status) {
      return respuesta.error(req, res, error.message, error.status);
    }
    next(error);
  }
};

/**
 * POST /auth/registro/administrador
 * Registro de administrador (solo admins)
 */
exports.registroAdministrador = async (req, res, next) => {
  try {
    const adminId = req.usuario.id;
    const result = await authService.registerAdministrador(req.body, adminId);
    
    respuesta.success(req, res, {
      mensaje: 'Administrador registrado exitosamente',
      ...result
    }, 201);
  } catch (error) {
    if (error.status) {
      return respuesta.error(req, res, error.message, error.status);
    }
    next(error);
  }
};

/**
 * POST /auth/setup
 * Crear primer administrador (solo si no existe ninguno)
 */
exports.setup = async (req, res, next) => {
  try {
    const result = await authService.crearPrimerAdmin(req.body);
    
    respuesta.success(req, res, {
      mensaje: 'Administrador inicial creado exitosamente',
      ...result
    }, 201);
  } catch (error) {
    if (error.status) {
      return respuesta.error(req, res, error.message, error.status);
    }
    next(error);
  }
};

/**
 * GET /auth/me
 * Obtener perfil del usuario autenticado
 */
exports.getPerfil = async (req, res, next) => {
  try {
    const { id, rol } = req.usuario;
    const perfil = await authService.getPerfil(id, rol);
    
    respuesta.success(req, res, perfil, 200);
  } catch (error) {
    if (error.status) {
      return respuesta.error(req, res, error.message, error.status);
    }
    next(error);
  }
};

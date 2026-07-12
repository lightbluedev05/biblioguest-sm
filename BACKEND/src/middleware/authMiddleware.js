const jwt = require('jsonwebtoken');
const config = require('../config/config');
const respuesta = require('../util/respuestas');

/**
 * Middleware para verificar token JWT
 * Extrae el token del header Authorization: Bearer <token>
 */
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return respuesta.error(req, res, 'Token de acceso no proporcionado', 401);
    }
    
    // Formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return respuesta.error(req, res, 'Formato de token inválido. Use: Bearer <token>', 401);
    }
    
    const token = parts[1];
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Adjuntar usuario decodificado al request
    req.usuario = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return respuesta.error(req, res, 'Token expirado', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return respuesta.error(req, res, 'Token inválido', 401);
    }
    return respuesta.error(req, res, 'Error de autenticación', 401);
  }
};

/**
 * Middleware opcional para verificar token
 * No falla si no hay token, solo adjunta usuario si existe
 */
exports.optionalToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.usuario = null;
      return next();
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.usuario = null;
      return next();
    }
    
    const token = parts[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    req.usuario = decoded;
    
    next();
  } catch (error) {
    // Si el token es inválido, simplemente no adjuntamos usuario
    req.usuario = null;
    next();
  }
};

/**
 * Factory para middleware de verificación de roles
 * @param  {...string} rolesPermitidos - Roles que tienen acceso
 * @returns {Function} Middleware de Express
 */
exports.requireRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    // Primero debe haber pasado por verifyToken
    if (!req.usuario) {
      return respuesta.error(req, res, 'No autenticado', 401);
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return respuesta.error(
        req, 
        res, 
        `Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}`, 
        403
      );
    }
    
    next();
  };
};

/**
 * Shortcut: Solo administradores
 */
exports.requireAdmin = [
  exports.verifyToken,
  exports.requireRol('administrador')
];

/**
 * Shortcut: Bibliotecarios y administradores
 */
exports.requireBibliotecarioOrAdmin = [
  exports.verifyToken,
  exports.requireRol('bibliotecario', 'administrador')
];

/**
 * Shortcut: Cualquier usuario autenticado
 */
exports.requireAuth = [
  exports.verifyToken
];

/**
 * Shortcut: Estudiantes, bibliotecarios y administradores
 */
exports.requireAnyRole = [
  exports.verifyToken,
  exports.requireRol('estudiante', 'bibliotecario', 'administrador')
];

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const authModel = require('../models/auth_model');

const SALT_ROUNDS = 10;

// ============================================================
// UTILIDADES DE HASH Y TOKEN
// ============================================================

/**
 * Hashear contraseña con bcrypt
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Comparar contraseña con hash
 */
exports.comparePassword = async (password, hash) => {
  if (!hash) return false;
  return await bcrypt.compare(password, hash);
};

/**
 * Generar JWT
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Verificar JWT
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

// ============================================================
// LOGIN
// ============================================================

/**
 * Login universal - detecta automáticamente el tipo de usuario
 * @param {string} identificador - Correo o código institucional
 * @param {string} password - Contraseña en texto plano
 * @returns {object} { token, usuario }
 */
exports.login = async (identificador, password) => {
  console.log('[DEBUG] Login attempt:', { identificador, password: '***' });
  
  if (!identificador || !password) {
    throw { status: 400, message: 'Identificador y contraseña son requeridos' };
  }

  let usuario = null;
  let rol = null;
  let idField = null;

  // Intentar buscar como administrador (por correo)
  usuario = await authModel.findAdministradorByCorreo(identificador);
  console.log('[DEBUG] Admin search result:', usuario ? 'FOUND' : 'NOT FOUND');
  if (usuario) {
    rol = 'administrador';
    idField = 'ID_ADMINISTRADOR';
  }

  // Si no es admin, buscar como bibliotecario (por correo)
  if (!usuario) {
    usuario = await authModel.findBibliotecarioByCorreo(identificador);
    console.log('[DEBUG] Biblio search result:', usuario ? 'FOUND' : 'NOT FOUND');
    if (usuario) {
      rol = 'bibliotecario';
      idField = 'ID_BIBLIOTECARIO';
    }
  }

  // Si no es bibliotecario, buscar como estudiante (por correo o código)
  if (!usuario) {
    // Primero intentar por correo
    usuario = await authModel.findUsuarioByCorreo(identificador);
    console.log('[DEBUG] Usuario by correo result:', usuario ? 'FOUND' : 'NOT FOUND');
    if (!usuario) {
      // Si no, intentar por código institucional
      usuario = await authModel.findUsuarioByCodigo(identificador);
      console.log('[DEBUG] Usuario by codigo result:', usuario ? 'FOUND' : 'NOT FOUND');
    }
    if (usuario) {
      rol = 'estudiante';
      idField = 'ID_USUARIO';
    }
  }

  // Si no se encontró ningún usuario
  if (!usuario) {
    console.log('[DEBUG] No user found for:', identificador);
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  console.log('[DEBUG] User found:', { rol, hasPasswordHash: !!usuario.PASSWORD_HASH });
  console.log('[DEBUG] Password hash from DB:', usuario.PASSWORD_HASH);
  console.log('[DEBUG] Hash length:', usuario.PASSWORD_HASH ? usuario.PASSWORD_HASH.length : 0);

  // Verificar contraseña
  const passwordValid = await this.comparePassword(password, usuario.PASSWORD_HASH);
  console.log('[DEBUG] Password valid:', passwordValid);
  if (!passwordValid) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  // Para estudiantes, verificar que no estén bloqueados
  if (rol === 'estudiante' && usuario.ESTADO === 'bloqueado') {
    throw { status: 403, message: 'Usuario bloqueado. Contacte a un administrador.' };
  }

  // Generar token
  const tokenPayload = {
    id: usuario[idField],
    correo: usuario.CORREO,
    nombre: usuario.NOMBRE,
    rol
  };

  const token = this.generateToken(tokenPayload);

  // Preparar datos del usuario para respuesta (sin password_hash)
  const usuarioResponse = {
    id: usuario[idField],
    nombre: usuario.NOMBRE,
    correo: usuario.CORREO,
    rol
  };

  // Añadir campos específicos según rol
  if (rol === 'estudiante') {
    usuarioResponse.codigoInstitucional = usuario.CODIGO_INSTITUCIONAL;
    usuarioResponse.estado = usuario.ESTADO;
    usuarioResponse.idUnidad = usuario.ID_UNIDAD;
  } else if (rol === 'bibliotecario') {
    usuarioResponse.turno = usuario.TURNO;
  }

  return { token, usuario: usuarioResponse };
};

// ============================================================
// REGISTRO
// ============================================================

/**
 * Registrar estudiante
 * @param {object} data - { nombre, codigoInstitucional, correo, idUnidad, password }
 * @param {object} creador - Usuario que realiza el registro (null para auto-registro)
 */
exports.registerEstudiante = async (data, creador = null) => {
  const { nombre, codigoInstitucional, correo, idUnidad, password } = data;

  // Validaciones
  if (!nombre || !codigoInstitucional || !correo) {
    throw { status: 400, message: 'Nombre, código institucional y correo son requeridos' };
  }

  // Verificar que no exista el código
  const existeCodigo = await authModel.findUsuarioByCodigo(codigoInstitucional);
  if (existeCodigo) {
    throw { status: 409, message: 'El código institucional ya está registrado' };
  }

  // Verificar que no exista el correo
  const existeCorreo = await authModel.findUsuarioByCorreo(correo);
  if (existeCorreo) {
    throw { status: 409, message: 'El correo ya está registrado' };
  }

  // Si no se proporciona password, usar el código institucional como default
  const passwordToHash = password || codigoInstitucional;
  const passwordHash = await this.hashPassword(passwordToHash);

  const idUsuario = await authModel.createUsuario({
    nombre,
    codigoInstitucional,
    correo,
    estado: 'activo',
    idUnidad,
    passwordHash
  });

  return { idUsuario, codigoInstitucional };
};

/**
 * Registrar bibliotecario (solo admins)
 * @param {object} data - { nombre, correo, turno, password }
 * @param {number} adminId - ID del administrador que crea
 */
exports.registerBibliotecario = async (data, adminId) => {
  const { nombre, correo, turno, password } = data;

  // Validaciones
  if (!nombre || !correo || !password) {
    throw { status: 400, message: 'Nombre, correo y contraseña son requeridos' };
  }

  // Verificar que no exista el correo en bibliotecarios
  const existeCorreo = await authModel.findBibliotecarioByCorreo(correo);
  if (existeCorreo) {
    throw { status: 409, message: 'El correo ya está registrado como bibliotecario' };
  }

  const passwordHash = await this.hashPassword(password);

  const idBibliotecario = await authModel.createBibliotecario({
    nombre,
    correo,
    turno,
    passwordHash
  });

  return { idBibliotecario };
};

/**
 * Registrar administrador (solo admins)
 * @param {object} data - { nombre, correo, password }
 * @param {number} adminId - ID del administrador que crea
 */
exports.registerAdministrador = async (data, adminId) => {
  const { nombre, correo, password } = data;

  // Validaciones
  if (!nombre || !correo || !password) {
    throw { status: 400, message: 'Nombre, correo y contraseña son requeridos' };
  }

  // Verificar que no exista el correo
  const existeCorreo = await authModel.findAdministradorByCorreo(correo);
  if (existeCorreo) {
    throw { status: 409, message: 'El correo ya está registrado como administrador' };
  }

  const passwordHash = await this.hashPassword(password);

  const idAdministrador = await authModel.createAdministrador({
    nombre,
    correo,
    passwordHash,
    creadoPor: adminId
  });

  return { idAdministrador };
};

/**
 * Crear primer administrador (solo si no existe ninguno)
 */
exports.crearPrimerAdmin = async (data) => {
  const existeAdmin = await authModel.existeAdministrador();
  if (existeAdmin) {
    throw { status: 403, message: 'Ya existe un administrador en el sistema' };
  }

  const { nombre, correo, password } = data;

  if (!nombre || !correo || !password) {
    throw { status: 400, message: 'Nombre, correo y contraseña son requeridos' };
  }

  const passwordHash = await this.hashPassword(password);

  const idAdministrador = await authModel.createAdministrador({
    nombre,
    correo,
    passwordHash,
    creadoPor: null
  });

  return { idAdministrador };
};

/**
 * Obtener perfil del usuario autenticado
 */
exports.getPerfil = async (userId, rol) => {
  let usuario = null;

  switch (rol) {
    case 'estudiante':
      usuario = await authModel.getUsuarioById(userId);
      break;
    case 'bibliotecario':
      usuario = await authModel.getBibliotecarioById(userId);
      break;
    case 'administrador':
      usuario = await authModel.getAdministradorById(userId);
      break;
    default:
      throw { status: 400, message: 'Rol inválido' };
  }

  if (!usuario) {
    throw { status: 404, message: 'Usuario no encontrado' };
  }

  return { ...usuario, rol };
};

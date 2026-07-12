const db = require('../config/db');
const oracledb = require('oracledb');

// ============================================================
// BUSCAR USUARIOS POR CREDENCIALES
// ============================================================

/**
 * Buscar estudiante por correo
 */
exports.findUsuarioByCorreo = async (correo) => {
  const query = `
    SELECT 
      ID_USUARIO,
      NOMBRE,
      CODIGO_INSTITUCIONAL,
      CORREO,
      ESTADO,
      ID_UNIDAD,
      PASSWORD_HASH
    FROM USUARIO
    WHERE UPPER(CORREO) = UPPER(:correo)
  `;
  
  const result = await db.query(query, { correo });
  return result[0].rows[0] || null;
};

/**
 * Buscar estudiante por código institucional
 */
exports.findUsuarioByCodigo = async (codigo) => {
  const query = `
    SELECT 
      ID_USUARIO,
      NOMBRE,
      CODIGO_INSTITUCIONAL,
      CORREO,
      ESTADO,
      ID_UNIDAD,
      PASSWORD_HASH
    FROM USUARIO
    WHERE CODIGO_INSTITUCIONAL = :codigo
  `;
  
  const result = await db.query(query, { codigo });
  return result[0].rows[0] || null;
};

/**
 * Buscar bibliotecario por correo
 */
exports.findBibliotecarioByCorreo = async (correo) => {
  const query = `
    SELECT 
      ID_BIBLIOTECARIO,
      NOMBRE,
      CORREO,
      TURNO,
      PASSWORD_HASH
    FROM BIBLIOTECARIO
    WHERE UPPER(CORREO) = UPPER(:correo)
  `;
  
  const result = await db.query(query, { correo });
  return result[0].rows[0] || null;
};

/**
 * Buscar administrador por correo
 */
exports.findAdministradorByCorreo = async (correo) => {
  const query = `
    SELECT 
      ID_ADMINISTRADOR,
      NOMBRE,
      CORREO,
      PASSWORD_HASH,
      FECHA_CREACION,
      CREADO_POR
    FROM ADMINISTRADOR
    WHERE UPPER(CORREO) = UPPER(:correo)
  `;
  
  const result = await db.query(query, { correo });
  return result[0].rows[0] || null;
};

// ============================================================
// CREAR USUARIOS
// ============================================================

/**
 * Crear estudiante (Usuario)
 */
exports.createUsuario = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const { nombre, codigoInstitucional, correo, estado, idUnidad, passwordHash } = data;
    
    const result = await connection.execute(
      `
      INSERT INTO USUARIO (
        NOMBRE,
        CODIGO_INSTITUCIONAL,
        CORREO,
        ESTADO,
        ID_UNIDAD,
        PASSWORD_HASH
      ) VALUES (
        :nombre,
        :codigoInstitucional,
        :correo,
        :estado,
        :idUnidad,
        :passwordHash
      )
      RETURNING ID_USUARIO INTO :idUsuario
      `,
      {
        nombre,
        codigoInstitucional,
        correo,
        estado: estado || 'activo',
        idUnidad: idUnidad ? Number(idUnidad) : null,
        passwordHash,
        idUsuario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    
    await connection.commit();
    return result.outBinds.idUsuario[0];
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
};

/**
 * Crear bibliotecario
 */
exports.createBibliotecario = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const { nombre, correo, turno, passwordHash } = data;
    
    const result = await connection.execute(
      `
      INSERT INTO BIBLIOTECARIO (
        NOMBRE,
        CORREO,
        TURNO,
        PASSWORD_HASH
      ) VALUES (
        :nombre,
        :correo,
        :turno,
        :passwordHash
      )
      RETURNING ID_BIBLIOTECARIO INTO :idBibliotecario
      `,
      {
        nombre,
        correo,
        turno: turno || null,
        passwordHash,
        idBibliotecario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    
    await connection.commit();
    return result.outBinds.idBibliotecario[0];
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
};

/**
 * Crear administrador
 */
exports.createAdministrador = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const { nombre, correo, passwordHash, creadoPor } = data;
    
    const result = await connection.execute(
      `
      INSERT INTO ADMINISTRADOR (
        NOMBRE,
        CORREO,
        PASSWORD_HASH,
        CREADO_POR
      ) VALUES (
        :nombre,
        :correo,
        :passwordHash,
        :creadoPor
      )
      RETURNING ID_ADMINISTRADOR INTO :idAdministrador
      `,
      {
        nombre,
        correo,
        passwordHash,
        creadoPor: creadoPor ? Number(creadoPor) : null,
        idAdministrador: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    
    await connection.commit();
    return result.outBinds.idAdministrador[0];
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
};

// ============================================================
// ACTUALIZAR CONTRASEÑAS
// ============================================================

/**
 * Actualizar password hash de un usuario
 * @param {string} tipo - 'usuario' | 'bibliotecario' | 'administrador'
 * @param {number} id - ID del registro
 * @param {string} passwordHash - Nuevo hash
 */
exports.updatePasswordHash = async (tipo, id, passwordHash) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query;
    let binds = { id: Number(id), passwordHash };
    
    switch (tipo) {
      case 'usuario':
        query = `UPDATE USUARIO SET PASSWORD_HASH = :passwordHash WHERE ID_USUARIO = :id`;
        break;
      case 'bibliotecario':
        query = `UPDATE BIBLIOTECARIO SET PASSWORD_HASH = :passwordHash WHERE ID_BIBLIOTECARIO = :id`;
        break;
      case 'administrador':
        query = `UPDATE ADMINISTRADOR SET PASSWORD_HASH = :passwordHash WHERE ID_ADMINISTRADOR = :id`;
        break;
      default:
        throw new Error('Tipo de usuario inválido');
    }
    
    const result = await connection.execute(query, binds);
    await connection.commit();
    
    return result.rowsAffected || 0;
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
};

/**
 * Verificar si existe un administrador en el sistema
 */
exports.existeAdministrador = async () => {
  const query = `SELECT COUNT(*) AS TOTAL FROM ADMINISTRADOR`;
  const result = await db.query(query, {});
  return (result[0].rows[0].TOTAL || 0) > 0;
};

/**
 * Obtener usuario por ID
 */
exports.getUsuarioById = async (id) => {
  const query = `
    SELECT 
      ID_USUARIO,
      NOMBRE,
      CODIGO_INSTITUCIONAL,
      CORREO,
      ESTADO,
      ID_UNIDAD
    FROM USUARIO
    WHERE ID_USUARIO = :id
  `;
  
  const result = await db.query(query, { id: Number(id) });
  return result[0].rows[0] || null;
};

/**
 * Obtener bibliotecario por ID
 */
exports.getBibliotecarioById = async (id) => {
  const query = `
    SELECT 
      ID_BIBLIOTECARIO,
      NOMBRE,
      CORREO,
      TURNO
    FROM BIBLIOTECARIO
    WHERE ID_BIBLIOTECARIO = :id
  `;
  
  const result = await db.query(query, { id: Number(id) });
  return result[0].rows[0] || null;
};

/**
 * Obtener administrador por ID
 */
exports.getAdministradorById = async (id) => {
  const query = `
    SELECT 
      ID_ADMINISTRADOR,
      NOMBRE,
      CORREO,
      FECHA_CREACION,
      CREADO_POR
    FROM ADMINISTRADOR
    WHERE ID_ADMINISTRADOR = :id
  `;
  
  const result = await db.query(query, { id: Number(id) });
  return result[0].rows[0] || null;
};

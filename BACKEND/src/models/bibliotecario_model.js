const db = require('../config/db');
const oracledb = require('oracledb');

// ============================================================
// COUNT Y LIST BIBLIOTECARIOS
// ============================================================

exports.countBibliotecarios = async (data = {}) => {
  const { nombre, correo, turno } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM Bibliotecario
    WHERE 1 = 1
  `;
  const binds = {};

  if (nombre) {
    query += ` AND UPPER(nombre) LIKE UPPER(:nombre)`;
    binds.nombre = `%${nombre}%`;
  }

  if (correo) {
    query += ` AND UPPER(correo) LIKE UPPER(:correo)`;
    binds.correo = `%${correo}%`;
  }

  if (turno) {
    query += ` AND UPPER(turno) = UPPER(:turno)`;
    binds.turno = turno;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
};

exports.getBibliotecarios = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const { nombre, correo, turno } = data;

  let query = `
    SELECT
      ID_BIBLIOTECARIO,
      NOMBRE,
      CORREO,
      TURNO,
      ESTADO
    FROM Bibliotecario
    WHERE (ESTADO IS NULL OR UPPER(ESTADO) != 'INACTIVO')
  `;
  const binds = {};

  if (nombre) {
    query += ` AND UPPER(nombre) LIKE UPPER(:nombre)`;
    binds.nombre = `%${nombre}%`;
  }

  if (correo) {
    query += ` AND UPPER(correo) LIKE UPPER(:correo)`;
    binds.correo = `%${correo}%`;
  }

  if (turno) {
    query += ` AND UPPER(turno) = UPPER(:turno)`;
    binds.turno = turno;
  }

  query += `
    ORDER BY nombre
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, offset, limit };

  const result = await db.query(query, queryParams);
  return result[0].rows;
};

// ============================================================
// GET BY ID
// ============================================================

exports.getBibliotecarioById = async (idBibliotecario) => {
  const query = `
    SELECT
      ID_BIBLIOTECARIO,
      NOMBRE,
      CORREO,
      TURNO
    FROM Bibliotecario
    WHERE ID_BIBLIOTECARIO = :idBibliotecario
  `;

  const result = await db.query(query, { idBibliotecario: Number(idBibliotecario) });
  return result[0].rows[0] || null;
};

// ============================================================
// UPDATE BIBLIOTECARIO
// ============================================================

exports.updateBibliotecario = async (idBibliotecario, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idBibliotecario, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idBibliotecario inválido');
    }

    const fields = [];
    const binds = { idBibliotecario: id };

    if (data.nombre !== undefined) {
      fields.push('NOMBRE = :nombre');
      binds.nombre = data.nombre;
    }

    if (data.correo !== undefined) {
      fields.push('CORREO = :correo');
      binds.correo = data.correo;
    }

    if (data.turno !== undefined) {
      fields.push('TURNO = :turno');
      binds.turno = data.turno;
    }

    if (fields.length === 0) {
      return 0;
    }

    const query = `
      UPDATE Bibliotecario
         SET ${fields.join(', ')}
       WHERE ID_BIBLIOTECARIO = :idBibliotecario
    `;

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

// ============================================================
// DELETE BIBLIOTECARIO (Soft delete - set estado = 'inactivo')
// ============================================================

exports.deleteBibliotecario = async (idBibliotecario) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idBibliotecario, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idBibliotecario inválido');
    }

    // Soft delete: cambiar estado a 'inactivo'
    const result = await connection.execute(
      `
      UPDATE Bibliotecario
         SET ESTADO = 'inactivo'
       WHERE ID_BIBLIOTECARIO = :idBibliotecario
      `,
      { idBibliotecario: id }
    );

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

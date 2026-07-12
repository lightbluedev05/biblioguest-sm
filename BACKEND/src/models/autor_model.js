const db = require('../config/db');
const oracledb = require('oracledb');

exports.countAutores = async (data = {}) => {
  const { nombre, apellido, nacionalidad } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM AUTOR
    WHERE 1 = 1
  `;

  const binds = {};

  if (nombre) {
    query += ` AND UPPER(NOMBRE) LIKE UPPER(:nombre)`;
    binds.nombre = `%${nombre}%`;
  }

  if (apellido) {
    query += ` AND UPPER(APELLIDO) LIKE UPPER(:apellido)`;
    binds.apellido = `%${apellido}%`;
  }

  if (nacionalidad) {
    query += ` AND UPPER(NACIONALIDAD) LIKE UPPER(:nacionalidad)`;
    binds.nacionalidad = `%${nacionalidad}%`;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
};

exports.getAutores = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const { nombre, apellido, nacionalidad } = data;

  let query = `
    SELECT
      ID_AUTOR,
      NOMBRE,
      APELLIDO,
      NACIONALIDAD
    FROM AUTOR
    WHERE 1 = 1
  `;

  const binds = {};

  if (nombre) {
    query += ` AND UPPER(NOMBRE) LIKE UPPER(:nombre)`;
    binds.nombre = `%${nombre}%`;
  }

  if (apellido) {
    query += ` AND UPPER(APELLIDO) LIKE UPPER(:apellido)`;
    binds.apellido = `%${apellido}%`;
  }

  if (nacionalidad) {
    query += ` AND UPPER(NACIONALIDAD) LIKE UPPER(:nacionalidad)`;
    binds.nacionalidad = `%${nacionalidad}%`;
  }

  query += `
    ORDER BY APELLIDO, NOMBRE, ID_AUTOR
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, offset, limit };

  const result = await db.query(query, queryParams);
  return result[0].rows;
};


exports.getAutorById = async (idAutor) => {
  const query = `
    SELECT
      ID_AUTOR,
      NOMBRE,
      APELLIDO,
      NACIONALIDAD
    FROM AUTOR
    WHERE ID_AUTOR = :idAutor
  `;

  const result = await db.query(query, { idAutor: Number(idAutor) });
  return result[0].rows[0];
};


exports.createAutor = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const nombre = (data.nombre || '').trim();
    const apellido = (data.apellido || '').trim();
    const nacionalidad = data.nacionalidad ? data.nacionalidad.trim() : null;

    if (!nombre || !apellido) {
      throw new Error('Campos requeridos: nombre y apellido');
    }

    const result = await connection.execute(
      `
      INSERT INTO AUTOR (
        NOMBRE,
        APELLIDO,
        NACIONALIDAD
      ) VALUES (
        :nombre,
        :apellido,
        :nacionalidad
      )
      RETURNING ID_AUTOR INTO :idAutor
      `,
      {
        nombre,
        apellido,
        nacionalidad,
        idAutor: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await connection.commit();

    const out = result.outBinds.idAutor;
    const idAutor = Array.isArray(out) ? out[0] : out;
    return idAutor;
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


exports.updateAutor = async (idAutor, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idAutor, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idAutor inválido');
    }

    const fields = [];
    const binds = { idAutor: id };

    if (data.nombre !== undefined) {
      fields.push('NOMBRE = :nombre');
      binds.nombre = data.nombre.trim();
    }

    if (data.apellido !== undefined) {
      fields.push('APELLIDO = :apellido');
      binds.apellido = data.apellido.trim();
    }

    if (data.nacionalidad !== undefined) {
      fields.push('NACIONALIDAD = :nacionalidad');
      binds.nacionalidad = data.nacionalidad ? data.nacionalidad.trim() : null;
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const query = `
      UPDATE AUTOR
         SET ${fields.join(', ')}
       WHERE ID_AUTOR = :idAutor
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


exports.deleteAutor = async (idAutor) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idAutor, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idAutor inválido');
    }

    const result = await connection.execute(
      `
      DELETE FROM AUTOR
      WHERE ID_AUTOR = :idAutor
      `,
      { idAutor: id }
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

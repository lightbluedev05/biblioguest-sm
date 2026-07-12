const db = require('../config/db');
const oracledb = require('oracledb');


exports.countCategorias = async (data = {}) => {
  const { nombre, descripcion } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM CATEGORIAS
    WHERE 1 = 1
  `;

  const binds = {};

  if (nombre) {
    query += ` AND UPPER(NOMBRE) LIKE UPPER(:nombre)`;
    binds.nombre = `%${nombre}%`;
  }

  if (descripcion) {
    query += ` AND UPPER(DESCRIPCION) LIKE UPPER(:descripcion)`;
    binds.descripcion = `%${descripcion}%`;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
};

exports.getCategorias = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const { nombre, descripcion } = data;

  let query = `
    SELECT
      ID_CATEGORIA,
      NOMBRE,
      DESCRIPCION
    FROM CATEGORIAS
    WHERE 1 = 1
  `;

  const binds = {};

  if (nombre) {
    query += ` AND UPPER(NOMBRE) LIKE UPPER(:nombre)`;
    binds.nombre = `%${nombre}%`;
  }

  if (descripcion) {
    query += ` AND UPPER(DESCRIPCION) LIKE UPPER(:descripcion)`;
    binds.descripcion = `%${descripcion}%`;
  }

  query += `
    ORDER BY NOMBRE, ID_CATEGORIA
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, offset, limit };

  const result = await db.query(query, queryParams);
  return result[0].rows;
};


exports.getCategoriaById = async (idCategoria) => {
  const query = `
    SELECT
      ID_CATEGORIA,
      NOMBRE,
      DESCRIPCION
    FROM CATEGORIAS
    WHERE ID_CATEGORIA = :idCategoria
  `;

  const result = await db.query(query, { idCategoria: Number(idCategoria) });
  return result[0].rows[0];
};


exports.createCategoria = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const nombre = (data.nombre || '').trim();
    const descripcion = data.descripcion ? data.descripcion.trim() : null;

    if (!nombre) {
      throw new Error('Campo requerido: nombre');
    }

    const result = await connection.execute(
      `
      INSERT INTO CATEGORIAS (
        NOMBRE,
        DESCRIPCION
      ) VALUES (
        :nombre,
        :descripcion
      )
      RETURNING ID_CATEGORIA INTO :idCategoria
      `,
      {
        nombre,
        descripcion,
        idCategoria: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await connection.commit();

    const out = result.outBinds.idCategoria;
    const idCategoria = Array.isArray(out) ? out[0] : out;
    return idCategoria;
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


exports.updateCategoria = async (idCategoria, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idCategoria, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idCategoria inválido');
    }

    const fields = [];
    const binds = { idCategoria: id };

    if (data.nombre !== undefined) {
      fields.push('NOMBRE = :nombre');
      binds.nombre = data.nombre.trim();
    }

    if (data.descripcion !== undefined) {
      fields.push('DESCRIPCION = :descripcion');
      binds.descripcion = data.descripcion ? data.descripcion.trim() : null;
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const query = `
      UPDATE CATEGORIAS
         SET ${fields.join(', ')}
       WHERE ID_CATEGORIA = :idCategoria
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


exports.deleteCategoria = async (idCategoria) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idCategoria, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idCategoria inválido');
    }

    const result = await connection.execute(
      `
      DELETE FROM CATEGORIAS
      WHERE ID_CATEGORIA = :idCategoria
      `,
      { idCategoria: id }
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

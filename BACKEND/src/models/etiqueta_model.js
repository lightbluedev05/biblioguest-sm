const db = require('../config/db');
const oracledb = require('oracledb');

exports.countEtiquetas = async (data = {}) => {
  const { nombre, descripcion } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM ETIQUETAS
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

exports.getEtiquetas = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const { nombre, descripcion } = data;

  let query = `
    SELECT
      ID_ETIQUETA,
      NOMBRE,
      DESCRIPCION
    FROM ETIQUETAS
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
    ORDER BY NOMBRE, ID_ETIQUETA
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, offset, limit };

  const result = await db.query(query, queryParams);
  return result[0].rows;
};

exports.getEtiquetaById = async (idEtiqueta) => {
  const query = `
    SELECT
      ID_ETIQUETA,
      NOMBRE,
      DESCRIPCION
    FROM ETIQUETAS
    WHERE ID_ETIQUETA = :idEtiqueta
  `;

  const result = await db.query(query, { idEtiqueta: Number(idEtiqueta) });
  return result[0].rows[0];
};

exports.createEtiqueta = async (data) => {
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
      INSERT INTO ETIQUETAS (
        NOMBRE,
        DESCRIPCION
      ) VALUES (
        :nombre,
        :descripcion
      )
      RETURNING ID_ETIQUETA INTO :idEtiqueta
      `,
      {
        nombre,
        descripcion,
        idEtiqueta: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await connection.commit();

    const out = result.outBinds.idEtiqueta;
    const idEtiqueta = Array.isArray(out) ? out[0] : out;
    return idEtiqueta;
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

exports.updateEtiqueta = async (idEtiqueta, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idEtiqueta, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idEtiqueta inválido');
    }

    const fields = [];
    const binds = { idEtiqueta: id };

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
      UPDATE ETIQUETAS
         SET ${fields.join(', ')}
       WHERE ID_ETIQUETA = :idEtiqueta
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

exports.deleteEtiqueta = async (idEtiqueta) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idEtiqueta, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idEtiqueta inválido');
    }

    const result = await connection.execute(
      `
      DELETE FROM ETIQUETAS
      WHERE ID_ETIQUETA = :idEtiqueta
      `,
      { idEtiqueta: id }
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

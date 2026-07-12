const db = require('../config/db');
const oracledb = require('oracledb');

exports.countEjemplares = async (data = {}) => {
  const { idLibro, idBiblioteca, estado, codigoBarra } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM EJEMPLAR
    WHERE 1 = 1
  `;

  const binds = {};

  if (idLibro) {
    query += ` AND ID_LIBRO = :idLibro`;
    binds.idLibro = Number(idLibro);
  }

  if (idBiblioteca) {
    query += ` AND ID_BIBLIOTECA = :idBiblioteca`;
    binds.idBiblioteca = Number(idBiblioteca);
  }

  if (estado) {
    query += ` AND UPPER(ESTADO) = UPPER(:estado)`;
    binds.estado = estado;
  }

  if (codigoBarra) {
    query += ` AND CODIGO_BARRA = :codigoBarra`;
    binds.codigoBarra = codigoBarra;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
};

exports.getEjemplares = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const { idLibro, idBiblioteca, estado, codigoBarra } = data;

  let query = `
    SELECT
      ID_EJEMPLAR,
      ID_LIBRO,
      ID_BIBLIOTECA,
      CODIGO_BARRA,
      ESTADO
    FROM EJEMPLAR
    WHERE 1 = 1
  `;

  const binds = {};

  if (idLibro) {
    query += ` AND ID_LIBRO = :idLibro`;
    binds.idLibro = Number(idLibro);
  }

  if (idBiblioteca) {
    query += ` AND ID_BIBLIOTECA = :idBiblioteca`;
    binds.idBiblioteca = Number(idBiblioteca);
  }

  if (estado) {
    query += ` AND UPPER(ESTADO) = UPPER(:estado)`;
    binds.estado = estado;
  }

  if (codigoBarra) {
    query += ` AND CODIGO_BARRA = :codigoBarra`;
    binds.codigoBarra = codigoBarra;
  }

  query += `
    ORDER BY ID_EJEMPLAR
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, offset, limit };

  const result = await db.query(query, queryParams);
  return result[0].rows;
};


exports.getEjemplarById = async (idEjemplar) => {
  const query = `
    SELECT
      ID_EJEMPLAR,
      ID_LIBRO,
      ID_BIBLIOTECA,
      CODIGO_BARRA,
      ESTADO
    FROM EJEMPLAR
    WHERE ID_EJEMPLAR = :idEjemplar
  `;

  const result = await db.query(query, { idEjemplar: Number(idEjemplar) });
  return result[0].rows[0];
};


exports.createEjemplar = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const {
      idLibro,
      idBiblioteca,
      codigoBarra,
      estado,
    } = data;

    const estadoNormalizado = estado
      ? estado.toLowerCase()
      : 'disponible';

    const result = await connection.execute(
      `
      INSERT INTO EJEMPLAR (
        ID_LIBRO,
        ID_BIBLIOTECA,
        CODIGO_BARRA,
        ESTADO
      ) VALUES (
        :idLibro,
        :idBiblioteca,
        :codigoBarra,
        :estado
      )
      RETURNING ID_EJEMPLAR INTO :idEjemplar
      `,
      {
        idLibro: Number(idLibro),
        idBiblioteca: idBiblioteca !== undefined && idBiblioteca !== null
          ? Number(idBiblioteca)
          : null,
        codigoBarra: codigoBarra || null,
        estado: estadoNormalizado,
        idEjemplar: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await connection.commit();

    const idEjemplar = result.outBinds.idEjemplar[0];
    return idEjemplar;
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

exports.updateEjemplar = async (idEjemplar, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const {
      idLibro,
      idBiblioteca,
      codigoBarra,
      estado,
    } = data;

    const sets = [];
    const binds = { idEjemplar: Number(idEjemplar) };

    if (idLibro !== undefined) {
      sets.push('ID_LIBRO = :idLibro');
      binds.idLibro = idLibro !== null ? Number(idLibro) : null;
    }

    if (idBiblioteca !== undefined) {
      sets.push('ID_BIBLIOTECA = :idBiblioteca');
      binds.idBiblioteca = idBiblioteca !== null ? Number(idBiblioteca) : null;
    }

    if (codigoBarra !== undefined) {
      sets.push('CODIGO_BARRA = :codigoBarra');
      binds.codigoBarra = codigoBarra;
    }

    if (estado !== undefined) {
      sets.push('ESTADO = :estado');
      binds.estado = estado ? estado.toLowerCase() : null;
    }

    if (sets.length === 0) {
      return 0;
    }

    const query = `
      UPDATE EJEMPLAR
      SET ${sets.join(', ')}
      WHERE ID_EJEMPLAR = :idEjemplar
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

exports.deleteEjemplar = async (idEjemplar) => {
  let connection;
  try {
    connection = await db.getConnection();

    const result = await connection.execute(
      `
      DELETE FROM EJEMPLAR
      WHERE ID_EJEMPLAR = :idEjemplar
      `,
      { idEjemplar: Number(idEjemplar) }
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


exports.deteriorarEjemplar = async (idEjemplar) => {
  let connection;
  try {
    connection = await db.getConnection();

    const result = await connection.execute(
      `
      UPDATE EJEMPLAR
      SET ESTADO = 'deteriorado'
      WHERE ID_EJEMPLAR = :idEjemplar
      `,
      { idEjemplar: Number(idEjemplar) }
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

exports.restaurarEjemplar = async (idEjemplar) => {
  let connection;
  try {
    connection = await db.getConnection();

    const result = await connection.execute(
      `
      UPDATE EJEMPLAR
      SET ESTADO = 'disponible'
      WHERE ID_EJEMPLAR = :idEjemplar
      `,
      { idEjemplar: Number(idEjemplar) }
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

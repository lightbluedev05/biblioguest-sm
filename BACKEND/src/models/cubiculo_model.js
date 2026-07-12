const db = require('../config/db');
const oracledb = require('oracledb');

exports.countCubiculos = async (data = {}) => {
  const { capacidadMin, capacidadMax, idBiblioteca, estado } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM CUBICULO
    WHERE 1 = 1
  `;

  const binds = {};

  if (capacidadMin) {
    query += ` AND CAPACIDAD >= :capacidadMin`;
    binds.capacidadMin = Number(capacidadMin);
  }

  if (capacidadMax) {
    query += ` AND CAPACIDAD <= :capacidadMax`;
    binds.capacidadMax = Number(capacidadMax);
  }

  if (idBiblioteca) {
    query += ` AND ID_BIBLIOTECA = :idBiblioteca`;
    binds.idBiblioteca = Number(idBiblioteca);
  }

  if (estado) {
    query += ` AND UPPER(ESTADO) = UPPER(:estado)`;
    binds.estado = estado;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
};

exports.getCubiculos = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const { capacidadMin, capacidadMax, idBiblioteca, estado } = data;

  let query = `
    SELECT
      ID_CUBICULO,
      CAPACIDAD,
      ID_BIBLIOTECA,
      ESTADO
    FROM CUBICULO
    WHERE 1 = 1
  `;

  const binds = {};

  if (capacidadMin) {
    query += ` AND CAPACIDAD >= :capacidadMin`;
    binds.capacidadMin = Number(capacidadMin);
  }

  if (capacidadMax) {
    query += ` AND CAPACIDAD <= :capacidadMax`;
    binds.capacidadMax = Number(capacidadMax);
  }

  if (idBiblioteca) {
    query += ` AND ID_BIBLIOTECA = :idBiblioteca`;
    binds.idBiblioteca = Number(idBiblioteca);
  }

  if (estado) {
    query += ` AND UPPER(ESTADO) = UPPER(:estado)`;
    binds.estado = estado;
  }

  query += `
    ORDER BY ID_CUBICULO
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, offset, limit };

  const result = await db.query(query, queryParams);
  return result[0].rows;
};


exports.getCubiculoById = async (idCubiculo) => {
  const query = `
    SELECT
      ID_CUBICULO,
      CAPACIDAD,
      ID_BIBLIOTECA,
      ESTADO
    FROM CUBICULO
    WHERE ID_CUBICULO = :idCubiculo
  `;

  const result = await db.query(query, { idCubiculo: Number(idCubiculo) });
  return result[0].rows[0];
};


exports.createCubiculo = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const capacidad = Number(data.capacidad);
    const idBiblioteca = Number(data.idBiblioteca);
    const estado = data.estado ? data.estado.trim() : 'disponible';

    if (!Number.isInteger(capacidad) || capacidad < 1) {
      throw new Error('capacidad debe ser un entero mayor o igual a 1');
    }

    if (!Number.isInteger(idBiblioteca)) {
      throw new Error('idBiblioteca inválido');
    }

    const result = await connection.execute(
      `
      INSERT INTO CUBICULO (
        CAPACIDAD,
        ID_BIBLIOTECA,
        ESTADO
      ) VALUES (
        :capacidad,
        :idBiblioteca,
        :estado
      )
      RETURNING ID_CUBICULO INTO :idCubiculo
      `,
      {
        capacidad,
        idBiblioteca,
        estado,
        idCubiculo: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await connection.commit();

    const out = result.outBinds.idCubiculo;
    const idCubiculo = Array.isArray(out) ? out[0] : out;
    return idCubiculo;
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


exports.updateCubiculo = async (idCubiculo, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idCubiculo, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idCubiculo inválido');
    }

    const fields = [];
    const binds = { idCubiculo: id };

    if (data.capacidad !== undefined) {
      const capacidad = Number(data.capacidad);
      if (!Number.isInteger(capacidad) || capacidad < 1) {
        throw new Error('capacidad debe ser un entero mayor o igual a 1');
      }
      fields.push('CAPACIDAD = :capacidad');
      binds.capacidad = capacidad;
    }

    if (data.idBiblioteca !== undefined) {
      const idBiblioteca = Number(data.idBiblioteca);
      if (!Number.isInteger(idBiblioteca)) {
        throw new Error('idBiblioteca inválido');
      }
      fields.push('ID_BIBLIOTECA = :idBiblioteca');
      binds.idBiblioteca = idBiblioteca;
    }

    if (data.estado !== undefined) {
      fields.push('ESTADO = :estado');
      binds.estado = data.estado.trim();
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const query = `
      UPDATE CUBICULO
         SET ${fields.join(', ')}
       WHERE ID_CUBICULO = :idCubiculo
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

exports.deleteCubiculo = async (idCubiculo) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idCubiculo, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idCubiculo inválido');
    }

    // Soft delete: cambiar estado a 'mantenimiento' (baja no es válido en el constraint)
    const result = await connection.execute(
      `
      UPDATE CUBICULO
         SET ESTADO = 'mantenimiento'
       WHERE ID_CUBICULO = :idCubiculo
      `,
      { idCubiculo: id }
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

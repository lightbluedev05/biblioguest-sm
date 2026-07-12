const db = require('../config/db');
const oracledb = require('oracledb');

exports.countLaptops = async (data) => {
  const { idBiblioteca, sistemaOperativo, marca, modelo, estado } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM LAPTOP
    WHERE 1 = 1
  `;

  const binds = {};

  if (idBiblioteca) {
    query += ` AND ID_BIBLIOTECA = :idBiblioteca`;
    binds.idBiblioteca = Number(idBiblioteca);
  }
  
  if (sistemaOperativo) {
    query += ` AND UPPER(SISTEMA_OPERATIVO) LIKE UPPER(:sistemaOperativo)`;
    binds.sistemaOperativo = `%${sistemaOperativo}%`;
  }

  if (marca) {
    query += ` AND UPPER(MARCA) LIKE UPPER(:marca)`;
    binds.marca = `%${marca}%`;
  }

  if (modelo) {
    query += ` AND UPPER(MODELO) LIKE UPPER(:modelo)`;
    binds.modelo = `%${modelo}%`;
  }

  if (estado) {
    query += ` AND UPPER(ESTADO) = UPPER(:estado)`;
    binds.estado = estado;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
}

exports.getLaptops = async (pagination = {}, data) => {
  const { page, limit } = pagination;
  const { idBiblioteca, sistemaOperativo, marca, modelo, estado } = data;

  let query = `
    SELECT
      ID_LAPTOP,
      ID_BIBLIOTECA,
      NUMERO_SERIE,
      SISTEMA_OPERATIVO,
      MARCA,
      MODELO,
      ESTADO
    FROM LAPTOP
    WHERE UPPER(ESTADO) != 'BAJA'
  `;

  const binds = {};

  if (idBiblioteca) {
    query += ` AND ID_BIBLIOTECA = :idBiblioteca`;
    binds.idBiblioteca = Number(idBiblioteca);
  }
  
  if (sistemaOperativo) {
    query += ` AND UPPER(SISTEMA_OPERATIVO) LIKE UPPER(:sistemaOperativo)`;
    binds.sistemaOperativo = `%${sistemaOperativo}%`;
  }

  if (marca) {
    query += ` AND UPPER(MARCA) LIKE UPPER(:marca)`;
    binds.marca = `%${marca}%`;
  }

  if (modelo) {
    query += ` AND UPPER(MODELO) LIKE UPPER(:modelo)`;
    binds.modelo = `%${modelo}%`;
  }

  if (estado) {
    query += ` AND UPPER(ESTADO) = UPPER(:estado)`;
    binds.estado = estado;
  }

  query += ` 
    ORDER BY ID_LAPTOP OFFSET 
    :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, limit, offset };

  const result = await db.query(query, queryParams);
  return result[0].rows;
}

exports.getLaptopById = async (idLaptop) => {
  const query = `
    SELECT
      ID_LAPTOP,
      ID_BIBLIOTECA,
      NUMERO_SERIE,
      SISTEMA_OPERATIVO,
      MARCA,
      MODELO,
      ESTADO
    FROM LAPTOP
    WHERE ID_LAPTOP = :idLaptop
  `;

  const result = await db.query(query, { idLaptop: Number(idLaptop) });
  return result[0].rows[0];
}

exports.createLaptop = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const {
      idBiblioteca,
      numeroSerie,
      sistemaOperativo,
      marca,
      modelo,
      idUtilidad,
      estado
    } = data;

    const result = await connection.execute(
      `
      INSERT INTO LAPTOP (
        ID_BIBLIOTECA,
        NUMERO_SERIE,
        SISTEMA_OPERATIVO,
        MARCA,
        MODELO,
        ID_UTILIDAD,
        ESTADO
      ) VALUES (
        :idBiblioteca,
        :numeroSerie,
        :sistemaOperativo,
        :marca,
        :modelo,
        :idUtilidad,
        :estado
      )
      RETURNING ID_LAPTOP INTO :idLaptop
      `,
      {
        idBiblioteca: idBiblioteca ? Number(idBiblioteca) : null,
        numeroSerie,
        sistemaOperativo,
        marca,
        modelo,
        idUtilidad: idUtilidad ? Number(idUtilidad) : null,
        estado: estado || 'disponible',
        idLaptop: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    await connection.commit();

    const idLaptopCreada = result.outBinds.idLaptop[0];
    return idLaptopCreada;
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
}


exports.updateLaptop = async (idLaptop, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = Number(idLaptop);
    if (!Number.isInteger(id)) {
      throw new Error('idLaptop inválido');
    }

    const sets = [];
    const binds = { idLaptop: id };

    if (data.idBiblioteca !== undefined) {
      sets.push('ID_BIBLIOTECA = :idBiblioteca');
      binds.idBiblioteca = data.idBiblioteca ? Number(data.idBiblioteca) : null;
    }

    if (data.numeroSerie !== undefined) {
      sets.push('NUMERO_SERIE = :numeroSerie');
      binds.numeroSerie = data.numeroSerie || null;
    }

    if (data.sistemaOperativo !== undefined) {
      sets.push('SISTEMA_OPERATIVO = :sistemaOperativo');
      binds.sistemaOperativo = data.sistemaOperativo || null;
    }

    if (data.marca !== undefined) {
      sets.push('MARCA = :marca');
      binds.marca = data.marca || null;
    }

    if (data.modelo !== undefined) {
      sets.push('MODELO = :modelo');
      binds.modelo = data.modelo || null;
    }

    if (data.idUtilidad !== undefined) {
      sets.push('ID_UTILIDAD = :idUtilidad');
      binds.idUtilidad = data.idUtilidad ? Number(data.idUtilidad) : null;
    }

    if (data.estado !== undefined) {
      sets.push('ESTADO = :estado');
      binds.estado = data.estado || null;
    }

    if (sets.length === 0) {
      // Nada que actualizar
      return 0;
    }

    const query = `
      UPDATE LAPTOP
         SET ${sets.join(', ')}
       WHERE ID_LAPTOP = :idLaptop
    `;

    const result = await connection.execute(query, binds);
    await connection.commit();

    const rowsAffected = result.rowsAffected || 0;
    return rowsAffected;
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
}

/**
 * Borrar laptop físicamente
 * OJO: fallará con ORA-02292 si hay reservas que la referencian
 */
exports.disableLaptop = async (idLaptop) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = Number(idLaptop);
    if (!Number.isInteger(id)) {
      throw new Error('idLaptop inválido');
    }

    const result = await connection.execute(
      `
      UPDATE LAPTOP
       SET ESTADO = 'baja' WHERE ID_LAPTOP = :idLaptop
      `,
      { idLaptop: id }
    );

    await connection.commit();

    const rowsAffected = result.rowsAffected || 0;
    return rowsAffected;
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
}
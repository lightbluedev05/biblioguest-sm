const db = require('../config/db');
const oracledb = require('oracledb');

// ============================================================
// GET CONFIGURACION (primera fila de NormasBiblioteca)
// ============================================================

exports.getConfiguracion = async () => {
  const query = `
    SELECT
      ID_NORMAS_BIBLIOTECA,
      DIAS_PRESTAMO_LIBROS,
      DIAS_ANTICIPACION_LIBROS,
      DIAS_ANTICIPACION_CUBICULOS,
      DIAS_ANTICIPACION_LAPTOPS
    FROM NormasBiblioteca
    WHERE ROWNUM = 1
  `;

  const result = await db.query(query, {});
  return result[0].rows[0] || null;
};

// ============================================================
// UPDATE CONFIGURACION
// ============================================================

exports.updateConfiguracion = async (idNormas, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idNormas, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idNormas inválido');
    }

    const fields = [];
    const binds = { idNormas: id };

    if (data.diasPrestamoLibros !== undefined) {
      fields.push('DIAS_PRESTAMO_LIBROS = :diasPrestamoLibros');
      binds.diasPrestamoLibros = Number(data.diasPrestamoLibros);
    }

    if (data.diasAnticipacionLibros !== undefined) {
      fields.push('DIAS_ANTICIPACION_LIBROS = :diasAnticipacionLibros');
      binds.diasAnticipacionLibros = Number(data.diasAnticipacionLibros);
    }

    if (data.diasAnticipacionCubiculos !== undefined) {
      fields.push('DIAS_ANTICIPACION_CUBICULOS = :diasAnticipacionCubiculos');
      binds.diasAnticipacionCubiculos = Number(data.diasAnticipacionCubiculos);
    }

    if (data.diasAnticipacionLaptops !== undefined) {
      fields.push('DIAS_ANTICIPACION_LAPTOPS = :diasAnticipacionLaptops');
      binds.diasAnticipacionLaptops = Number(data.diasAnticipacionLaptops);
    }

    if (fields.length === 0) {
      return 0;
    }

    const query = `
      UPDATE NormasBiblioteca
         SET ${fields.join(', ')}
       WHERE ID_NORMAS_BIBLIOTECA = :idNormas
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
// CREATE CONFIGURACION (si no existe ninguna)
// ============================================================

exports.createConfiguracion = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const result = await connection.execute(
      `
      INSERT INTO NormasBiblioteca (
        DIAS_PRESTAMO_LIBROS,
        DIAS_ANTICIPACION_LIBROS,
        DIAS_ANTICIPACION_CUBICULOS,
        DIAS_ANTICIPACION_LAPTOPS
      ) VALUES (
        :diasPrestamoLibros,
        :diasAnticipacionLibros,
        :diasAnticipacionCubiculos,
        :diasAnticipacionLaptops
      )
      RETURNING ID_NORMAS_BIBLIOTECA INTO :idNormas
      `,
      {
        diasPrestamoLibros: data.diasPrestamoLibros || 7,
        diasAnticipacionLibros: data.diasAnticipacionLibros || 3,
        diasAnticipacionCubiculos: data.diasAnticipacionCubiculos || 1,
        diasAnticipacionLaptops: data.diasAnticipacionLaptops || 1,
        idNormas: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    await connection.commit();
    return result.outBinds.idNormas[0];
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

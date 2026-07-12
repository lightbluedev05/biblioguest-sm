const db = require('../config/db');
const oracledb = require('oracledb');

// ============================================================
// HELPERS
// ============================================================

function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
  }
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  const date = new Date(anio, mes - 1, dia);
  if (isNaN(date.getTime())) throw new Error('Fecha inválida');
  return date;
}

// ============================================================
// COUNT Y LIST
// ============================================================

exports.countSanciones = async (data = {}) => {
  const { idUsuario, estado, fechaDesde, fechaHasta } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM Sancion
    WHERE 1 = 1
  `;
  const binds = {};

  if (idUsuario) {
    query += ` AND id_usuario = :idUsuario`;
    binds.idUsuario = Number(idUsuario);
  }

  if (estado) {
    query += ` AND UPPER(estado) = UPPER(:estado)`;
    binds.estado = estado;
  }

  if (fechaDesde) {
    query += ` AND fecha_inicio >= TO_DATE(:fechaDesde, 'YYYY-MM-DD')`;
    binds.fechaDesde = fechaDesde;
  }

  if (fechaHasta) {
    query += ` AND fecha_fin <= TO_DATE(:fechaHasta, 'YYYY-MM-DD')`;
    binds.fechaHasta = fechaHasta;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
};

exports.getSanciones = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const { idUsuario, estado, fechaDesde, fechaHasta } = data;

  let query = `
    SELECT
      s.id_sancion,
      s.id_usuario,
      s.fecha_inicio,
      s.fecha_fin,
      s.motivo,
      s.estado,
      u.nombre AS nombre_usuario,
      u.codigo_institucional,
      u.correo AS correo_usuario
    FROM Sancion s
    LEFT JOIN Usuario u ON u.id_usuario = s.id_usuario
    WHERE 1 = 1
  `;
  const binds = {};

  if (idUsuario) {
    query += ` AND s.id_usuario = :idUsuario`;
    binds.idUsuario = Number(idUsuario);
  }

  if (estado) {
    query += ` AND UPPER(s.estado) = UPPER(:estado)`;
    binds.estado = estado;
  }

  if (fechaDesde) {
    query += ` AND s.fecha_inicio >= TO_DATE(:fechaDesde, 'YYYY-MM-DD')`;
    binds.fechaDesde = fechaDesde;
  }

  if (fechaHasta) {
    query += ` AND s.fecha_fin <= TO_DATE(:fechaHasta, 'YYYY-MM-DD')`;
    binds.fechaHasta = fechaHasta;
  }

  query += `
    ORDER BY s.fecha_inicio DESC
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

exports.getSancionById = async (idSancion) => {
  const query = `
    SELECT
      s.id_sancion,
      s.id_usuario,
      s.fecha_inicio,
      s.fecha_fin,
      s.motivo,
      s.estado,
      u.nombre AS nombre_usuario,
      u.codigo_institucional,
      u.correo AS correo_usuario
    FROM Sancion s
    LEFT JOIN Usuario u ON u.id_usuario = s.id_usuario
    WHERE s.id_sancion = :idSancion
  `;

  const result = await db.query(query, { idSancion: Number(idSancion) });
  return result[0].rows[0] || null;
};

// ============================================================
// GET BY USUARIO (para que estudiante vea sus sanciones)
// ============================================================

exports.getSancionesByUsuario = async (idUsuario) => {
  const query = `
    SELECT
      id_sancion,
      id_usuario,
      fecha_inicio,
      fecha_fin,
      motivo,
      estado
    FROM Sancion
    WHERE id_usuario = :idUsuario
    ORDER BY fecha_inicio DESC
  `;

  const result = await db.query(query, { idUsuario: Number(idUsuario) });
  return result[0].rows;
};

// ============================================================
// CREATE
// ============================================================

exports.createSancion = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const { idUsuario, fechaInicio, fechaFin, motivo } = data;

    if (!idUsuario || !fechaInicio || !fechaFin) {
      throw new Error('Parámetros requeridos: idUsuario, fechaInicio, fechaFin');
    }

    const fechaIni = parseFecha(fechaInicio);
    const fechaF = parseFecha(fechaFin);

    if (fechaF < fechaIni) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
    }

    const result = await connection.execute(
      `
      INSERT INTO Sancion (
        id_usuario,
        fecha_inicio,
        fecha_fin,
        motivo,
        estado
      ) VALUES (
        :idUsuario,
        :fechaInicio,
        :fechaFin,
        :motivo,
        'activa'
      )
      RETURNING id_sancion INTO :idSancion
      `,
      {
        idUsuario: Number(idUsuario),
        fechaInicio: fechaIni,
        fechaFin: fechaF,
        motivo: motivo || null,
        idSancion: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    await connection.commit();
    return result.outBinds.idSancion[0];
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
// UPDATE
// ============================================================

exports.updateSancion = async (idSancion, data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const { fechaInicio, fechaFin, motivo, estado } = data;

    const sets = [];
    const binds = { idSancion: Number(idSancion) };

    if (fechaInicio !== undefined) {
      sets.push('fecha_inicio = :fechaInicio');
      binds.fechaInicio = parseFecha(fechaInicio);
    }

    if (fechaFin !== undefined) {
      sets.push('fecha_fin = :fechaFin');
      binds.fechaFin = parseFecha(fechaFin);
    }

    if (motivo !== undefined) {
      sets.push('motivo = :motivo');
      binds.motivo = motivo;
    }

    if (estado !== undefined) {
      sets.push('estado = :estado');
      binds.estado = estado;
    }

    if (sets.length === 0) {
      return 0;
    }

    const query = `
      UPDATE Sancion
      SET ${sets.join(', ')}
      WHERE id_sancion = :idSancion
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
// CANCELAR (cambiar estado a 'cancelada')
// ============================================================

exports.cancelarSancion = async (idSancion) => {
  let connection;
  try {
    connection = await db.getConnection();

    const result = await connection.execute(
      `
      UPDATE Sancion
      SET estado = 'cancelada'
      WHERE id_sancion = :idSancion
        AND estado = 'activa'
      `,
      { idSancion: Number(idSancion) }
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

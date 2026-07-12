const db = require('../config/db');
const oracledb = require('oracledb');

//----------------- FUNCIONES AUXILIARES ------------------
function sanitizeParam(param) {
  return param && param !== '' ? param : null;
}

function parseFecha(fecha) {
  if (!fecha) return new Date();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const date = new Date(anio, mes - 1, dia);
  if (isNaN(date.getTime())) throw new Error('Fecha inválida');
  return date;
}

function normalizeHora(hora) {
  // Acepta valores como 14, "14" o "14:00" y devuelve "HH:MI"
  if (hora === null || hora === undefined) return null;
  const s = hora.toString().trim();
  // Si solo pasa la hora en formato H o HH -> convertir a HH:00
  if (/^\d{1,2}$/.test(s)) {
    const hh = s.padStart(2, '0');
    return `${hh}:00`;
  }
  // Si ya viene como HH:MM validar y retornar
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':').map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) throw new Error('Hora inválida');
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  }
  throw new Error('Formato de hora inválido. Use HH o HH:MI');
}

function sanitizeNumericParam(param) {
  // Trata parámetros vacíos o 'true' (cuando llegan como query params sin valor)
  if (param === undefined || param === null) return null;
  if (param === '' || param === 'true' || param === true) return null;
  return param;
}

//-------------------- EXPORTS ------------------------------------

exports.getDisponibilidad = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const fechaDate = parseFecha(data.fecha);

    const horaInicioRaw = sanitizeNumericParam(data.horaInicioNum);
    let horaInicioDecimal = null;
    if (horaInicioRaw !== null) {
      try {
        // El procedimiento espera solo la hora entera (8, 9, 10, etc.)
        let h;
        if (horaInicioRaw.includes(':')) {
          h = parseInt(horaInicioRaw.split(':')[0], 10); // "08:30" -> 8
        } else {
          h = parseInt(horaInicioRaw, 10); // "8" o 8 -> 8
        }
        // Solo enviar si es un número entero válido entre 0 y 23
        if (Number.isInteger(h) && h >= 0 && h <= 23) {
          horaInicioDecimal = h;
        }
      } catch (e) {
        // Si hay error al parsear, dejar como null
        horaInicioDecimal = null;
      }
    }

    const duracionRaw = sanitizeNumericParam(data.duracionHoras);
    let duracion = null;
    if (duracionRaw !== null) {
      const parsed = parseFloat(duracionRaw);
      duracion = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    const sistemaOperativo = sanitizeParam(data.sistemaOperativo);
    const marca = sanitizeParam(data.marca);


    const bindParams = {
      p_fecha_reserva: { val: fechaDate, type: oracledb.DATE },
      p_hora_inicio:   { val: horaInicioDecimal, type: oracledb.NUMBER },
      p_duracion_horas:{ val: duracion, type: oracledb.NUMBER },
      p_sistema_oper:  { val: sistemaOperativo, type: oracledb.STRING },
      p_marca:         { val: marca, type: oracledb.STRING },
      p_result:        { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await connection.execute(
      `
      BEGIN
        PRC_HORARIOS_DISP_LAPTOP(
          :p_fecha_reserva,
          :p_hora_inicio,
          :p_duracion_horas,
          :p_sistema_oper,
          :p_marca,
          :p_result
        );
      END;
      `,
      bindParams
    );

    const resultSet = result.outBinds.p_result;
    const rows = await resultSet.getRows();
    await resultSet.close();

    const map = new Map();
    for (const row of rows) {
      let laptop = map.get(row.idLaptop);
      if (!laptop) {
        laptop = {
          idLaptop: row.idLaptop,
          sistemaOperativo: row.sistemaOperativo,
          marca: row.marca,
          modelo: row.modelo,
          horarios: [],
        };
        map.set(row.idLaptop, laptop);
      }
      laptop.horarios.push({
        inicio: row.fechaHoraInicio ? row.fechaHoraInicio.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }) : null,
        fin: row.fechaHoraFin ? row.fechaHoraFin.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }) : null,
      });
    }
    return Array.from(map.values());
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}

exports.crearReserva = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const idUsuario = parseInt(data.idUsuario, 10);
    const idLaptop = parseInt(data.idLaptop, 10);
    const fecha = parseFecha(data.fecha);
    const horaInicio = data.horaInicio;
    const horaFin = data.horaFin;
    const idBibliotecario = data.idBibliotecario ? parseInt(data.idBibliotecario, 10) : null;

    if (isNaN(idUsuario) || isNaN(idLaptop) || (idBibliotecario !== null && isNaN(idBibliotecario))) {
      throw new Error('Parámetros requeridos: idUsuario, idLaptop, idBibliotecario deben ser números válidos');
    }

    if (!idUsuario || !idLaptop || !horaInicio || !horaFin) {
      throw new Error('Parámetros requeridos: idUsuario, idLaptop, fecha, horaInicio, horaFin');
    }

    const horaInicioNorm = normalizeHora(horaInicio);
    const horaFinNorm = normalizeHora(horaFin);

    const result = await connection.execute(
      `BEGIN
        pr_reservar_laptop(
          :p_usuario,
          :p_laptop,
          :p_fecha,
          :p_hora_inicio,
          :p_hora_fin,
          :p_bibliotecario,
          :p_id_reserva
        );
      END;`,
      {
        p_usuario: { val: idUsuario, type: oracledb.NUMBER },
        p_laptop: { val: idLaptop, type: oracledb.NUMBER },
        p_fecha: { val: fecha, type: oracledb.DATE },
        p_hora_inicio: { val: horaInicioNorm, type: oracledb.STRING },
        p_hora_fin: { val: horaFinNorm, type: oracledb.STRING },
        p_bibliotecario: { val: idBibliotecario || null, type: oracledb.NUMBER },
        p_id_reserva: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    try {
      await connection.commit();
    } catch (e) {
      throw e;
    }

    return {
      idReserva: result.outBinds.p_id_reserva,
      mensaje: 'Reserva creada exitosamente',
    };
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}

exports.cancelarReserva = async (idReserva) => {
  let connection;
  try {
    connection = await db.getConnection();

    const id = parseInt(idReserva, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idReserva inválido');
    }

    await connection.execute(
      `BEGIN
        pr_cancelar_reserva_laptop(:p_id_reserva);
      END;`,
      {
        p_id_reserva: { val: id, type: oracledb.NUMBER },
      }
    );

    try {
      await connection.commit();
    } catch (e) {
      throw e;
    }

    return { mensaje: 'Reserva cancelada exitosamente' };
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}

exports.countReserva = async (data) => {
  const { fechaReserva, idUsuario, idLaptop, estado , idBibliotecario} = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM RESERVALAPTOP
    WHERE 1 = 1
  `;

  const binds = {};

  if (fechaReserva) {
    query += ` AND TRUNC(FECHA_RESERVA) = TO_DATE(:fecha, 'YYYY-MM-DD')`;
    binds.fecha = fechaReserva;
  }

  if (idBibliotecario) {
    query += ` AND ID_BIBLIOTECARIO = :idBibliotecario`;
    binds.idBibliotecario = Number(idBibliotecario);
  }

  if (idUsuario) {
    query += ` AND ID_USUARIO = :idUsuario`;
    binds.idUsuario = Number(idUsuario);
  }

  if (idLaptop) {
    query += ` AND ID_LAPTOP = :idLaptop`;
    binds.idLaptop = Number(idLaptop);
  }

  if (estado) {
    query += ` AND ESTADO = :estado`;
    binds.estado = estado;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
}

exports.getReserva = async (pagination = {}, data) => {
  const { page, limit } = pagination;
  const { fechaReserva, idUsuario, idLaptop, estado , idBibliotecario} = data;

    let query = `
    SELECT
      r.ID_RESERVA,
      r.ID_LAPTOP,
      r.ID_USUARIO,
      r.FECHA_RESERVA,
      r.HORA_INICIO,
      r.HORA_FIN,
      r.ESTADO,
      r.ID_BIBLIOTECARIO,
      u.NOMBRE AS NOMBRE_USUARIO,
      u.CODIGO_INSTITUCIONAL,
      l.MARCA,
      l.MODELO,
      l.NUMERO_SERIE
    FROM RESERVALAPTOP r
    JOIN USUARIO u ON r.ID_USUARIO = u.ID_USUARIO
    JOIN LAPTOP l ON r.ID_LAPTOP = l.ID_LAPTOP
    WHERE 1 = 1
  `;

  const binds = {};

  if (fechaReserva) {
    query += ` AND TRUNC(r.FECHA_RESERVA) = TO_DATE(:fecha, 'YYYY-MM-DD')`;
    binds.fecha = fechaReserva;
  }

  if (idBibliotecario) {
    query += ` AND r.ID_BIBLIOTECARIO = :idBibliotecario`;
    binds.idBibliotecario = Number(idBibliotecario);
  }

  if (idUsuario) {
    query += ` AND r.ID_USUARIO = :idUsuario`;
    binds.idUsuario = Number(idUsuario);
  }

  if (idLaptop) {
    query += ` AND r.ID_LAPTOP = :idLaptop`;
    binds.idLaptop = Number(idLaptop);
  }

  if (estado) {
    query += ` AND UPPER(r.ESTADO) = UPPER(:estado)`;
    binds.estado = estado;
  }

  query += `
    ORDER BY r.FECHA_RESERVA DESC, r.HORA_INICIO
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, limit, offset };

  const result = await db.query(query, queryParams);
  return result[0].rows;
}

exports.getReservaByID = async (idReserva) => {
  const query = `
      SELECT * FROM RESERVALAPTOP WHERE ID_RESERVA = :idReserva
  `;
  
  const result = await db.query(query, { idReserva });
  return result[0].rows;
}

exports.finalizarReserva = async (idReserva) => {
  let connection;
  try {
    connection = await db.getConnection();
    const id = parseInt(idReserva, 10);
    if (!Number.isInteger(id)) {
      throw new Error('idReserva inválido');
    }

    const result = await connection.execute(
      `
        UPDATE RESERVALAPTOP
        SET ESTADO = 'finalizada'
        WHERE ID_RESERVA = :idReserva
        AND UPPER(estado) = 'ACTIVA'
      `,
      { idReserva }
    );

    try {
      await connection.commit();
    } catch (e) {
      await connection.rollback();
    }

    const rowsAffected = result.rowsAffected || 0;
    return rowsAffected;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

exports.confirmarReserva = async (idReserva, idBibliotecario) => {
  let connection;
  try {
    connection = await db.getConnection();
    const id = parseInt(idReserva, 10);
    const idBib = parseInt(idBibliotecario, 10);

    if (!Number.isInteger(id) || !Number.isInteger(idBib)) {
      throw new Error('ID reserva o bibliotecario inválido');
    }

    const result = await connection.execute(
      `
        UPDATE RESERVALAPTOP
        SET ID_BIBLIOTECARIO = :idBibliotecario
        WHERE ID_RESERVA = :idReserva
        AND UPPER(estado) = 'ACTIVA'
      `,
      { idReserva: id, idBibliotecario: idBib }
    );

    try {
      await connection.commit();
    } catch (e) {
      await connection.rollback();
    }

    const rowsAffected = result.rowsAffected || 0;
    return rowsAffected;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

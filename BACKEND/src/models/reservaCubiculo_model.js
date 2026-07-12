const db = require('../config/db');
const oracledb = require('oracledb');

function parseFecha(fecha) {
  if (!fecha) throw new Error('La fecha es obligatoria (YYYY-MM-DD)');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
  }
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const date = new Date(anio, mes - 1, dia);
  if (isNaN(date.getTime())) throw new Error('Fecha inválida');
  return date;
}

function normalizeHora(hora) {
  if (hora === null || hora === undefined) return null;
  const s = hora.toString().trim();

  // "10" -> "10:00"
  if (/^\d{1,2}$/.test(s)) {
    const hh = s.padStart(2, '0');
    return `${hh}:00`;
  }

  // "10:30"
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':').map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      throw new Error('Hora inválida');
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  throw new Error('Formato de hora inválido. Use HH o HH:MI');
}

async function actualizarEstadoInvitacion(idReserva, idUsuario, nuevoEstado) {
  let connection;
  try {
    connection = await db.getConnection();

    const idRes = parseInt(idReserva, 10);
    const idUsr = parseInt(idUsuario, 10);

    if (!Number.isInteger(idRes) || !Number.isInteger(idUsr)) {
      throw new Error('idReserva e idUsuario deben ser números enteros');
    }

    const resReserva = await connection.execute(
      `
      SELECT id_grupo_usuarios, estado
      FROM ReservaCubiculo
      WHERE id_reserva = :idReserva
      `,
      { idReserva: idRes }
    );

    if (!resReserva.rows || resReserva.rows.length === 0) {
      return 0; // no existe la reserva
    }

    const row = resReserva.rows[0];
    const idGrupo = row.ID_GRUPO_USUARIOS;
    const estadoReserva = row.ESTADO;

    if (estadoReserva !== 'pendiente') {
      throw new Error(
        'Solo se pueden responder invitaciones de reservas en estado pendiente'
      );
    }

    const resultUpdate = await connection.execute(
      `
      UPDATE UsuarioGrupoUsuarios
      SET estado_miembro = :estado
      WHERE id_grupo_usuarios = :idGrupo
        AND id_usuario = :idUsuario
      `,
      {
        estado: nuevoEstado,
        idGrupo,
        idUsuario: idUsr,
      }
    );

    await connection.commit();
    return resultUpdate.rowsAffected || 0;
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


exports.countReservasCubiculo = async (data = {}) => {
  const {
    fechaReserva,
    idGrupoUsuarios,
    idCubiculo,
    estado,
    idBibliotecario,
  } = data;

  let query = `
    SELECT COUNT(*) AS total
    FROM ReservaCubiculo
    WHERE 1 = 1
  `;
  const binds = {};

  if (fechaReserva) {
    query += ` AND TRUNC(fecha_reserva) = TO_DATE(:fecha, 'YYYY-MM-DD')`;
    binds.fecha = fechaReserva;
  }

  if (idGrupoUsuarios) {
    query += ` AND id_grupo_usuarios = :idGrupoUsuarios`;
    binds.idGrupoUsuarios = Number(idGrupoUsuarios);
  }

  if (idCubiculo) {
    query += ` AND id_cubiculo = :idCubiculo`;
    binds.idCubiculo = Number(idCubiculo);
  }

  if (idBibliotecario) {
    query += ` AND id_bibliotecario = :idBibliotecario`;
    binds.idBibliotecario = Number(idBibliotecario);
  }

  if (estado) {
    query += ` AND UPPER(estado) = UPPER(:estado)`;
    binds.estado = estado;
  }

  const result = await db.query(query, binds);
  return result[0].rows[0].TOTAL || 0;
};

exports.getReservasCubiculo = async (pagination = {}, data = {}) => {
  const { page, limit } = pagination;
  const {
    fechaReserva,
    idGrupoUsuarios,
    idCubiculo,
    estado,
    idBibliotecario,
  } = data;

  let query = `
    SELECT
      id_reserva,
      id_grupo_usuarios,
      id_bibliotecario,
      id_cubiculo,
      fecha_solicitud,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      estado
    FROM ReservaCubiculo
    WHERE 1 = 1
  `;
  const binds = {};

  if (fechaReserva) {
    query += ` AND TRUNC(fecha_reserva) = TO_DATE(:fecha, 'YYYY-MM-DD')`;
    binds.fecha = fechaReserva;
  }

  if (idGrupoUsuarios) {
    query += ` AND id_grupo_usuarios = :idGrupoUsuarios`;
    binds.idGrupoUsuarios = Number(idGrupoUsuarios);
  }

  if (idCubiculo) {
    query += ` AND id_cubiculo = :idCubiculo`;
    binds.idCubiculo = Number(idCubiculo);
  }

  if (idBibliotecario) {
    query += ` AND id_bibliotecario = :idBibliotecario`;
    binds.idBibliotecario = Number(idBibliotecario);
  }

  if (estado) {
    query += ` AND UPPER(estado) = UPPER(:estado)`;
    binds.estado = estado;
  }

  query += `
    ORDER BY fecha_reserva DESC, hora_inicio
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const offset = (page - 1) * limit;
  const queryParams = { ...binds, offset, limit };

  const result = await db.query(query, queryParams);
  return result[0].rows;
};

exports.getReservaCubiculoById = async (idReserva) => {
  const result = await db.query(
    `
    SELECT
      id_reserva,
      id_grupo_usuarios,
      id_bibliotecario,
      id_cubiculo,
      fecha_solicitud,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      estado
    FROM ReservaCubiculo
    WHERE id_reserva = :idReserva
    `,
    { idReserva: Number(idReserva) }
  );

  return result[0].rows[0] || null;
};


exports.crearBorradorReservaCubiculo = async (data) => {
  let connection;
  try {
    connection = await db.getConnection();

    const idCubiculo = parseInt(data.idCubiculo, 10);
    const idCreador = parseInt(data.idCreador, 10);
    const fechaStr = data.fecha;
    const horaInicio = data.horaInicio;
    const horaFin = data.horaFin;
    const miembrosRaw = Array.isArray(data.miembros) ? data.miembros : [];

    if (
      !Number.isInteger(idCubiculo) ||
      !Number.isInteger(idCreador) ||
      !fechaStr ||
      !horaInicio ||
      !horaFin ||
      miembrosRaw.length === 0
    ) {
      throw new Error(
        'Parámetros requeridos: idCubiculo, idCreador, fecha, horaInicio, horaFin, miembros'
      );
    }

    const miembrosSet = new Set();
    for (const m of miembrosRaw) {
      const id = parseInt(m, 10);
      if (Number.isInteger(id)) {
        miembrosSet.add(id);
      }
    }
    miembrosSet.add(idCreador);
    const miembros = Array.from(miembrosSet);

    if (miembros.length < 3) {
      throw new Error('Se requieren al menos 3 integrantes en el grupo');
    }

    const fecha = parseFecha(fechaStr);
    const horaInicioNorm = normalizeHora(horaInicio);
    const horaFinNorm = normalizeHora(horaFin);

    const resultGrupo = await connection.execute(
      `
      INSERT INTO GrupoUsuarios (id_grupo_usuarios)
      VALUES (DEFAULT)
      RETURNING id_grupo_usuarios INTO :idGrupo
      `,
      {
        idGrupo: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    let idGrupo = resultGrupo.outBinds.idGrupo;
    if (Array.isArray(idGrupo)) {
      idGrupo = idGrupo[0];
    }

    for (const idMiembro of miembros) {
      const estadoMiembro = idMiembro === idCreador ? 'aceptado' : 'pendiente';

      await connection.execute(
        `
        INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
        VALUES (:idUsuario, :idGrupo, :estado)
        `,
        {
          idUsuario: idMiembro,
          idGrupo,
          estado: estadoMiembro,
        },
        { autoCommit: false }
      );
    }

    const resultReserva = await connection.execute(
      `
      BEGIN
        pr_reservar_cubiculo(
          :p_grupo,
          :p_cubiculo,
          :p_fecha,
          :p_hora_inicio,
          :p_hora_fin,
          :p_bibliotecario,
          :p_id_reserva
        );
      END;
      `,
      {
        p_grupo: { val: idGrupo, type: oracledb.NUMBER },
        p_cubiculo: { val: idCubiculo, type: oracledb.NUMBER },
        p_fecha: { val: fecha, type: oracledb.DATE },
        p_hora_inicio: { val: horaInicioNorm, type: oracledb.STRING },
        p_hora_fin: { val: horaFinNorm, type: oracledb.STRING },
        p_bibliotecario: { val: null, type: oracledb.NUMBER },
        p_id_reserva: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    let idReserva = resultReserva.outBinds.p_id_reserva;
    if (Array.isArray(idReserva)) {
      idReserva = idReserva[0];
    }

    await connection.commit();

    return {
      idReserva,
      idGrupoUsuarios: idGrupo,
    };
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

//-------------------- INVITACIONES ------------------

exports.aceptarInvitacion = async (idReserva, idUsuario) => {
  return actualizarEstadoInvitacion(idReserva, idUsuario, 'aceptado');
};

exports.rechazarInvitacion = async (idReserva, idUsuario) => {
  return actualizarEstadoInvitacion(idReserva, idUsuario, 'rechazado');
};

//---------------- CONFIRMAR / INGRESO / FINALIZAR / CANCELAR --------------------

exports.confirmarReserva = async (idReserva) => {
  let connection;
  try {
    connection = await db.getConnection();
    const id = parseInt(idReserva, 10);
    if (!Number.isInteger(id)) throw new Error('idReserva inválido');

    await connection.execute(
      `
      BEGIN
        pr_confirmar_reserva_cubiculo(:p_reserva);
      END;
      `,
      {
        p_reserva: { val: id, type: oracledb.NUMBER },
      }
    );

    await connection.commit();
    return true;
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

exports.registrarIngreso = async (idReserva, idBibliotecario) => {
  let connection;
  try {
    connection = await db.getConnection();
    const id = parseInt(idReserva, 10);
    const idB = parseInt(idBibliotecario, 10);

    if (!Number.isInteger(id) || !Number.isInteger(idB)) {
      throw new Error(
        'Parámetros requeridos: idReserva e idBibliotecario (números enteros)'
      );
    }

    await connection.execute(
      `
      BEGIN
        pr_registrar_ingreso_reserva_cubiculo(
          :p_reserva,
          :p_bibliotecario
        );
      END;
      `,
      {
        p_reserva: { val: id, type: oracledb.NUMBER },
        p_bibliotecario: { val: idB, type: oracledb.NUMBER },
      }
    );

    await connection.commit();
    return true;
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

exports.finalizarReserva = async (idReserva) => {
  let connection;
  try {
    connection = await db.getConnection();
    const id = parseInt(idReserva, 10);
    if (!Number.isInteger(id)) throw new Error('idReserva inválido');

    await connection.execute(
      `
      BEGIN
        pr_finalizar_reserva_cubiculo(:p_reserva);
      END;
      `,
      {
        p_reserva: { val: id, type: oracledb.NUMBER },
      }
    );

    await connection.commit();
    return true;
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

exports.cancelarReserva = async (idReserva) => {
  let connection;
  try {
    connection = await db.getConnection();
    const id = parseInt(idReserva, 10);
    if (!Number.isInteger(id)) throw new Error('idReserva inválido');

    await connection.execute(
      `
      BEGIN
        pr_cancelar_reserva_cubiculo(:p_reserva);
      END;
      `,
      {
        p_reserva: { val: id, type: oracledb.NUMBER },
      }
    );

    await connection.commit();
    return true;
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

exports.getReservaCubiculoDetalleById = async (idReserva) => {
  const query = `
    SELECT
      r.ID_RESERVA,
      r.ID_GRUPO_USUARIOS,
      r.ID_BIBLIOTECARIO,
      r.ID_CUBICULO,
      r.FECHA_SOLICITUD,
      r.FECHA_RESERVA,
      r.HORA_INICIO,
      r.HORA_FIN,
      r.ESTADO,

      c.CAPACIDAD        AS CAPACIDAD_CUBICULO,
      c.ESTADO           AS ESTADO_CUBICULO,

      b.ID_BIBLIOTECA    AS ID_BIBLIOTECA,
      b.NOMBRE           AS NOMBRE_BIBLIOTECA,

      bi.ID_BIBLIOTECARIO,
      bi.NOMBRE          AS NOMBRE_BIBLIOTECARIO,
      bi.CORREO          AS CORREO_BIBLIOTECARIO,
      bi.TURNO           AS TURNO_BIBLIOTECARIO,

      u.ID_USUARIO,
      u.NOMBRE           AS NOMBRE_USUARIO,
      u.CODIGO_INSTITUCIONAL,
      u.CORREO           AS CORREO_USUARIO,
      ugu.ESTADO_MIEMBRO
    FROM RESERVACUBICULO r
    JOIN CUBICULO c
      ON c.ID_CUBICULO = r.ID_CUBICULO
    JOIN BIBLIOTECA b
      ON b.ID_BIBLIOTECA = c.ID_BIBLIOTECA
    LEFT JOIN BIBLIOTECARIO bi
      ON bi.ID_BIBLIOTECARIO = r.ID_BIBLIOTECARIO
    LEFT JOIN USUARIOGRUPOUSUARIOS ugu
      ON ugu.ID_GRUPO_USUARIOS = r.ID_GRUPO_USUARIOS
    LEFT JOIN USUARIO u
      ON u.ID_USUARIO = ugu.ID_USUARIO
    WHERE r.ID_RESERVA = :idReserva
  `;

  const result = await db.query(query, { idReserva: Number(idReserva) });
  return result[0].rows;
};

const db = require('../config/db');

// ============================================================
// DASHBOARD ADMIN/BIBLIOTECARIO - Estadísticas generales
// ============================================================

exports.getDashboardAdmin = async () => {
  // Estadísticas generales del sistema
  const queries = {
    // Contadores principales
    totalUsuarios: `SELECT COUNT(*) AS TOTAL FROM Usuario WHERE UPPER(estado) != 'BLOQUEADO' OR estado IS NULL`,
    totalLibros: `SELECT COUNT(*) AS TOTAL FROM Libro`,
    totalEjemplares: `SELECT COUNT(*) AS TOTAL FROM Ejemplar`,
    ejemplaresDisponibles: `SELECT COUNT(*) AS TOTAL FROM Ejemplar WHERE UPPER(estado) = 'DISPONIBLE'`,
    totalLaptops: `SELECT COUNT(*) AS TOTAL FROM Laptop WHERE UPPER(estado) = 'DISPONIBLE'`,
    totalCubiculos: `SELECT COUNT(*) AS TOTAL FROM Cubiculo WHERE UPPER(estado) = 'DISPONIBLE'`,
    
    // Préstamos activos
    prestamosActivos: `SELECT COUNT(*) AS TOTAL FROM PrestamoLibro WHERE UPPER(estado) IN ('ACTIVO', 'PENDIENTE')`,
    prestamosAtrasados: `SELECT COUNT(*) AS TOTAL FROM PrestamoLibro WHERE UPPER(estado) = 'ATRASADO' OR (fecha_fin < SYSDATE AND UPPER(estado) = 'ACTIVO')`,
    
    // Reservas activas
    reservasLaptopHoy: `
      SELECT COUNT(*) AS TOTAL FROM ReservaLaptop 
      WHERE TRUNC(fecha_reserva) = TRUNC(SYSDATE) 
        AND UPPER(estado) IN ('ACTIVA', 'PENDIENTE')
    `,
    reservasCubiculoHoy: `
      SELECT COUNT(*) AS TOTAL FROM ReservaCubiculo 
      WHERE TRUNC(fecha_reserva) = TRUNC(SYSDATE) 
        AND UPPER(estado) IN ('ACTIVA', 'PENDIENTE')
    `,
    
    // Sanciones activas
    sancionesActivas: `SELECT COUNT(*) AS TOTAL FROM Sancion WHERE UPPER(estado) = 'ACTIVA'`
  };

  const results = {};
  
  for (const [key, query] of Object.entries(queries)) {
    try {
      const result = await db.query(query, {});
      results[key] = result[0].rows[0]?.TOTAL || 0;
    } catch (error) {
      results[key] = 0;
    }
  }

  // Préstamos recientes (últimos 5)
  const prestamosRecientes = await db.query(`
    SELECT 
      p.ID_PRESTAMO,
      p.FECHA_INICIO,
      p.FECHA_FIN,
      p.ESTADO,
      u.NOMBRE AS NOMBRE_USUARIO,
      l.TITULO AS TITULO_LIBRO
    FROM PrestamoLibro p
    JOIN Usuario u ON u.ID_USUARIO = p.ID_USUARIO
    JOIN Ejemplar e ON e.ID_EJEMPLAR = p.ID_EJEMPLAR
    JOIN Libro l ON l.ID_LIBRO = e.ID_LIBRO
    ORDER BY p.FECHA_INICIO DESC
    FETCH FIRST 5 ROWS ONLY
  `, {});

  // Reservas de hoy
  const reservasHoy = await db.query(`
    SELECT 
      'laptop' AS TIPO,
      r.ID_RESERVA,
      r.HORA_INICIO,
      r.HORA_FIN,
      r.ESTADO,
      u.NOMBRE AS NOMBRE_USUARIO,
      l.MARCA || ' ' || l.MODELO AS RECURSO
    FROM ReservaLaptop r
    JOIN Usuario u ON u.ID_USUARIO = r.ID_USUARIO
    JOIN Laptop l ON l.ID_LAPTOP = r.ID_LAPTOP
    WHERE TRUNC(r.FECHA_RESERVA) = TRUNC(SYSDATE)
    UNION ALL
    SELECT 
      'cubiculo' AS TIPO,
      rc.ID_RESERVA,
      rc.HORA_INICIO,
      rc.HORA_FIN,
      rc.ESTADO,
      NULL AS NOMBRE_USUARIO,
      'Cubículo #' || rc.ID_CUBICULO AS RECURSO
    FROM ReservaCubiculo rc
    WHERE TRUNC(rc.FECHA_RESERVA) = TRUNC(SYSDATE)
    ORDER BY HORA_INICIO
    FETCH FIRST 10 ROWS ONLY
  `, {});

  return {
    estadisticas: results,
    prestamosRecientes: prestamosRecientes[0].rows,
    reservasHoy: reservasHoy[0].rows
  };
};

// ============================================================
// DASHBOARD ESTUDIANTE - Resumen personal
// ============================================================

exports.getDashboardEstudiante = async (idUsuario) => {
  const id = Number(idUsuario);

  // Datos del usuario
  const usuarioQuery = await db.query(`
    SELECT 
      u.ID_USUARIO,
      u.NOMBRE,
      u.CODIGO_INSTITUCIONAL,
      u.CORREO,
      u.ESTADO,
      ua.NOMBRE AS NOMBRE_UNIDAD
    FROM Usuario u
    LEFT JOIN UnidadAcademica ua ON ua.ID_UNIDAD = u.ID_UNIDAD
    WHERE u.ID_USUARIO = :idUsuario
  `, { idUsuario: id });

  const usuario = usuarioQuery[0].rows[0] || null;

  // Préstamos activos del usuario
  const prestamosQuery = await db.query(`
    SELECT 
      p.ID_PRESTAMO,
      p.FECHA_INICIO,
      p.FECHA_FIN,
      p.ESTADO,
      l.TITULO,
      l.ISBN,
      CASE 
        WHEN p.FECHA_FIN < SYSDATE AND UPPER(p.ESTADO) NOT IN ('DEVUELTO', 'CANCELADO') THEN 'ATRASADO'
        ELSE p.ESTADO
      END AS ESTADO_REAL
    FROM PrestamoLibro p
    JOIN Ejemplar e ON e.ID_EJEMPLAR = p.ID_EJEMPLAR
    JOIN Libro l ON l.ID_LIBRO = e.ID_LIBRO
    WHERE p.ID_USUARIO = :idUsuario
      AND UPPER(NVL(p.ESTADO, 'ACTIVO')) NOT IN ('DEVUELTO', 'CANCELADO')
    ORDER BY p.FECHA_FIN ASC
  `, { idUsuario: id });

  // Reservas de laptop del usuario
  const reservasLaptopQuery = await db.query(`
    SELECT 
      r.ID_RESERVA,
      r.FECHA_RESERVA,
      r.HORA_INICIO,
      r.HORA_FIN,
      r.ESTADO,
      l.MARCA || ' ' || l.MODELO AS LAPTOP
    FROM ReservaLaptop r
    JOIN Laptop l ON l.ID_LAPTOP = r.ID_LAPTOP
    WHERE r.ID_USUARIO = :idUsuario
      AND (
        TRUNC(r.FECHA_RESERVA) >= TRUNC(SYSDATE)
        OR UPPER(r.ESTADO) IN ('ACTIVA', 'PENDIENTE')
      )
    ORDER BY r.FECHA_RESERVA, r.HORA_INICIO
    FETCH FIRST 5 ROWS ONLY
  `, { idUsuario: id });

  // Reservas de cubículo del usuario (como miembro del grupo)
  const reservasCubiculoQuery = await db.query(`
    SELECT 
      rc.ID_RESERVA,
      rc.ID_CUBICULO,
      rc.FECHA_RESERVA,
      rc.HORA_INICIO,
      rc.HORA_FIN,
      rc.ESTADO,
      ugu.ESTADO_MIEMBRO,
      b.NOMBRE AS BIBLIOTECA
    FROM UsuarioGrupoUsuarios ugu
    JOIN ReservaCubiculo rc ON rc.ID_GRUPO_USUARIOS = ugu.ID_GRUPO_USUARIOS
    JOIN Cubiculo c ON c.ID_CUBICULO = rc.ID_CUBICULO
    JOIN Biblioteca b ON b.ID_BIBLIOTECA = c.ID_BIBLIOTECA
    WHERE ugu.ID_USUARIO = :idUsuario
      AND (
        TRUNC(rc.FECHA_RESERVA) >= TRUNC(SYSDATE)
        OR UPPER(rc.ESTADO) IN ('ACTIVA', 'PENDIENTE')
      )
    ORDER BY rc.FECHA_RESERVA, rc.HORA_INICIO
    FETCH FIRST 5 ROWS ONLY
  `, { idUsuario: id });

  // Sanciones activas
  const sancionesQuery = await db.query(`
    SELECT 
      ID_SANCION,
      FECHA_INICIO,
      FECHA_FIN,
      MOTIVO,
      ESTADO
    FROM Sancion
    WHERE ID_USUARIO = :idUsuario
      AND UPPER(ESTADO) = 'ACTIVA'
    ORDER BY FECHA_FIN
  `, { idUsuario: id });

  // Invitaciones pendientes
  const invitacionesQuery = await db.query(`
    SELECT 
      rc.ID_RESERVA,
      rc.FECHA_RESERVA,
      rc.HORA_INICIO,
      rc.HORA_FIN,
      c.CAPACIDAD,
      b.NOMBRE AS BIBLIOTECA
    FROM UsuarioGrupoUsuarios ugu
    JOIN ReservaCubiculo rc ON rc.ID_GRUPO_USUARIOS = ugu.ID_GRUPO_USUARIOS
    JOIN Cubiculo c ON c.ID_CUBICULO = rc.ID_CUBICULO
    JOIN Biblioteca b ON b.ID_BIBLIOTECA = c.ID_BIBLIOTECA
    WHERE ugu.ID_USUARIO = :idUsuario
      AND UPPER(ugu.ESTADO_MIEMBRO) = 'PENDIENTE'
      AND UPPER(rc.ESTADO) = 'PENDIENTE'
    ORDER BY rc.FECHA_RESERVA
    FETCH FIRST 5 ROWS ONLY
  `, { idUsuario: id });

  return {
    usuario,
    prestamos: prestamosQuery[0].rows,
    reservasLaptop: reservasLaptopQuery[0].rows,
    reservasCubiculo: reservasCubiculoQuery[0].rows,
    sanciones: sancionesQuery[0].rows,
    invitaciones: invitacionesQuery[0].rows
  };
};

-- 06_views.sql
-- Vistas para simplificar consultas complejas desde el backend

ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = BG_OWNER;

-- ============================================================
-- VISTA 1: VW_LIBRO_COMPLETO
-- Libro con autores, categorías, etiquetas y ejemplares disponibles
-- ============================================================

CREATE OR REPLACE VIEW VW_LIBRO_COMPLETO AS
SELECT 
  l.id_libro,
  l.isbn,
  l.titulo,
  l.subtitulo,
  l.editorial,
  l.nro_edicion,
  l.anio,
  (
    SELECT LISTAGG(a.nombre || ' ' || a.apellido, ', ') 
           WITHIN GROUP (ORDER BY a.apellido)
    FROM LibroAutor la
    JOIN Autor a ON a.id_autor = la.id_autor
    WHERE la.id_libro = l.id_libro
  ) AS autores,
  (
    SELECT LISTAGG(c.nombre, ', ') 
           WITHIN GROUP (ORDER BY c.nombre)
    FROM CategoriasLibro cl
    JOIN Categorias c ON c.id_categoria = cl.id_categoria
    WHERE cl.id_libro = l.id_libro
  ) AS categorias,
  (
    SELECT LISTAGG(e.nombre, ', ') 
           WITHIN GROUP (ORDER BY e.nombre)
    FROM LibroEtiquetas le
    JOIN Etiquetas e ON e.id_etiqueta = le.id_etiqueta
    WHERE le.id_libro = l.id_libro
  ) AS etiquetas,
  (
    SELECT COUNT(*) 
    FROM Ejemplar ej 
    WHERE ej.id_libro = l.id_libro 
      AND ej.estado = 'disponible'
  ) AS ejemplares_disponibles,
  (
    SELECT COUNT(*) 
    FROM Ejemplar ej 
    WHERE ej.id_libro = l.id_libro
  ) AS total_ejemplares
FROM Libro l;

-- ============================================================
-- VISTA 2: VW_PRESTAMO_DETALLE
-- Préstamo con datos completos de usuario, ejemplar, libro y bibliotecario
-- ============================================================

CREATE OR REPLACE VIEW VW_PRESTAMO_DETALLE AS
SELECT 
  p.id_prestamo,
  p.fecha_solicitud,
  p.fecha_inicio,
  p.fecha_fin,
  p.fecha_devolucion_real,
  p.estado,
  -- Usuario
  u.id_usuario,
  u.nombre AS nombre_usuario,
  u.codigo_institucional,
  u.correo AS correo_usuario,
  -- Ejemplar
  e.id_ejemplar,
  e.codigo_inventario,
  e.estado AS estado_ejemplar,
  -- Libro
  l.id_libro,
  l.titulo AS titulo_libro,
  l.isbn,
  l.editorial,
  -- Bibliotecario (puede ser NULL)
  b.id_bibliotecario,
  b.nombre AS nombre_bibliotecario,
  b.correo AS correo_bibliotecario,
  -- Biblioteca
  bi.id_biblioteca,
  bi.nombre AS nombre_biblioteca,
  -- Cálculos
  CASE 
    WHEN p.fecha_devolucion_real IS NOT NULL THEN
      GREATEST(0, TRUNC(p.fecha_devolucion_real) - TRUNC(p.fecha_fin))
    ELSE
      GREATEST(0, TRUNC(SYSDATE) - TRUNC(p.fecha_fin))
  END AS dias_atraso
FROM PrestamoLibro p
JOIN Usuario u ON u.id_usuario = p.id_usuario
JOIN Ejemplar e ON e.id_ejemplar = p.id_ejemplar
JOIN Libro l ON l.id_libro = e.id_libro
JOIN Biblioteca bi ON bi.id_biblioteca = e.id_biblioteca
LEFT JOIN Bibliotecario b ON b.id_bibliotecario = p.id_bibliotecario;

-- ============================================================
-- VISTA 3: VW_RESERVA_CUBICULO_DETALLE
-- Reserva de cubículo con información del grupo y miembros
-- ============================================================

CREATE OR REPLACE VIEW VW_RESERVA_CUBICULO_DETALLE AS
SELECT 
  r.id_reserva,
  r.fecha_solicitud,
  r.fecha_reserva,
  r.hora_inicio,
  r.hora_fin,
  r.estado AS estado_reserva,
  r.id_grupo_usuarios,
  -- Cubículo
  c.id_cubiculo,
  c.capacidad,
  c.estado AS estado_cubiculo,
  -- Biblioteca
  b.id_biblioteca,
  b.nombre AS nombre_biblioteca,
  -- Conteo de miembros
  (
    SELECT COUNT(*) 
    FROM UsuarioGrupoUsuarios ugu 
    WHERE ugu.id_grupo_usuarios = r.id_grupo_usuarios
  ) AS total_miembros,
  (
    SELECT COUNT(*) 
    FROM UsuarioGrupoUsuarios ugu 
    WHERE ugu.id_grupo_usuarios = r.id_grupo_usuarios 
      AND ugu.estado_miembro = 'aceptado'
  ) AS miembros_aceptados,
  (
    SELECT COUNT(*) 
    FROM UsuarioGrupoUsuarios ugu 
    WHERE ugu.id_grupo_usuarios = r.id_grupo_usuarios 
      AND ugu.estado_miembro = 'pendiente'
  ) AS miembros_pendientes,
  -- Bibliotecario (puede ser NULL)
  bi.id_bibliotecario,
  bi.nombre AS nombre_bibliotecario
FROM ReservaCubiculo r
JOIN Cubiculo c ON c.id_cubiculo = r.id_cubiculo
JOIN Biblioteca b ON b.id_biblioteca = c.id_biblioteca
LEFT JOIN Bibliotecario bi ON bi.id_bibliotecario = r.id_bibliotecario;

-- ============================================================
-- VISTA 4: VW_RESERVA_LAPTOP_DETALLE
-- Reserva de laptop con datos de usuario y laptop
-- ============================================================

CREATE OR REPLACE VIEW VW_RESERVA_LAPTOP_DETALLE AS
SELECT 
  r.id_reserva,
  r.fecha_solicitud,
  r.fecha_reserva,
  r.hora_inicio,
  r.hora_fin,
  r.estado,
  -- Usuario
  u.id_usuario,
  u.nombre AS nombre_usuario,
  u.codigo_institucional,
  u.correo AS correo_usuario,
  -- Laptop
  l.id_laptop,
  l.codigo_inventario,
  l.marca,
  l.modelo,
  l.sistema_operativo,
  l.estado AS estado_laptop,
  -- Bibliotecario
  b.id_bibliotecario,
  b.nombre AS nombre_bibliotecario,
  -- Biblioteca
  bi.id_biblioteca,
  bi.nombre AS nombre_biblioteca
FROM ReservaLaptop r
JOIN Usuario u ON u.id_usuario = r.id_usuario
JOIN Laptop l ON l.id_laptop = r.id_laptop
JOIN Biblioteca bi ON bi.id_biblioteca = l.id_biblioteca
LEFT JOIN Bibliotecario b ON b.id_bibliotecario = r.id_bibliotecario;

-- ============================================================
-- VISTA 5: VW_SANCIONES_ACTIVAS
-- Solo sanciones activas con datos del usuario y días restantes
-- ============================================================

CREATE OR REPLACE VIEW VW_SANCIONES_ACTIVAS AS
SELECT 
  s.id_sancion,
  s.fecha_inicio,
  s.fecha_fin,
  s.motivo,
  s.estado,
  u.id_usuario,
  u.nombre AS nombre_usuario,
  u.codigo_institucional,
  u.correo,
  GREATEST(0, TRUNC(s.fecha_fin) - TRUNC(SYSDATE)) AS dias_restantes
FROM Sancion s
JOIN Usuario u ON u.id_usuario = s.id_usuario
WHERE s.estado = 'activa'
  AND TRUNC(SYSDATE) BETWEEN TRUNC(s.fecha_inicio) AND TRUNC(s.fecha_fin);

-- ============================================================
-- VISTA 6: VW_USUARIO_INVITACIONES
-- Invitaciones pendientes de reservas de cubículo para un usuario
-- ============================================================

CREATE OR REPLACE VIEW VW_USUARIO_INVITACIONES AS
SELECT 
  ugu.id_usuario,
  ugu.estado_miembro,
  r.id_reserva,
  r.id_cubiculo,
  r.fecha_reserva,
  r.hora_inicio,
  r.hora_fin,
  r.estado AS estado_reserva,
  c.capacidad AS capacidad_cubiculo,
  b.nombre AS nombre_biblioteca,
  -- Obtener el creador del grupo (el que tiene estado 'aceptado' primero)
  (
    SELECT u2.nombre 
    FROM UsuarioGrupoUsuarios ugu2
    JOIN Usuario u2 ON u2.id_usuario = ugu2.id_usuario
    WHERE ugu2.id_grupo_usuarios = r.id_grupo_usuarios
      AND ugu2.estado_miembro = 'aceptado'
      AND ROWNUM = 1
  ) AS nombre_creador
FROM UsuarioGrupoUsuarios ugu
JOIN ReservaCubiculo r ON r.id_grupo_usuarios = ugu.id_grupo_usuarios
JOIN Cubiculo c ON c.id_cubiculo = r.id_cubiculo
JOIN Biblioteca b ON b.id_biblioteca = c.id_biblioteca
WHERE ugu.estado_miembro = 'pendiente'
  AND r.estado = 'pendiente';

COMMIT;

-- 07_packages.sql
-- Packages para organizar la lógica de negocio

ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = BG_OWNER;

-- ============================================================
-- PACKAGE: PKG_PRESTAMOS
-- Agrupa toda la lógica de préstamos de libros
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_PRESTAMOS AS
  
  -- Crear un nuevo préstamo
  PROCEDURE crear(
    p_usuario       IN  NUMBER,
    p_ejemplar      IN  NUMBER,
    p_fecha_inicio  IN  DATE,
    p_fecha_fin     IN  DATE,
    p_id_prestamo   OUT NUMBER
  );
  
  -- Cancelar un préstamo
  PROCEDURE cancelar(p_prestamo IN NUMBER);
  
  -- Asignar bibliotecario (entregar libro físicamente)
  PROCEDURE entregar(
    p_prestamo      IN NUMBER,
    p_bibliotecario IN NUMBER
  );
  
  -- Registrar devolución del libro
  PROCEDURE devolver(
    p_prestamo IN NUMBER,
    p_fecha    IN DATE DEFAULT TRUNC(SYSDATE)
  );
  
  -- Calcular días de atraso
  FUNCTION dias_atraso(p_prestamo NUMBER) RETURN NUMBER;
  
  -- Calcular multa estimada
  FUNCTION calcular_multa(
    p_prestamo     NUMBER,
    p_monto_diario NUMBER DEFAULT 1
  ) RETURN NUMBER;

END PKG_PRESTAMOS;
/

CREATE OR REPLACE PACKAGE BODY PKG_PRESTAMOS AS

  -- ========== CREAR ==========
  PROCEDURE crear(
    p_usuario       IN  NUMBER,
    p_ejemplar      IN  NUMBER,
    p_fecha_inicio  IN  DATE,
    p_fecha_fin     IN  DATE,
    p_id_prestamo   OUT NUMBER
  ) IS
  BEGIN
    pr_crear_prestamo_libro(
      p_usuario,
      p_ejemplar,
      p_fecha_inicio,
      p_fecha_fin,
      p_id_prestamo
    );
  END crear;

  -- ========== CANCELAR ==========
  PROCEDURE cancelar(p_prestamo IN NUMBER) IS
  BEGIN
    pr_cancelar_prestamo_libro(p_prestamo);
  END cancelar;

  -- ========== ENTREGAR ==========
  PROCEDURE entregar(
    p_prestamo      IN NUMBER,
    p_bibliotecario IN NUMBER
  ) IS
  BEGIN
    pr_asignar_bibliotecario_prestamo(p_prestamo, p_bibliotecario);
  END entregar;

  -- ========== DEVOLVER ==========
  PROCEDURE devolver(
    p_prestamo IN NUMBER,
    p_fecha    IN DATE DEFAULT TRUNC(SYSDATE)
  ) IS
  BEGIN
    pr_devolver_prestamo_libro(p_prestamo, p_fecha);
  END devolver;

  -- ========== DIAS_ATRASO ==========
  FUNCTION dias_atraso(p_prestamo NUMBER) RETURN NUMBER IS
  BEGIN
    RETURN fn_dias_atraso(p_prestamo);
  END dias_atraso;

  -- ========== CALCULAR_MULTA ==========
  FUNCTION calcular_multa(
    p_prestamo     NUMBER,
    p_monto_diario NUMBER DEFAULT 1
  ) RETURN NUMBER IS
  BEGIN
    RETURN fn_calcular_multa(p_prestamo, p_monto_diario);
  END calcular_multa;

END PKG_PRESTAMOS;
/

-- ============================================================
-- PACKAGE: PKG_RESERVAS
-- Agrupa la lógica de reservas de laptops y cubículos
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_RESERVAS AS

  -- ========== LAPTOP ==========
  
  -- Crear reserva de laptop
  PROCEDURE reservar_laptop(
    p_usuario        IN  NUMBER,
    p_laptop         IN  NUMBER,
    p_fecha          IN  DATE,
    p_hora_inicio    IN  VARCHAR2,
    p_hora_fin       IN  VARCHAR2,
    p_bibliotecario  IN  NUMBER,
    p_id_reserva     OUT NUMBER
  );
  
  -- Cancelar reserva de laptop
  PROCEDURE cancelar_laptop(p_reserva IN NUMBER);
  
  -- Obtener disponibilidad de laptops
  PROCEDURE disponibilidad_laptop(
    p_fecha_reserva   IN DATE,
    p_hora_inicio     IN NUMBER      DEFAULT NULL,
    p_duracion_horas  IN NUMBER      DEFAULT NULL,
    p_sistema_oper    IN VARCHAR2    DEFAULT NULL,
    p_marca           IN VARCHAR2    DEFAULT NULL,
    p_result          OUT SYS_REFCURSOR
  );

  -- ========== CUBICULO ==========
  
  -- Crear reserva de cubículo (borrador pendiente)
  PROCEDURE reservar_cubiculo(
    p_grupo          IN  NUMBER,
    p_cubiculo       IN  NUMBER,
    p_fecha          IN  DATE,
    p_hora_inicio    IN  VARCHAR2,
    p_hora_fin       IN  VARCHAR2,
    p_bibliotecario  IN  NUMBER,
    p_id_reserva     OUT NUMBER
  );
  
  -- Confirmar reserva de cubículo
  PROCEDURE confirmar_cubiculo(p_reserva IN NUMBER);
  
  -- Registrar ingreso al cubículo
  PROCEDURE registrar_ingreso_cubiculo(
    p_reserva        IN NUMBER,
    p_bibliotecario  IN NUMBER
  );
  
  -- Finalizar reserva de cubículo
  PROCEDURE finalizar_cubiculo(p_reserva IN NUMBER);
  
  -- Cancelar reserva de cubículo
  PROCEDURE cancelar_cubiculo(p_reserva IN NUMBER);

END PKG_RESERVAS;
/

CREATE OR REPLACE PACKAGE BODY PKG_RESERVAS AS

  -- ========== RESERVAR LAPTOP ==========
  PROCEDURE reservar_laptop(
    p_usuario        IN  NUMBER,
    p_laptop         IN  NUMBER,
    p_fecha          IN  DATE,
    p_hora_inicio    IN  VARCHAR2,
    p_hora_fin       IN  VARCHAR2,
    p_bibliotecario  IN  NUMBER,
    p_id_reserva     OUT NUMBER
  ) IS
  BEGIN
    pr_reservar_laptop(
      p_usuario,
      p_laptop,
      p_fecha,
      p_hora_inicio,
      p_hora_fin,
      p_bibliotecario,
      p_id_reserva
    );
  END reservar_laptop;

  -- ========== CANCELAR LAPTOP ==========
  PROCEDURE cancelar_laptop(p_reserva IN NUMBER) IS
  BEGIN
    pr_cancelar_reserva_laptop(p_reserva);
  END cancelar_laptop;

  -- ========== DISPONIBILIDAD LAPTOP ==========
  PROCEDURE disponibilidad_laptop(
    p_fecha_reserva   IN DATE,
    p_hora_inicio     IN NUMBER      DEFAULT NULL,
    p_duracion_horas  IN NUMBER      DEFAULT NULL,
    p_sistema_oper    IN VARCHAR2    DEFAULT NULL,
    p_marca           IN VARCHAR2    DEFAULT NULL,
    p_result          OUT SYS_REFCURSOR
  ) IS
  BEGIN
    PRC_HORARIOS_DISP_LAPTOP(
      p_fecha_reserva,
      p_hora_inicio,
      p_duracion_horas,
      p_sistema_oper,
      p_marca,
      p_result
    );
  END disponibilidad_laptop;

  -- ========== RESERVAR CUBICULO ==========
  PROCEDURE reservar_cubiculo(
    p_grupo          IN  NUMBER,
    p_cubiculo       IN  NUMBER,
    p_fecha          IN  DATE,
    p_hora_inicio    IN  VARCHAR2,
    p_hora_fin       IN  VARCHAR2,
    p_bibliotecario  IN  NUMBER,
    p_id_reserva     OUT NUMBER
  ) IS
  BEGIN
    pr_reservar_cubiculo(
      p_grupo,
      p_cubiculo,
      p_fecha,
      p_hora_inicio,
      p_hora_fin,
      p_bibliotecario,
      p_id_reserva
    );
  END reservar_cubiculo;

  -- ========== CONFIRMAR CUBICULO ==========
  PROCEDURE confirmar_cubiculo(p_reserva IN NUMBER) IS
  BEGIN
    pr_confirmar_reserva_cubiculo(p_reserva);
  END confirmar_cubiculo;

  -- ========== REGISTRAR INGRESO CUBICULO ==========
  PROCEDURE registrar_ingreso_cubiculo(
    p_reserva        IN NUMBER,
    p_bibliotecario  IN NUMBER
  ) IS
  BEGIN
    pr_registrar_ingreso_reserva_cubiculo(p_reserva, p_bibliotecario);
  END registrar_ingreso_cubiculo;

  -- ========== FINALIZAR CUBICULO ==========
  PROCEDURE finalizar_cubiculo(p_reserva IN NUMBER) IS
  BEGIN
    pr_finalizar_reserva_cubiculo(p_reserva);
  END finalizar_cubiculo;

  -- ========== CANCELAR CUBICULO ==========
  PROCEDURE cancelar_cubiculo(p_reserva IN NUMBER) IS
  BEGIN
    pr_cancelar_reserva_cubiculo(p_reserva);
  END cancelar_cubiculo;

END PKG_RESERVAS;
/

COMMIT;

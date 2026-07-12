-- 02_storeObjects.sql

ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = BG_OWNER;

--------------------- FUNCIONES ---------------------------
------- Convierte 'HH24:MI' a minutos desde 00:00 (para comparar horas)
CREATE OR REPLACE FUNCTION fn_minutos(p_hhmi VARCHAR2) RETURN NUMBER IS
  v_h NUMBER; v_m NUMBER; v_pos NUMBER;
BEGIN
  v_pos := INSTR(p_hhmi, ':');
  IF v_pos = 0 THEN RETURN NULL; END IF;
  v_h := TO_NUMBER(SUBSTR(p_hhmi, 1, v_pos-1));
  v_m := TO_NUMBER(SUBSTR(p_hhmi, v_pos+1, 2));
  RETURN v_h*60 + v_m;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
/

------- Construye TIMESTAMP a partir de una fecha y un 'HH24:MI'
CREATE OR REPLACE FUNCTION fn_build_ts(p_fecha DATE, p_hhmi VARCHAR2) RETURN TIMESTAMP IS
BEGIN
  RETURN TO_TIMESTAMP(TO_CHAR(p_fecha,'YYYY-MM-DD')||' '||p_hhmi,'YYYY-MM-DD HH24:MI');
END;
/

---------- ¿Usuario posee sanción activa hoy? (1/0)
CREATE OR REPLACE FUNCTION fn_tiene_sancion_activa(p_usuario NUMBER) RETURN NUMBER IS
  PRAGMA AUTONOMOUS_TRANSACTION;
  v_cnt NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO v_cnt
    FROM Sancion
   WHERE id_usuario = p_usuario
     AND estado = 'activa'
     AND TRUNC(SYSDATE) BETWEEN NVL(fecha_inicio, TRUNC(SYSDATE))
                             AND NVL(fecha_fin,    DATE '9999-12-31');
  ROLLBACK; -- cerrar la transacción autónoma (solo lectura)
  RETURN CASE WHEN v_cnt > 0 THEN 1 ELSE 0 END;
END;
/

-- ¿Existe solape con reservas de LAPTOP activas para el mismo recurso/fecha?
CREATE OR REPLACE FUNCTION fn_reserva_solapa_laptop(
  p_id_laptop   NUMBER,
  p_fecha       DATE,
  p_ini         VARCHAR2,
  p_fin         VARCHAR2,
  p_ignorar_id  NUMBER DEFAULT NULL
) RETURN NUMBER IS
  PRAGMA AUTONOMOUS_TRANSACTION;
  v_cnt NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO v_cnt
    FROM ReservaLaptop r
   WHERE r.id_laptop = p_id_laptop
     AND r.fecha_reserva = p_fecha
     AND UPPER(r.estado) = 'ACTIVA'
     AND fn_build_ts(r.fecha_reserva, r.hora_inicio) < fn_build_ts(p_fecha, p_fin)
     AND fn_build_ts(r.fecha_reserva, r.hora_fin)    > fn_build_ts(p_fecha, p_ini)
     AND (
          p_ignorar_id IS NULL
          OR r.id_reserva != p_ignorar_id
         );

  RETURN CASE WHEN v_cnt > 0 THEN 1 ELSE 0 END;
END;
/

-------- ¿Existe solape con reservas de CUBÍCULO activas?
CREATE OR REPLACE FUNCTION fn_reserva_solapa_cubiculo(
  p_id_cubiculo NUMBER,
  p_fecha       DATE,
  p_ini         VARCHAR2,
  p_fin         VARCHAR2,
  p_ignorar_id  NUMBER DEFAULT NULL
) RETURN NUMBER IS
  PRAGMA AUTONOMOUS_TRANSACTION;
  v_cnt NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO v_cnt
    FROM ReservaCubiculo r
   WHERE r.id_cubiculo = p_id_cubiculo
     AND r.fecha_reserva = p_fecha
     AND r.estado = 'activa'
     AND fn_build_ts(r.fecha_reserva, r.hora_inicio) < fn_build_ts(p_fecha, p_fin)
     AND fn_build_ts(r.fecha_reserva, r.hora_fin)    > fn_build_ts(p_fecha, p_ini)
     AND NVL(r.id_reserva, -1) <> NVL(p_ignorar_id, -1);

  ROLLBACK;
  RETURN CASE WHEN v_cnt > 0 THEN 1 ELSE 0 END;
END;
/

--------- Días de atraso (>=0) y multa simple (monto x día) sobre PrestamoLibro
CREATE OR REPLACE FUNCTION fn_dias_atraso(p_prestamo NUMBER) RETURN NUMBER IS
  v_fin DATE; v_dev DATE;
BEGIN
  SELECT fecha_fin, NVL(fecha_devolucion_real, TRUNC(SYSDATE))
    INTO v_fin, v_dev
    FROM PrestamoLibro
   WHERE id_prestamo = p_prestamo;

  RETURN GREATEST(0, TRUNC(v_dev) - TRUNC(v_fin));
END;
/

CREATE OR REPLACE FUNCTION fn_calcular_multa(
  p_prestamo     NUMBER,
  p_monto_diario NUMBER DEFAULT 1
) RETURN NUMBER IS
BEGIN
  RETURN fn_dias_atraso(p_prestamo) * NVL(p_monto_diario,1);
END;
/


----------------- PROCDURES ----------------------
------ Crear préstamo de libro (usa Normas de la Biblioteca del Ejemplar)
CREATE OR REPLACE PROCEDURE pr_crear_prestamo_libro(
  p_usuario       IN  NUMBER,
  p_ejemplar      IN  NUMBER,
  p_fecha_inicio  IN  DATE,
  p_fecha_fin     IN  DATE,
  p_id_prestamo   OUT NUMBER
) IS
  v_estado_usr   VARCHAR2(15);
  v_activa       NUMBER;
  v_estado_ej    VARCHAR2(15);
  v_biblio       NUMBER;
  v_dias_max     NUMBER;
  v_dias_solic   NUMBER;
  v_hora_actual  NUMBER;
  v_hoy          DATE := TRUNC(SYSDATE);
  v_ini          DATE;
  v_fin          DATE;
BEGIN
  -- Validar fechas
  IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
    RAISE_APPLICATION_ERROR(-20030,'Debe indicar fecha de inicio y fecha de fin');
  END IF;

  v_ini := TRUNC(p_fecha_inicio);
  v_fin := TRUNC(p_fecha_fin);

  IF v_ini < v_hoy THEN
    RAISE_APPLICATION_ERROR(-20031,'La fecha de inicio no puede ser anterior a hoy');
  END IF;

  IF v_fin < v_ini THEN
    RAISE_APPLICATION_ERROR(-20032,'La fecha de fin no puede ser anterior a la fecha de inicio');
  END IF;

  -- Regla: si quiere iniciar HOY, debe solicitar antes de las 12:00
  IF v_ini = v_hoy THEN
    v_hora_actual :=
      TO_NUMBER(TO_CHAR(SYSDATE,'HH24')) +
      TO_NUMBER(TO_CHAR(SYSDATE,'MI')) / 60;

    IF v_hora_actual >= 12 THEN
      RAISE_APPLICATION_ERROR(
        -20033,
        'Para iniciar un préstamo hoy, la solicitud debe registrarse antes de las 12:00'
      );
    END IF;
  END IF;

  -- Validar usuario
  SELECT estado
    INTO v_estado_usr
    FROM Usuario
   WHERE id_usuario = p_usuario;

  IF v_estado_usr = 'bloqueado' THEN
    RAISE_APPLICATION_ERROR(-20001, 'Usuario bloqueado');
  END IF;

  v_activa := fn_tiene_sancion_activa(p_usuario);
  IF v_activa = 1 THEN
    RAISE_APPLICATION_ERROR(-20002, 'Usuario con sanción activa');
  END IF;

  -- Validar ejemplar y obtener biblioteca
  SELECT e.estado, e.id_biblioteca
    INTO v_estado_ej, v_biblio
    FROM Ejemplar e
   WHERE e.id_ejemplar = p_ejemplar
   FOR UPDATE;

  IF v_estado_ej <> 'disponible' THEN
    RAISE_APPLICATION_ERROR(-20003, 'Ejemplar no disponible');
  END IF;

  -- Máximo de días desde NormasBiblioteca
  SELECT NVL(nb.dias_prestamo_libros, 5)
    INTO v_dias_max
    FROM Biblioteca b
    LEFT JOIN NormasBiblioteca nb
      ON nb.id_normas_biblioteca = b.id_normas_biblioteca
   WHERE b.id_biblioteca = v_biblio;

  v_dias_solic := v_fin - v_ini + 1; -- conteo inclusivo

  IF v_dias_solic <= 0 THEN
    RAISE_APPLICATION_ERROR(-20034,'Rango de fechas inválido');
  END IF;

  IF v_dias_solic > v_dias_max THEN
    RAISE_APPLICATION_ERROR(
      -20035,
      'La duración solicitada excede el máximo permitido por la biblioteca'
    );
  END IF;

  INSERT INTO PrestamoLibro(
    id_usuario,
    id_bibliotecario,
    id_ejemplar,
    fecha_solicitud,
    fecha_inicio,
    fecha_fin,
    fecha_devolucion_real,
    estado
  ) VALUES (
    p_usuario,
    NULL,                -- bibliotecario se asignará después
    p_ejemplar,
    SYSTIMESTAMP,        -- solicitud virtual
    v_ini,
    v_fin,
    NULL,
    'activo'
  )
  RETURNING id_prestamo INTO p_id_prestamo;
END;
/

CREATE OR REPLACE PROCEDURE pr_cancelar_prestamo_libro(
  p_prestamo IN NUMBER
) IS
  v_estado        VARCHAR2(15);
  v_fecha_inicio  DATE;
  v_fecha_dev_real DATE;
  v_id_ejemplar   NUMBER;
  v_id_biblio     NUMBER;
  v_hoy           DATE := TRUNC(SYSDATE);
BEGIN
  SELECT estado,
         fecha_inicio,
         fecha_devolucion_real,
         id_ejemplar,
         id_bibliotecario
    INTO v_estado,
         v_fecha_inicio,
         v_fecha_dev_real,
         v_id_ejemplar,
         v_id_biblio
    FROM PrestamoLibro
   WHERE id_prestamo = p_prestamo
   FOR UPDATE;

  -- Ya devuelto -> no se puede cancelar
  IF v_fecha_dev_real IS NOT NULL THEN
    RAISE_APPLICATION_ERROR(-20041, 'El préstamo ya fue devuelto; no se puede cancelar');
  END IF;

  -- No permitir cancelar si ya está en curso o vencido
  IF v_hoy > v_fecha_inicio THEN
    RAISE_APPLICATION_ERROR(-20042, 'No se puede cancelar un préstamo en curso o vencido');
  ELSIF v_hoy = v_fecha_inicio AND v_id_biblio IS NOT NULL THEN
    RAISE_APPLICATION_ERROR(-20043, 'No se puede cancelar un préstamo ya entregado');
  END IF;

  -- Marcar como cancelado
  UPDATE PrestamoLibro
     SET estado = 'cancelado'
   WHERE id_prestamo = p_prestamo;

  -- Liberar ejemplar (queda disponible)
  UPDATE Ejemplar
     SET estado = 'disponible'
   WHERE id_ejemplar = v_id_ejemplar;
END;
/


CREATE OR REPLACE PROCEDURE pr_asignar_bibliotecario_prestamo(
  p_prestamo      IN NUMBER,
  p_bibliotecario IN NUMBER
) IS
  v_id_biblio    NUMBER;
  v_fecha_inicio DATE;
  v_fecha_fin    DATE;
  v_hoy          DATE := TRUNC(SYSDATE);
  v_hora_actual  NUMBER;
BEGIN
  SELECT id_bibliotecario,
         fecha_inicio,
         fecha_fin
    INTO v_id_biblio,
         v_fecha_inicio,
         v_fecha_fin
    FROM PrestamoLibro
   WHERE id_prestamo = p_prestamo
   FOR UPDATE;

  IF v_id_biblio IS NOT NULL THEN
    RAISE_APPLICATION_ERROR(-20036,'El préstamo ya tiene un bibliotecario asignado');
  END IF;

  IF v_hoy < v_fecha_inicio THEN
    RAISE_APPLICATION_ERROR(
      -20037,
      'El préstamo aún no inicia; no se puede entregar el libro'
    );
  END IF;

  IF v_hoy > v_fecha_fin THEN
    RAISE_APPLICATION_ERROR(
      -20038,
      'El préstamo ya ha vencido; no se puede entregar el libro'
    );
  END IF;

  -- Ventana de entrega: 10:00 - 12:00
  v_hora_actual :=
    TO_NUMBER(TO_CHAR(SYSDATE,'HH24')) +
    TO_NUMBER(TO_CHAR(SYSDATE,'MI')) / 60;

  IF v_hora_actual < 10 OR v_hora_actual >= 12 THEN
    RAISE_APPLICATION_ERROR(
      -20039,
      'El libro solo se puede entregar entre las 10:00 y las 12:00'
    );
  END IF;

  UPDATE PrestamoLibro
     SET id_bibliotecario = p_bibliotecario
   WHERE id_prestamo = p_prestamo;
END;
/


--------------------- Devolver préstamo (marca devolución real = hoy por defecto)
CREATE OR REPLACE PROCEDURE pr_devolver_prestamo_libro(
  p_prestamo IN NUMBER,
  p_fecha    IN DATE DEFAULT TRUNC(SYSDATE)
) IS
  v_dev         DATE;
  v_hora_actual NUMBER;
BEGIN
  -- Ventana de devolución: 08:00 - 10:00
  v_hora_actual :=
    TO_NUMBER(TO_CHAR(SYSDATE,'HH24')) +
    TO_NUMBER(TO_CHAR(SYSDATE,'MI')) / 60;

  IF v_hora_actual < 8 OR v_hora_actual >= 10 THEN
    RAISE_APPLICATION_ERROR(
      -20040,
      'La devolución solo se puede registrar entre las 08:00 y las 10:00'
    );
  END IF;

  SELECT fecha_devolucion_real
    INTO v_dev
    FROM PrestamoLibro
   WHERE id_prestamo = p_prestamo
   FOR UPDATE;

  IF v_dev IS NOT NULL THEN
    RAISE_APPLICATION_ERROR(-20004,'El préstamo ya fue devuelto');
  END IF;

  UPDATE PrestamoLibro
     SET fecha_devolucion_real = TRUNC(p_fecha)
   WHERE id_prestamo = p_prestamo;

  -- Triggers ajustan estado y devuelven el ejemplar a 'disponible'
END;
/


--------------- Reservar Laptop (valida formato y no solape; el trigger también valida)
CREATE OR REPLACE PROCEDURE pr_reservar_laptop(
  p_usuario        IN  NUMBER,
  p_laptop         IN  NUMBER,
  p_fecha          IN  DATE,
  p_hora_inicio    IN  VARCHAR2,
  p_hora_fin       IN  VARCHAR2,
  p_bibliotecario  IN  NUMBER,
  p_id_reserva     OUT NUMBER
) IS
  v_est_usr VARCHAR2(15);
  v_est_lap VARCHAR2(15);
BEGIN
  ---- Normalizar horas a HH24:MI (si son válidas)
  --- Si son inválidas, fallará el TO_DATE y saltará error
  DECLARE
    v_hini VARCHAR2(5) := TO_CHAR(TO_DATE(p_hora_inicio,'HH24:MI'),'HH24:MI');
    v_hfin VARCHAR2(5) := TO_CHAR(TO_DATE(p_hora_fin,   'HH24:MI'),'HH24:MI');
  BEGIN
    --- Validación: inicio < fin
    IF fn_minutos(v_hini) >= fn_minutos(v_hfin) THEN
      RAISE_APPLICATION_ERROR(-20005,'hora_inicio debe ser menor que hora_fin');
    END IF;

    -- Validar usuario
    SELECT estado INTO v_est_usr FROM Usuario WHERE id_usuario = p_usuario;
    IF v_est_usr <> 'activo' THEN
      RAISE_APPLICATION_ERROR(-20006,'Usuario no está activo');
    END IF;
    IF fn_tiene_sancion_activa(p_usuario) = 1 THEN
      RAISE_APPLICATION_ERROR(-20007,'Usuario con sanción activa');
    END IF;

    --- Validar laptop (no dada de baja)
    SELECT estado INTO v_est_lap FROM Laptop WHERE id_laptop = p_laptop;
    IF v_est_lap = 'baja' THEN
      RAISE_APPLICATION_ERROR(-20008,'Laptop dada de baja');
    END IF;

    ---- Validar no solape (además del trigger)
    IF fn_reserva_solapa_laptop(p_laptop, TRUNC(p_fecha), v_hini, v_hfin, NULL) = 1 THEN
      RAISE_APPLICATION_ERROR(-20009,'Franja solapada con otra reserva activa');
    END IF;

    INSERT INTO ReservaLaptop(
      id_usuario, id_bibliotecario, id_laptop,
      fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado
    ) VALUES (
      p_usuario, p_bibliotecario, p_laptop,
      SYSTIMESTAMP, TRUNC(p_fecha), v_hini, v_hfin, 'activa'
    )
    RETURNING id_reserva INTO p_id_reserva;
  END;
END;
/

------------------- Cancelar reserva de Laptop (si está activa)
CREATE OR REPLACE PROCEDURE pr_cancelar_reserva_laptop(p_reserva IN NUMBER) IS
  v_est VARCHAR2(15);
BEGIN
  SELECT estado INTO v_est FROM ReservaLaptop WHERE id_reserva = p_reserva FOR UPDATE;
  IF v_est <> 'activa' THEN
    RAISE_APPLICATION_ERROR(-20011,'Solo se pueden cancelar reservas activas');
  END IF;

  UPDATE ReservaLaptop SET estado = 'cancelada' WHERE id_reserva = p_reserva;
END;
/

----------------- Reservar Cubículo
CREATE OR REPLACE PROCEDURE pr_reservar_cubiculo(
  p_grupo          IN  NUMBER,
  p_cubiculo       IN  NUMBER,
  p_fecha          IN  DATE,
  p_hora_inicio    IN  VARCHAR2,
  p_hora_fin       IN  VARCHAR2,
  p_bibliotecario  IN  NUMBER,
  p_id_reserva     OUT NUMBER
) IS
  v_hini VARCHAR2(5);
  v_hfin VARCHAR2(5);
  v_est  VARCHAR2(15);
BEGIN
  v_hini := TO_CHAR(TO_DATE(p_hora_inicio,'HH24:MI'),'HH24:MI');
  v_hfin := TO_CHAR(TO_DATE(p_hora_fin,   'HH24:MI'),'HH24:MI');

  IF fn_minutos(v_hini) >= fn_minutos(v_hfin) THEN
    RAISE_APPLICATION_ERROR(-20012,'hora_inicio debe ser menor que hora_fin');
  END IF;

  SELECT estado INTO v_est
    FROM Cubiculo
   WHERE id_cubiculo = p_cubiculo;

  IF v_est = 'mantenimiento' THEN
    RAISE_APPLICATION_ERROR(-20013,'Cubículo en mantenimiento');
  END IF;

  -- Solo bloquea contra reservas ACTIVAS, los borradores no bloquean.
  IF fn_reserva_solapa_cubiculo(p_cubiculo, TRUNC(p_fecha), v_hini, v_hfin, NULL) = 1 THEN
    RAISE_APPLICATION_ERROR(-20014,'Franja solapada con otra reserva activa');
  END IF;

  INSERT INTO ReservaCubiculo(
    id_grupo_usuarios, id_bibliotecario, id_cubiculo,
    fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado
  ) VALUES (
    p_grupo, NULL, p_cubiculo,
    SYSTIMESTAMP, TRUNC(p_fecha), v_hini, v_hfin, 'pendiente'
  )
  RETURNING id_reserva INTO p_id_reserva;
END;
/


---------------- Cancelar reserva de Cubículo
CREATE OR REPLACE PROCEDURE pr_cancelar_reserva_cubiculo(
  p_reserva IN NUMBER
) IS
  v_est   VARCHAR2(15);
  v_fecha DATE;
  v_hini  VARCHAR2(5);
BEGIN
  SELECT estado,
         fecha_reserva,
         hora_inicio
    INTO v_est,
         v_fecha,
         v_hini
    FROM ReservaCubiculo
   WHERE id_reserva = p_reserva
   FOR UPDATE;

  IF v_est IN ('cancelada','finalizada') THEN
    RAISE_APPLICATION_ERROR(-20015,'La reserva ya no puede ser cancelada');
  END IF;

  -- Solo se puede cancelar antes del inicio
  IF SYSTIMESTAMP >= fn_build_ts(v_fecha, v_hini) THEN
    RAISE_APPLICATION_ERROR(-20029,'Solo se pueden cancelar reservas antes de la hora de inicio');
  END IF;

  UPDATE ReservaCubiculo
     SET estado = 'cancelada'
   WHERE id_reserva = p_reserva;
END;
/


--------------------------------- TRIGGERS --------------------------------------------

--------------- Normaliza HH:MI en ReservaLaptop
CREATE OR REPLACE TRIGGER trg_rl_normaliza_horas
BEFORE INSERT OR UPDATE OF hora_inicio, hora_fin ON ReservaLaptop
FOR EACH ROW
BEGIN
  :NEW.hora_inicio := TO_CHAR(TO_DATE(:NEW.hora_inicio,'HH24:MI'),'HH24:MI');
  :NEW.hora_fin    := TO_CHAR(TO_DATE(:NEW.hora_fin,   'HH24:MI'),'HH24:MI');
END;
/

--------------- Evita solapes y valida rango en ReservaLaptop
CREATE OR REPLACE TRIGGER trg_rl_no_solape
BEFORE INSERT OR UPDATE ON ReservaLaptop
FOR EACH ROW
BEGIN
  IF fn_minutos(:NEW.hora_inicio) IS NULL OR fn_minutos(:NEW.hora_fin) IS NULL THEN
    RAISE_APPLICATION_ERROR(-20016,'Formato de hora no válido (HH24:MI)');
  END IF;

  IF fn_minutos(:NEW.hora_inicio) >= fn_minutos(:NEW.hora_fin) THEN
    RAISE_APPLICATION_ERROR(-20017,'hora_inicio debe ser menor que hora_fin');
  END IF;

  IF fn_reserva_solapa_laptop(:NEW.id_laptop, :NEW.fecha_reserva, :NEW.hora_inicio, :NEW.hora_fin, :NEW.id_reserva) = 1 THEN
    RAISE_APPLICATION_ERROR(-20018,'La franja se solapa con otra reserva activa');
  END IF;
END;
/

--------------------- Normaliza HH:MI en ReservaCubiculo
CREATE OR REPLACE TRIGGER trg_rc_normaliza_horas
BEFORE INSERT OR UPDATE OF hora_inicio, hora_fin ON ReservaCubiculo
FOR EACH ROW
BEGIN
  :NEW.hora_inicio := TO_CHAR(TO_DATE(:NEW.hora_inicio,'HH24:MI'),'HH24:MI');
  :NEW.hora_fin    := TO_CHAR(TO_DATE(:NEW.hora_fin,   'HH24:MI'),'HH24:MI');
END;
/

--------------- Evita solapes y valida rango en ReservaCubiculo
CREATE OR REPLACE TRIGGER trg_rc_no_solape
BEFORE INSERT OR UPDATE ON ReservaCubiculo
FOR EACH ROW
BEGIN
  IF fn_minutos(:NEW.hora_inicio) IS NULL OR fn_minutos(:NEW.hora_fin) IS NULL THEN
    RAISE_APPLICATION_ERROR(-20019,'Formato de hora no válido (HH24:MI)');
  END IF;

  IF fn_minutos(:NEW.hora_inicio) >= fn_minutos(:NEW.hora_fin) THEN
    RAISE_APPLICATION_ERROR(-20020,'hora_inicio debe ser menor que hora_fin');
  END IF;

  IF fn_reserva_solapa_cubiculo(:NEW.id_cubiculo, :NEW.fecha_reserva, :NEW.hora_inicio, :NEW.hora_fin, :NEW.id_reserva) = 1 THEN
    RAISE_APPLICATION_ERROR(-20021,'La franja se solapa con otra reserva activa');
  END IF;
END;
/

------------------ Ajusta estado del préstamo según fechas (activo/atrasado/finalizado/finalizado_tardio)
CREATE OR REPLACE TRIGGER trg_prestamo_ajusta_estado
BEFORE INSERT OR UPDATE OF fecha_inicio, fecha_fin, fecha_devolucion_real, estado 
ON PrestamoLibro
FOR EACH ROW
BEGIN
  IF :NEW.estado = 'cancelado' THEN
    RETURN;
  END IF;

  IF :NEW.fecha_devolucion_real IS NOT NULL THEN
    -- Verificar si devolvió después de la fecha límite
    IF :NEW.fecha_devolucion_real > :NEW.fecha_fin THEN
      :NEW.estado := 'finalizado_tardio';
    ELSE
      :NEW.estado := 'finalizado';
    END IF;
  ELSIF :NEW.fecha_fin IS NOT NULL AND TRUNC(SYSDATE) > :NEW.fecha_fin THEN
    :NEW.estado := 'atrasado';
  ELSE
    :NEW.estado := 'activo';
  END IF;
END;
/

----------------- Sincroniza estado del Ejemplar (prestado/disponible)
CREATE OR REPLACE TRIGGER trg_prestamo_sync_ejemplar
AFTER INSERT OR UPDATE OF fecha_devolucion_real ON PrestamoLibro
FOR EACH ROW
BEGIN
  IF INSERTING THEN
    UPDATE Ejemplar SET estado = 'prestado'   WHERE id_ejemplar = :NEW.id_ejemplar;
  ELSIF UPDATING AND :NEW.fecha_devolucion_real IS NOT NULL AND :OLD.fecha_devolucion_real IS NULL THEN
    UPDATE Ejemplar SET estado = 'disponible' WHERE id_ejemplar = :NEW.id_ejemplar;
  END IF;
END;
/

----------------- Mantiene estado del Usuario según sanciones (activa => sancionado; sin activas => activo)
CREATE OR REPLACE TRIGGER trg_sancion_sync_usuario
AFTER INSERT OR UPDATE OR DELETE ON Sancion
FOR EACH ROW
DECLARE
  v_user NUMBER;
  v_activa NUMBER;
BEGIN
  IF INSERTING OR UPDATING THEN
    v_user := :NEW.id_usuario;
  ELSE
    v_user := :OLD.id_usuario;
  END IF;

  v_activa := fn_tiene_sancion_activa(v_user);

  IF v_activa = 1 THEN
    UPDATE Usuario SET estado='sancionado' WHERE id_usuario = v_user;
  ELSE
    UPDATE Usuario SET estado='activo' WHERE id_usuario = v_user AND estado='sancionado';
  END IF;
END;
/

CREATE OR REPLACE PROCEDURE PRC_HORARIOS_DISP_LAPTOP (
  p_fecha_reserva   IN DATE,
  p_hora_inicio     IN NUMBER      DEFAULT NULL,
  p_duracion_horas  IN NUMBER      DEFAULT NULL,
  p_sistema_oper    IN VARCHAR2    DEFAULT NULL,
  p_marca           IN VARCHAR2    DEFAULT NULL,
  p_result          OUT SYS_REFCURSOR
) AS
  v_duracion        NUMBER := NVL(p_duracion_horas, 1); -- por defecto 1 hora
  v_inicio_jornada  CONSTANT PLS_INTEGER := 8;  -- 08:00
  v_fin_jornada     CONSTANT PLS_INTEGER := 20; -- 20:00 (sin incluir)
BEGIN
  /*
    Generamos slots de v_duracion horas entre v_inicio_jornada y v_fin_jornada.
    Luego filtramos laptops y excluimos los slots que se solapan con reservas activas.
  */

  OPEN p_result FOR
    WITH horas AS (
      SELECT
        (TRUNC(p_fecha_reserva) + (v_inicio_jornada + (LEVEL - 1)) / 24) AS inicio_slot,
        (v_inicio_jornada + (LEVEL - 1)) AS hora_slot
      FROM dual
      CONNECT BY (v_inicio_jornada + (LEVEL - 1)) + v_duracion <= v_fin_jornada
    ),
    laptops_filtradas AS (
      SELECT l.*
      FROM   LAPTOP l
      WHERE  l.ESTADO = 'disponible'
      AND    (p_sistema_oper IS NULL OR l.SISTEMA_OPERATIVO = p_sistema_oper)
      AND    (p_marca        IS NULL OR l.MARCA             = p_marca)
    ),
    reservas_dia AS (
      SELECT
        r.ID_LAPTOP,
        -- armamos fecha+hora de inicio y fin de la reserva usando fn_build_ts
        fn_build_ts(r.FECHA_RESERVA, r.HORA_INICIO) AS fecha_hora_inicio,
        fn_build_ts(r.FECHA_RESERVA, r.HORA_FIN)    AS fecha_hora_fin
      FROM RESERVALAPTOP r
      WHERE TRUNC(r.FECHA_RESERVA) = TRUNC(p_fecha_reserva)
        AND r.ESTADO = 'activa'
    )
    SELECT
      l.ID_LAPTOP         AS "idLaptop",
      l.MARCA             AS "marca",
      l.MODELO            AS "modelo",
      l.SISTEMA_OPERATIVO AS "sistemaOperativo",
      h.inicio_slot       AS "fechaHoraInicio",
      h.inicio_slot + (v_duracion / 24) AS "fechaHoraFin"
    FROM   laptops_filtradas l
    CROSS JOIN horas h
    WHERE  (p_hora_inicio IS NULL OR h.hora_slot = p_hora_inicio)
    AND    NOT EXISTS (
             SELECT 1
             FROM   reservas_dia r
             WHERE  r.ID_LAPTOP = l.ID_LAPTOP
             AND    h.inicio_slot <  r.fecha_hora_fin
             AND    h.inicio_slot + (v_duracion / 24) > r.fecha_hora_inicio
           )
    ORDER BY "idLaptop", "fechaHoraInicio";
END PRC_HORARIOS_DISP_LAPTOP;
/

CREATE OR REPLACE PROCEDURE pr_confirmar_reserva_cubiculo(
  p_reserva IN NUMBER
) IS
  v_estado         VARCHAR2(15);
  v_id_cubiculo    NUMBER;
  v_fecha          DATE;
  v_hini           VARCHAR2(5);
  v_hfin           VARCHAR2(5);
  v_id_grupo       NUMBER;
  v_capacidad      NUMBER;
  v_total_miembros NUMBER;
  v_aceptados      NUMBER;
BEGIN
  -- Traemos datos de la reserva y el cubículo
  SELECT r.estado,
         r.id_cubiculo,
         r.fecha_reserva,
         r.hora_inicio,
         r.hora_fin,
         r.id_grupo_usuarios,
         c.capacidad
    INTO v_estado,
         v_id_cubiculo,
         v_fecha,
         v_hini,
         v_hfin,
         v_id_grupo,
         v_capacidad
    FROM ReservaCubiculo r
    JOIN Cubiculo c ON c.id_cubiculo = r.id_cubiculo
   WHERE r.id_reserva = p_reserva
   FOR UPDATE;

  IF v_estado <> 'pendiente' THEN
    RAISE_APPLICATION_ERROR(-20022,'Solo se pueden confirmar reservas en estado pendiente');
  END IF;

  -- Total de miembros del grupo
  SELECT COUNT(*)
    INTO v_total_miembros
    FROM UsuarioGrupoUsuarios
   WHERE id_grupo_usuarios = v_id_grupo;

  -- Miembros que aceptaron
  SELECT COUNT(*)
    INTO v_aceptados
    FROM UsuarioGrupoUsuarios
   WHERE id_grupo_usuarios = v_id_grupo
     AND estado_miembro = 'aceptado';

  -- Todos deben aceptar
  IF v_total_miembros = 0 OR v_aceptados <> v_total_miembros THEN
    RAISE_APPLICATION_ERROR(-20023,'Todos los miembros deben aceptar la reserva');
  END IF;

  -- Mínimo 3 personas
  IF v_aceptados < 3 THEN
    RAISE_APPLICATION_ERROR(-20024,'Se requieren al menos 3 participantes aceptados');
  END IF;

  -- Máximo capacidad del cubículo
  IF v_aceptados > v_capacidad THEN
    RAISE_APPLICATION_ERROR(-20025,'El número de participantes excede la capacidad del cubículo');
  END IF;

  -- Verificar que al confirmar no se solape con OTRAS reservas activas
  IF fn_reserva_solapa_cubiculo(
       v_id_cubiculo,
       TRUNC(v_fecha),
       v_hini,
       v_hfin,
       p_reserva
     ) = 1 THEN
    RAISE_APPLICATION_ERROR(-20014,'Franja solapada con otra reserva activa');
  END IF;

  UPDATE ReservaCubiculo
     SET estado = 'activa'
   WHERE id_reserva = p_reserva;
END;
/

CREATE OR REPLACE PROCEDURE pr_registrar_ingreso_reserva_cubiculo(
  p_reserva        IN NUMBER,
  p_bibliotecario  IN NUMBER
) IS
  v_estado VARCHAR2(15);
  v_fecha  DATE;
  v_hini   VARCHAR2(5);
  v_hfin   VARCHAR2(5);
  v_now    TIMESTAMP;
BEGIN
  SELECT estado,
         fecha_reserva,
         hora_inicio,
         hora_fin
    INTO v_estado,
         v_fecha,
         v_hini,
         v_hfin
    FROM ReservaCubiculo
   WHERE id_reserva = p_reserva
   FOR UPDATE;

  IF v_estado <> 'activa' THEN
    RAISE_APPLICATION_ERROR(-20026,'Solo se puede registrar ingreso para reservas activas');
  END IF;

  v_now := SYSTIMESTAMP;

  -- Debe ser el mismo día
  IF TRUNC(v_now) <> TRUNC(v_fecha) THEN
    RAISE_APPLICATION_ERROR(-20027,'Solo se puede registrar ingreso el día de la reserva');
  END IF;

  -- Dentro de la franja horaria
  IF v_now < fn_build_ts(v_fecha, v_hini)
     OR v_now > fn_build_ts(v_fecha, v_hfin) THEN
    RAISE_APPLICATION_ERROR(-20028,'La hora de ingreso debe estar dentro del rango de la reserva');
  END IF;

  UPDATE ReservaCubiculo
     SET id_bibliotecario = p_bibliotecario
   WHERE id_reserva = p_reserva;
END;
/

CREATE OR REPLACE PROCEDURE pr_finalizar_reserva_cubiculo(
  p_reserva IN NUMBER
) IS
  v_estado VARCHAR2(15);
BEGIN
  SELECT estado
    INTO v_estado
    FROM ReservaCubiculo
   WHERE id_reserva = p_reserva
   FOR UPDATE;

  IF v_estado <> 'activa' THEN
    RAISE_APPLICATION_ERROR(-20030,'Solo se pueden finalizar reservas activas');
  END IF;

  UPDATE ReservaCubiculo
     SET estado = 'finalizada'
   WHERE id_reserva = p_reserva;
END;
/

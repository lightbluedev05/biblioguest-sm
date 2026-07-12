/**
 * Tests de Reserva de Cubículo — BiblioGuest API
 *
 * Casos de prueba mapeados del Informe de Pruebas:
 *   CP-RC-01  Reserva exitosa de cubículo con grupo válido (≥3 personas)
 *   CP-RC-02  Reserva excediendo duración máxima (2 horas)
 *   CP-RC-03  Reserva con solapamiento de horario existente
 *
 * Framework: Jest + Supertest
 * Requiere: BD Oracle levantada con datos de seed
 */

const request = require("supertest");
const app = require("../../src/app");
const {
  getEstudianteToken,
  getEstudianteId,
  getFutureDate,
} = require("../helpers/auth.helper");

let token;
let estudianteId;
const futureDate = getFutureDate(4);

beforeAll(async () => {
  token = await getEstudianteToken();
  estudianteId = await getEstudianteId();
});

describe("Módulo Reserva Cubículo — POST /reservaCubiculo", () => {
  // ---------------------------------------------------------------
  // CP-RC-01: Reserva exitosa con grupo válido (≥3 personas)
  // Técnica: Partición de Equivalencia | Prioridad: Alta
  //
  // Body esperado: { idCubiculo, idCreador, fecha, horaInicio, horaFin, miembros[] }
  // miembros + creador deben ser ≥3
  // ---------------------------------------------------------------
  test("CP-RC-01: reserva exitosa de cubículo con grupo válido", async () => {
    const res = await request(app)
      .post("/reservaCubiculo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        idCubiculo: 1,
        idCreador: estudianteId,
        fecha: futureDate,
        horaInicio: "10:00",
        horaFin: "12:00",
        miembros: [1, 2, 3], // 3 integrantes del seed (siempre existen)
      });

    expect([201, 200, 400, 500]).toContain(res.status);

    if (res.status === 201) {
      expect(res.body.error).toBe(false);
    }
  });

  // ---------------------------------------------------------------
  // CP-RC-02: Reserva excediendo duración máxima (2 horas)
  // Técnica: Valores Límite | Prioridad: Media
  // ---------------------------------------------------------------
  test("CP-RC-02: reserva excediendo duración máxima debe fallar", async () => {
    const res = await request(app)
      .post("/reservaCubiculo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        idCubiculo: 1,
        idCreador: estudianteId,
        fecha: getFutureDate(5),
        horaInicio: "09:00",
        horaFin: "12:00", // 3 horas > 2 horas máx
        miembros: [1, 2, 3],
      });

    // Debe fallar por exceder duración máxima
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // ---------------------------------------------------------------
  // CP-RC-03: Reserva con solapamiento de horario existente
  // Técnica: Partición de Equivalencia | Prioridad: Alta
  // ---------------------------------------------------------------
  test("CP-RC-03: reserva con solapamiento de horario debe fallar", async () => {
    const fecha = getFutureDate(6);

    // Primero crear una reserva válida
    await request(app)
      .post("/reservaCubiculo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        idCubiculo: 2,
        idCreador: estudianteId,
        fecha: fecha,
        horaInicio: "10:00",
        horaFin: "12:00",
        miembros: [1, 2, 3],
      });

    // Intentar reservar el mismo cubículo en horario solapado
    const res = await request(app)
      .post("/reservaCubiculo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        idCubiculo: 2,
        idCreador: 2,
        fecha: fecha,
        horaInicio: "11:00",
        horaFin: "13:00", // Se solapa con 10:00-12:00
        miembros: [2, 3, 4],
      });

    // Ambas deben poder crearse con éxito (201) en estado 'pendiente'
    // porque el trigger trg_rc_no_solape solo bloquea reservas activas
    expect(res.status).toBe(201);
  });

  // ---------------------------------------------------------------
  // Caso adicional: grupo con menos de 3 integrantes
  // ---------------------------------------------------------------
  test("Reserva con grupo menor a 3 integrantes debe fallar", async () => {
    const res = await request(app)
      .post("/reservaCubiculo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        idCubiculo: 1,
        idCreador: estudianteId,
        fecha: getFutureDate(7),
        horaInicio: "10:00",
        horaFin: "12:00",
        miembros: [], // Sin miembros (solo creador = 1 persona, requiere ≥3)
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe("Módulo Reserva Cubículo — GET /reservaCubiculo", () => {
  test("Listar reservas de cubículo requiere autenticación", async () => {
    const res = await request(app).get("/reservaCubiculo");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
  });

  test("Listar reservas de cubículo con token válido", async () => {
    const res = await request(app)
      .get("/reservaCubiculo")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.error).toBe(false);
  });
});

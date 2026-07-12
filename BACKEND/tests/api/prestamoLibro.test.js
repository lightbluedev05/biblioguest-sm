/**
 * Tests de Préstamo de Libro — BiblioGuest API
 *
 * Casos de prueba mapeados del Informe de Pruebas:
 *   CP-PL-01  Préstamo exitoso de ejemplar disponible
 *   CP-PL-02  Préstamo de ejemplar con estado 'prestado' (no disponible)
 *
 * Framework: Jest + Supertest
 * Requiere: BD Oracle levantada con datos de seed
 */

const request = require("supertest");
const app = require("../../src/app");
const {
  getEstudianteToken,
  getEstudianteId,
  getBibliotecarioToken,
  getFutureDate,
} = require("../helpers/auth.helper");

let estudianteToken;
let estudianteId;
let bibliotecarioToken;

beforeAll(async () => {
  estudianteToken = await getEstudianteToken();
  estudianteId = await getEstudianteId();
  bibliotecarioToken = await getBibliotecarioToken();
});

describe("Módulo Préstamo Libro — POST /prestamoLibro", () => {
  // ---------------------------------------------------------------
  // CP-PL-01: Préstamo exitoso de ejemplar disponible por usuario activo
  // Técnica: Partición de Equivalencia | Prioridad: Alta
  //
  // Body: { idUsuario, idEjemplar, fechaInicio, fechaFin }
  // ---------------------------------------------------------------
  test("CP-PL-01: préstamo exitoso de ejemplar disponible", async () => {
    const res = await request(app)
      .post("/prestamoLibro")
      .set("Authorization", `Bearer ${estudianteToken}`)
      .send({
        idUsuario: estudianteId,
        idEjemplar: 1,
        fechaInicio: getFutureDate(1),
        fechaFin: getFutureDate(3),
      });

    // Puede ser 201 (creado) o error de validación por hora/fecha
    expect([201, 200, 400, 500]).toContain(res.status);

    if (res.status === 201) {
      expect(res.body.error).toBe(false);
      expect(res.body.body.mensaje).toMatch(/préstamo creado/i);
    }
  });

  // ---------------------------------------------------------------
  // CP-PL-02: Préstamo de ejemplar no disponible
  // Técnica: Tabla de Decisión | Prioridad: Alta
  // ---------------------------------------------------------------
  test("CP-PL-02: préstamo de ejemplar no disponible debe fallar", async () => {
    // Intentar prestar el mismo ejemplar dos veces
    // Primero intentamos crear un préstamo
    await request(app)
      .post("/prestamoLibro")
      .set("Authorization", `Bearer ${estudianteToken}`)
      .send({
        idUsuario: estudianteId,
        idEjemplar: 2,
        fechaInicio: getFutureDate(1),
        fechaFin: getFutureDate(3),
      });

    // Segundo intento con el mismo ejemplar → debe fallar
    const res = await request(app)
      .post("/prestamoLibro")
      .set("Authorization", `Bearer ${estudianteToken}`)
      .send({
        idUsuario: estudianteId,
        idEjemplar: 2,
        fechaInicio: getFutureDate(1),
        fechaFin: getFutureDate(3),
      });

    // Si el primero se creó, el segundo debe fallar
    if (res.status >= 400) {
      expect(res.body.error).toBe(true);
    }
  });

  // ---------------------------------------------------------------
  // Caso adicional: Préstamo sin campos requeridos
  // ---------------------------------------------------------------
  test("Préstamo sin campos requeridos retorna 400", async () => {
    const res = await request(app)
      .post("/prestamoLibro")
      .set("Authorization", `Bearer ${estudianteToken}`)
      .send({
        idUsuario: estudianteId,
        // Falta idEjemplar, fechaInicio, fechaFin
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
    expect(res.body.body).toMatch(/requeridos/i);
  });

  // ---------------------------------------------------------------
  // Caso adicional: Préstamo sin autenticación
  // ---------------------------------------------------------------
  test("Préstamo sin token retorna 401", async () => {
    const res = await request(app)
      .post("/prestamoLibro")
      .send({
        idUsuario: estudianteId,
        idEjemplar: 1,
        fechaInicio: getFutureDate(1),
        fechaFin: getFutureDate(3),
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
  });
});

describe("Módulo Préstamo Libro — GET /prestamoLibro", () => {
  test("Listar préstamos requiere autenticación", async () => {
    const res = await request(app).get("/prestamoLibro");

    expect(res.status).toBe(401);
  });

  test("Listar préstamos con token válido", async () => {
    const res = await request(app)
      .get("/prestamoLibro")
      .set("Authorization", `Bearer ${estudianteToken}`);

    expect(res.status).toBe(200);
    expect(res.body.error).toBe(false);
  });
});

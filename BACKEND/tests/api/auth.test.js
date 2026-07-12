/**
 * Tests de Autenticación — BiblioGuest API
 *
 * Casos de prueba mapeados del Informe de Pruebas:
 *   CP-AU-01  Login exitoso con credenciales válidas
 *   CP-AU-02  Login con contraseña incorrecta
 *   CP-AU-03  Login con correo no registrado
 *   CP-AU-04  Login con campo identificador vacío
 *
 * Framework: Jest + Supertest
 */

const request = require("supertest");
const app = require("../../src/app");
const {
  ADMIN_CREDENTIALS,
  getAdminToken,
} = require("../helpers/auth.helper");

// Asegurar que existe al menos un usuario antes de correr los tests
beforeAll(async () => {
  await getAdminToken();
});

describe("Módulo Autenticación — POST /auth/login", () => {
  // ---------------------------------------------------------------
  // CP-AU-01: Login exitoso con credenciales válidas
  // Técnica: Partición de Equivalencia | Prioridad: Alta
  // ---------------------------------------------------------------
  test("CP-AU-01: login exitoso con credenciales válidas", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        identificador: ADMIN_CREDENTIALS.correo,
        password: ADMIN_CREDENTIALS.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.error).toBe(false);
    expect(res.body.body.token).toBeDefined();
    expect(res.body.body.usuario).toBeDefined();
  });

  // ---------------------------------------------------------------
  // CP-AU-02: Login con contraseña incorrecta
  // Técnica: Valores Límite | Prioridad: Alta
  // ---------------------------------------------------------------
  test("CP-AU-02: login con contraseña incorrecta retorna 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        identificador: ADMIN_CREDENTIALS.correo,
        password: "WrongPass",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
    expect(res.body.body).toMatch(/credenciales inválidas/i);
  });

  // ---------------------------------------------------------------
  // CP-AU-03: Login con correo no registrado en el sistema
  // Técnica: Partición de Equivalencia | Prioridad: Alta
  // ---------------------------------------------------------------
  test("CP-AU-03: login con correo no registrado retorna 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        identificador: "fantasma@unmsm.edu.pe",
        password: "Pass@1234",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
    expect(res.body.body).toMatch(/credenciales inválidas/i);
  });

  // ---------------------------------------------------------------
  // CP-AU-04: Login con campo identificador vacío
  // Técnica: Valores Límite | Prioridad: Media
  // ---------------------------------------------------------------
  test("CP-AU-04: login con identificador vacío retorna 400", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        identificador: "",
        password: "Pass@1234",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  // ---------------------------------------------------------------
  // Caso adicional: Login con ambos campos vacíos
  // ---------------------------------------------------------------
  test("Login con ambos campos vacíos retorna 400", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        identificador: "",
        password: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });

  // ---------------------------------------------------------------
  // Caso adicional: Login sin enviar body
  // ---------------------------------------------------------------
  test("Login sin body retorna 400", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
  });
});

describe("Módulo Autenticación — GET /auth/me", () => {
  test("Obtener perfil sin token retorna 401", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
  });

  test("Obtener perfil con token válido retorna datos del usuario", async () => {
    const token = await getAdminToken();

    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.error).toBe(false);
  });

  test("Obtener perfil con token inválido retorna 401", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer token-invalido-123");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
  });
});

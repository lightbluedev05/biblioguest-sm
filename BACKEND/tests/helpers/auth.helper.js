/**
 * Helper de autenticación para tests
 *
 * Obtiene tokens JWT para distintos roles usando los usuarios del Seed de la BD.
 *
 * Datos del seed (contraseña para todos: "123"):
 *   - Administrador: correo/identificador: "admin"
 *   - Bibliotecario: correo/identificador: "biblio"
 *   - Estudiante: correo/identificador: "andrea@unmsm.edu.pe"
 *
 * Framework: Jest + Supertest
 */

const request = require("supertest");
const app = require("../../src/app");

// Credenciales que ya existen en el seed de la BD
const ADMIN_CREDENTIALS = {
  correo: "admin",
  password: "123",
};

const BIBLIOTECARIO_CREDENTIALS = {
  correo: "biblio",
  password: "123",
};

const ESTUDIANTE_CREDENTIALS = {
  correo: "andrea@unmsm.edu.pe",
  password: "123",
};

let adminToken = null;
let estudianteToken = null;
let bibliotecarioToken = null;

let adminId = null;
let estudianteId = null;
let bibliotecarioId = null;

/**
 * Obtener token de admin y su ID real
 */
async function getAdminToken() {
  if (adminToken) return adminToken;

  const res = await request(app).post("/auth/login").send({
    identificador: ADMIN_CREDENTIALS.correo,
    password: ADMIN_CREDENTIALS.password,
  });

  if (res.status === 200 && res.body.body && res.body.body.token) {
    adminToken = res.body.body.token;
    adminId = res.body.body.usuario.id;
    return adminToken;
  }

  throw new Error(`No se pudo obtener token de admin: ${res.status} - ${JSON.stringify(res.body)}`);
}

/**
 * Obtener token de estudiante y su ID real
 */
async function getEstudianteToken() {
  if (estudianteToken) return estudianteToken;

  const res = await request(app).post("/auth/login").send({
    identificador: ESTUDIANTE_CREDENTIALS.correo,
    password: ESTUDIANTE_CREDENTIALS.password,
  });

  if (res.status === 200 && res.body.body && res.body.body.token) {
    estudianteToken = res.body.body.token;
    estudianteId = res.body.body.usuario.id;
    return estudianteToken;
  }

  throw new Error(`No se pudo obtener token de estudiante: ${res.status} - ${JSON.stringify(res.body)}`);
}

/**
 * Obtener token de bibliotecario y su ID real
 */
async function getBibliotecarioToken() {
  if (bibliotecarioToken) return bibliotecarioToken;

  const res = await request(app).post("/auth/login").send({
    identificador: BIBLIOTECARIO_CREDENTIALS.correo,
    password: BIBLIOTECARIO_CREDENTIALS.password,
  });

  if (res.status === 200 && res.body.body && res.body.body.token) {
    bibliotecarioToken = res.body.body.token;
    bibliotecarioId = res.body.body.usuario.id;
    return bibliotecarioToken;
  }

  throw new Error(`No se pudo obtener token de bibliotecario: ${res.status} - ${JSON.stringify(res.body)}`);
}

// Funciones getter para IDs (para asegurar que ya se inició sesión)
async function getAdminId() {
  await getAdminToken();
  return adminId;
}

async function getEstudianteId() {
  await getEstudianteToken();
  return estudianteId;
}

async function getBibliotecarioId() {
  await getBibliotecarioToken();
  return bibliotecarioId;
}

/**
 * Generar una fecha futura (para evitar validaciones de fecha pasada)
 * @param {number} daysFromNow - Días a partir de hoy
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getFutureDate(daysFromNow = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

module.exports = {
  ADMIN_CREDENTIALS,
  ESTUDIANTE_CREDENTIALS,
  BIBLIOTECARIO_CREDENTIALS,
  getAdminToken,
  getEstudianteToken,
  getBibliotecarioToken,
  getAdminId,
  getEstudianteId,
  getBibliotecarioId,
  getFutureDate,
};

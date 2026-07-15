/**
 * Pruebas de API — Módulo Autenticación
 * IDs según tests/docs/Matriz_Casos_Prueba.md (diseño: Maye, automatización base para Pizaro)
 *
 * Requiere la BD Oracle levantada; la app se carga in-process (no hace falta
 * tener el servidor corriendo aparte).
 */
const request = require('supertest');
const app = require('../../src/app');

const USUARIO_SEED = 'maye@unmsm.edu.pe'; // usuario del seed (oracle/setup/05_seed.sql), contraseña "123"

describe('Autenticación — POST /auth/login', () => {

  test('CP-AU-01: login válido devuelve 200 y token JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ identificador: USUARIO_SEED, password: '123' });

    expect(res.status).toBe(200);
    expect(res.body.error).toBe(false);
    expect(res.body.body.token).toBeDefined();
    expect(res.body.body.usuario.correo).toBe(USUARIO_SEED);
  });

  test('CP-AU-02: login con contraseña incorrecta devuelve 401 sin token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ identificador: USUARIO_SEED, password: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain('token');
  });

});

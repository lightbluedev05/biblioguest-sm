/**
 * ⚠️ CASO QUE FALLA A PROPÓSITO — SOLO PARA LA DEMO EN VIVO ⚠️
 *
 * Este archivo NO forma parte de la suite oficial (npm test solo corre tests/api).
 * Se ejecuta con:  npm run test:demo-fallo
 *
 * Simula el error clásico: el "desarrollador" asumió que un login con contraseña
 * incorrecta devuelve 200. La prueba falla en ROJO y demuestra al jurado que la
 * suite sí detecta comportamientos erróneos.
 */
const request = require('supertest');
const app = require('../../src/app');

describe('DEMO — fallo intencional', () => {

  test('CP-AU-02 (versión rota a propósito): espera 200 ante contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ identificador: 'maye@unmsm.edu.pe', password: 'incorrecta' });

    // Asersión deliberadamente equivocada: el backend (correctamente) devuelve 401.
    expect(res.status).toBe(200);
  });

});

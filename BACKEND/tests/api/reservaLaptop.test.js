/**
 * Pruebas de API — Módulo Reserva de Laptop
 * IDs según tests/docs/Matriz_Casos_Prueba.md
 *
 * CP-RL-03 valida end-to-end la lógica de fn_reserva_solapa_laptop
 * (oracle/setup/03_storeObjects.sql:46) — ver análisis de caja blanca.
 *
 * Nota: POST/DELETE /reservaLaptop requieren token JWT (auth.requireAuth).
 */
const request = require('supertest');
const app = require('../../src/app');

// Fecha futura fija para no chocar con datos reales del día
const FECHA = '2026-12-01';

describe('Reserva de Laptop — POST /reservaLaptop', () => {
  let token;
  let idUsuario;
  let idLaptop;
  let idReservaBase = null;

  beforeAll(async () => {
    // Usuario del seed con contraseña conocida
    const login = await request(app)
      .post('/auth/login')
      .send({ identificador: 'maye@unmsm.edu.pe', password: '123' });
    token = login.body.body.token;
    idUsuario = login.body.body.usuario.id;

    // Cualquier laptop que no esté dada de baja
    const laptops = await request(app)
      .get('/laptop')
      .set('Authorization', `Bearer ${token}`);
    const cuerpo = laptops.body.body;
    const lista = cuerpo.data || cuerpo;
    const laptop = lista.find(l => (l.ESTADO || l.estado) !== 'baja');
    idLaptop = laptop.ID_LAPTOP || laptop.id_laptop || laptop.id;

    // Reserva base 09:00-11:00. Si quedó una activa de una corrida anterior,
    // el 400 por solape también nos sirve como "reserva existente".
    const base = await request(app)
      .post('/reservaLaptop')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idUsuario, idLaptop, fecha: FECHA,
        horaInicio: '09:00', horaFin: '11:00', idBibliotecario: null,
      });
    if (base.status === 201) {
      const b = base.body.body;
      idReservaBase = b.ID_RESERVA || b.id_reserva || b.idReserva || b;
    }
  });

  afterAll(async () => {
    // Limpieza: cancelar la reserva creada por esta corrida
    if (idReservaBase) {
      await request(app)
        .delete(`/reservaLaptop/${idReservaBase}`)
        .set('Authorization', `Bearer ${token}`);
    }
  });

  test('CP-RL-03: reservar la misma laptop en franja solapada devuelve 400 con mensaje de solape', async () => {
    const res = await request(app)
      .post('/reservaLaptop')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idUsuario, idLaptop, fecha: FECHA,
        horaInicio: '10:00', horaFin: '12:00', idBibliotecario: null,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
    expect(String(res.body.body)).toMatch(/solapada|solapa/i);
  });

});

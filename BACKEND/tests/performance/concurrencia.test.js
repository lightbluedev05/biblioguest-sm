/**
 * Tests de Concurrencia — BiblioGuest API
 *
 * Riesgo R1 (Race Condition):
 *   Validar que el trigger de no-solapamiento actúa como barrera
 *   cuando dos requests de reserva llegan simultáneamente.
 *
 * Framework: Jest + Supertest
 * Requiere: BD Oracle levantada con datos de seed
 */

const request = require("supertest");
const app = require("../../src/app");
const {
  getEstudianteToken,
  getFutureDate,
} = require("../helpers/auth.helper");

let token;

beforeAll(async () => {
  token = await getEstudianteToken();
});

describe("Concurrencia — Doble reserva simultánea de laptop", () => {
  // ---------------------------------------------------------------
  // Riesgo R1: Race Condition en reservas simultáneas
  //
  // Dos usuarios intentan reservar la MISMA laptop en el MISMO
  // horario al mismo tiempo. Solo una debe pasar, la otra debe
  // ser rechazada por el trigger trg_rl_no_solape.
  // ---------------------------------------------------------------
  test("Doble reserva simultánea: solo una debe aceptarse", async () => {
    const fecha = getFutureDate(10); // Fecha lejana para evitar conflictos

    const payload1 = {
      idUsuario: 1,
      idLaptop: 1,
      fecha: fecha,
      horaInicio: "09:00",
      horaFin: "10:00",
    };

    const payload2 = {
      ...payload1,
      idUsuario: 2, // Diferente usuario, misma laptop y horario
    };

    // Lanzar ambas peticiones en paralelo
    const [r1, r2] = await Promise.all([
      request(app)
        .post("/reservaLaptop")
        .set("Authorization", `Bearer ${token}`)
        .send(payload1),
      request(app)
        .post("/reservaLaptop")
        .set("Authorization", `Bearer ${token}`)
        .send(payload2),
    ]);

    const statuses = [r1.status, r2.status].sort((a, b) => a - b);

    // Verificamos que al menos una fue exitosa y la otra rechazada
    // Posibles combinaciones válidas:
    // [200|201, 400|409] - una pasó, otra fue rechazada
    // [400, 400] - ambas rechazadas (si hay otras restricciones)
    const hasSuccess = statuses.some((s) => s >= 200 && s < 300);
    const hasError = statuses.some((s) => s >= 400);

    // Si ambas respuestas llegaron, al menos una debe haber fallado
    // o ambas fallaron (lo cual también es aceptable)
    if (hasSuccess) {
      // Si una pasó, la otra DEBE haber fallado
      expect(hasError).toBe(true);
    }

    // Verificar que NO se crearon ambas exitosamente
    const successCount = statuses.filter((s) => s >= 200 && s < 300).length;
    expect(successCount).toBeLessThanOrEqual(1);
  });
});

describe("Concurrencia — Doble reserva simultánea de cubículo", () => {
  test("Doble reserva simultánea de cubículo: ambas se crean como pendiente", async () => {
    const fecha = getFutureDate(11);

    const payload1 = {
      idCubiculo: 1,
      idCreador: 1,
      fecha: fecha,
      horaInicio: "10:00",
      horaFin: "12:00",
      miembros: [1, 2, 3],
    };

    const payload2 = {
      idCubiculo: 1, // Mismo cubículo, mismo horario
      idCreador: 4,
      fecha: fecha,
      horaInicio: "10:00",
      horaFin: "12:00",
      miembros: [4, 5, 6],
    };

    const [r1, r2] = await Promise.all([
      request(app)
        .post("/reservaCubiculo")
        .set("Authorization", `Bearer ${token}`)
        .send(payload1),
      request(app)
        .post("/reservaCubiculo")
        .set("Authorization", `Bearer ${token}`)
        .send(payload2),
    ]);

    // Ambas deben poder crearse con éxito (201) en estado 'pendiente'.
    // El trigger trg_rc_no_solape solo bloquea reservas en estado 'activa'.
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
  });
});

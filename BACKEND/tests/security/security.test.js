
const request = require('supertest');
const jwt = require('jsonwebtoken'); 
const app = require('../../src/app'); 

describe('Pruebas de seguridad - OWASP Top 10 (Riesgos R2, R3, R5)', () => {

  
  // CP-SEC-01, Riesgo R2 (Critico): Sin limite de intentos de login
  // Defecto relacionado: DT-05
  // OWASP: A07: 2021, Identification and Authentication Failures
  
  test('CP-SEC-01: debe limitar los intentos fallidos de login (rate limiting)', async () => {
    const credencialesInvalidas = {
      identificador: '20201234',       
      password: 'contraseñaIncorrecta'
    };

    const respuestas = [];

   
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/auth/login')
        .send(credencialesInvalidas);
      respuestas.push(res.status);
    }

    const huboBloqueo = respuestas.some(status => status === 429);

    
    expect(huboBloqueo).toBe(true);
  });

  
  // CP-SEC-02, Riesgo R5 (Critico): /auth/setup publico y activo en produccion
  // Defecto relacionado: DT-04
  // OWASP: A01:2021, Broken Access Control

  test('CP-SEC-02: /auth/setup debe rechazar creación si ya existe un administrador', async () => {
    const nuevoAdmin = {
      nombre: 'Admin Falso',
      correo: `admin-test-${Date.now()}@unmsm.edu.pe`,
      password: 'ClaveInsegura123'
    };

    const respuesta = await request(app)
      .post('/auth/setup')
      .send(nuevoAdmin);

    
    expect(respuesta.status).toBe(403);
  });

  
  // CP-SEC-03, Riesgo R3 (Critico): JWT secret hardcodeado inseguro
  // Defecto relacionado: DT-02
  // OWASP: A02:2021, Cryptographic Failures

  test('CP-SEC-03: un token firmado con el secreto por defecto NO debe ser aceptado', async () => {
    
    const secretoInseguroConocido = 'biblioguest-secret-key-change-in-production';

    
    const tokenFalso = jwt.sign(
      { id: 999, rol: 'administrador', correo: 'atacante@fake.com' },
      secretoInseguroConocido,
      { expiresIn: '1h' }
    );

    
    const respuesta = await request(app)
      .get('/sancion') 
      .set('Authorization', `Bearer ${tokenFalso}`);

    
    expect(respuesta.status).toBe(401);
  });

});

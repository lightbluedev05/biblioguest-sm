# Pruebas — BiblioGuest

> **Estado:** base creada por **Maye** (diseño de casos + primeras pruebas automatizadas, julio 2026).
> **Pizaro:** lee la sección [Para Pizaro](#para-pizaro-automatización) 👇 — aquí está todo lo que necesitas para continuar.

## Estructura

| Carpeta | Contenido | Responsable |
|---------|-----------|-------------|
| `api/` | Pruebas funcionales de API (Jest + Supertest) — **3 ya funcionando en verde** | Pizaro (base de Maye) |
| `demo/` | Caso que falla a propósito para la demo en vivo (excluido de `npm test`) | Maye |
| `e2e/` | Pruebas de interfaz (Playwright/Cypress) — pendiente | Maye |
| `performance/` | Concurrencia doble reserva, Riesgo R1 (k6 o Jest) — pendiente | Pizaro |
| `security/` | Casos negativos de seguridad — pendiente | Arroyo |
| `docs/` | **Matriz de 60 casos**, análisis de caja blanca y guion de la demo | Maye |

## Cómo correr (verificado el 2026-07-15 ✅)

```bash
cd BACKEND
npm install              # instala jest y supertest (ya están en devDependencies)
npm run dev              # levanta el backend (los tests cargan la app in-process,
                         #  pero la BD sí debe estar corriendo)
npm test                 # suite oficial (tests/api) → 3 passed, en VERDE
npm run test:demo-fallo  # caso intencionalmente roto para la demo → en ROJO
```

Resultado real de la última corrida:

```
Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total          (CP-AU-01, CP-AU-02, CP-RL-03)
```

## Requisitos del entorno

- **BD Oracle** con el esquema de `oracle/setup/` (scripts 01→07, en orden) y el seed cargado.
  - Con Docker: `docker compose up -d` desde la raíz del repo (usa `bd-oracle-xe-21` como host).
  - Con Oracle XE nativo en Windows: ejecutar los scripts como `sqlplus / as sysdba`, creando antes el usuario `BG_OWNER` (en Docker lo crea el contenedor automáticamente). Los scripts no traen `EXIT` al final: pasarles `EXIT` por stdin o cerrarlos a mano.
- **`BACKEND/.env`**: si la BD es local nativa, `ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1`; si es Docker, `bd-oracle-xe-21:1521/XEPDB1`.
- **Usuario de prueba del seed** (`oracle/setup/05_seed.sql`): `maye@unmsm.edu.pe` — contraseña `123` (todos los usuarios del seed usan `123`).

## Para Pizaro (automatización)

1. **La matriz completa está en `docs/Matriz_Casos_Prueba.md`** — 53 casos de API + 7 de caja blanca, todos con ID trazable. Traduce cada caso a código manteniendo el ID en el nombre: `test('CP-AU-03: login con identificador no registrado', ...)`. Los marcados 🔜 son directamente automatizables; los ✅ ya están hechos como ejemplo (`api/auth.test.js`, `api/reservaLaptop.test.js`).
2. **Patrón a seguir** (míralo en `api/reservaLaptop.test.js`): la app se carga in-process con `supertest(app)` — no hace falta servidor aparte; login primero para obtener el token (`POST /reservaLaptop` exige `Authorization: Bearer <token>`); limpieza en `afterAll` (cancelar reservas creadas).
3. **GitHub Actions**: crear `.github/workflows/tests.yml` que levante Oracle (imagen `gvenzl/oracle-xe:21` como service container, igual que el docker-compose) y corra `npm test`. El check en verde es la captura para tu slide 5.
4. **Concurrencia (CP-RL-12, Riesgo R1)**: en `performance/`, dos `POST /reservaLaptop` simultáneos con `Promise.all` sobre la misma franja — solo uno debe devolver 201.
5. **Ojo con estas discrepancias detectadas** (detalle en la matriz, sección ⚠️): el backend devuelve **400** donde el diseño original esperaba 403/409, el login usa el campo **`identificador`** (no `correo`), y las reglas de duración máxima 4h / límite de 2 reservas activas **no están implementadas** — no escribas tests que las asuman como ya funcionando.
6. **Demo en vivo**: el guion completo (comandos + narración de Maye + plan B + video de respaldo) está en `docs/Guion_Demo.md`.

Los nombres de los tests usan los IDs de `docs/Matriz_Casos_Prueba.md`
(ej. `CP-AU-01`) para trazabilidad entre diseño y automatización.

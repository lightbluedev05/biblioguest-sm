# Guion de la Demo en Vivo (Pizaro + Maye) — 2-3 min máx.

> Pizaro maneja la terminal · Maye narra · Si el jurado avisa que queda poco tiempo → **saltar al Plan B**.

## Preparación (ANTES de exponer — checklist)

- [ ] BD Oracle corriendo y backend probado ese mismo día (`npm test` en verde).
- [ ] Terminal abierta en `BACKEND/` con letra grande y tema de alto contraste.
- [ ] Video de respaldo listo y abierto en pestaña aparte (ver §Video).
- [ ] Capturas del `npm test` en verde y del test rojo dentro del PPT (Plan B).
- [ ] Cronometrar el ensayo: si pasa de 3 min, recortar a solo capturas.

## Secuencia en vivo

### Paso 1 — Caso que PASA (~60 seg)

**Pizaro ejecuta:**
```bash
cd BACKEND
npm test
```

**Maye narra (mientras corre):**
> "Estamos ejecutando la suite automatizada con Jest y Supertest. El caso CP-AU-01
> hace login real contra la API con credenciales válidas y verifica que devuelva
> el token JWT; el CP-AU-02 comprueba que una contraseña incorrecta se rechace con
> 401; y el CP-RL-03 valida que el sistema no permita reservar una laptop en una
> franja ya ocupada — la regla de negocio más crítica del sistema."

**Resultado esperado en pantalla:** `3 passed` en **verde**. ✅

### Paso 2 — Caso que FALLA a propósito (~45 seg)

**Pizaro ejecuta:**
```bash
npm run test:demo-fallo
```

**Maye narra:**
> "Ahora simulamos el error de un desarrollador que asume que un login inválido
> devuelve 200. La suite lo detecta de inmediato: la prueba falla en rojo mostrando
> exactamente qué se esperaba y qué devolvió el sistema. Así es como estas pruebas
> nos protegen ante regresiones en cada cambio."

**Resultado esperado en pantalla:** `1 failed` en **rojo**, con el diff `Expected: 200 / Received: 401`. ❌ (¡esto es lo correcto!)

### Cierre (~15 seg) — Maye:
> "Estas mismas pruebas corren automáticamente en cada push mediante GitHub Actions,
> como mostró Pizaro en la slide de automatización."

## Plan B — sin ejecución en vivo (si falta tiempo o falla el entorno)

1. Mostrar la **captura del `npm test` en verde** (en el PPT).
2. Mostrar la **captura del test rojo** con el diff Expected/Received.
3. Maye dice las mismas 2 frases de narración, señalando las capturas.
4. Si preguntan por el pipeline: mostrar captura del check verde de GitHub Actions.

## Video de respaldo (60-90 seg) — cómo grabarlo

1. Abrir terminal en `BACKEND/` (fuente grande, pantalla limpia).
2. Grabar con la herramienta de recorte de Windows (Win+Shift+R) o OBS:
   - `npm test` → esperar el verde (≈30 s).
   - `npm run test:demo-fallo` → esperar el rojo (≈20 s).
   - Zoom final al diff `Expected: 200 / Received: 401` (≈10 s).
3. Guardarlo en el celular Y en el USB además de la laptop.

## Datos que usa la demo (por si el jurado pregunta)

| Dato | Valor | Origen |
|------|-------|--------|
| Usuario de prueba | `maye@unmsm.edu.pe` / contraseña `123` | Seed oficial `oracle/setup/05_seed.sql` |
| Endpoint bajo prueba | `POST /auth/login`, `POST /reservaLaptop` | `ApiDocs.md` |
| Regla validada en CP-RL-03 | `fn_reserva_solapa_laptop` (caja blanca en `docs/`) | `oracle/setup/03_storeObjects.sql:46` |

# 🎤 Qué expongo en la demo — Chuleta de Maye

> Duración total: **2-3 min máx.** Pizaro teclea, tú hablas. Si el jurado avisa tiempo → Plan B (capturas).

## Antes de salir al frente (5 min antes)

- [ ] Terminal abierta en `BACKEND/`, fuente grande.
- [ ] Verificar UNA vez que `npm test` sale verde (si no: Plan B directo, sin pelear con el entorno).
- [ ] Video de respaldo a la mano (celular + USB + laptop).

## Momento 1 — Caso que PASA (~60 seg)

**Pizaro escribe:** `npm test`

**Tú dices (mientras corre):**

> "Ejecutamos nuestra suite automatizada con Jest y Supertest. Son tres casos de la matriz:
> **CP-AU-01** hace un login real contra la API y verifica que devuelva el token JWT;
> **CP-AU-02** comprueba que una contraseña incorrecta se rechace con error 401;
> y **CP-RL-03** intenta reservar una laptop en un horario ya ocupado y verifica que el
> sistema lo impida — esa es la regla de negocio más crítica: evitar la doble reserva."

**En pantalla debe verse:** `Tests: 3 passed` en verde ✅ → señalarlo.

## Momento 2 — Caso que FALLA a propósito (~45 seg)

**Pizaro escribe:** `npm run test:demo-fallo`

**Tú dices:**

> "Ahora simulamos el error de un desarrollador que asume que un login inválido devuelve
> código 200. La suite lo detecta al instante: la prueba falla en rojo y muestra exactamente
> qué se esperaba y qué devolvió el sistema. Así estas pruebas nos protegen contra
> regresiones en cada cambio del código."

**En pantalla debe verse:** `Expected: 200 / Received: 401` en rojo ❌ → señalar el diff.

## Cierre (1 frase)

> "Estas mismas pruebas corren automáticamente con cada push mediante GitHub Actions,
> como mostró Pizaro en su slide."

## Plan B (sin ejecutar nada)

Mostrar las 2 capturas del PPT (suite verde + test rojo) y decir las mismas frases señalándolas. Si ni eso: video de respaldo.

## Si el jurado pregunta… (respuestas de 1 frase)

| Pregunta probable | Tu respuesta |
|---|---|
| ¿Por qué muestran una prueba que falla? | "Para demostrar que la suite detecta errores reales: una suite que nunca falla no prueba nada." |
| ¿Cuántos casos diseñaron? | "60 en total: 53 de API en 10 módulos y 7 de caja blanca sobre la función de solapamiento; están en la matriz del repo." |
| ¿Qué es el caso de caja blanca? | "Analizamos el código de `fn_reserva_solapa_laptop` en PL/SQL: complejidad ciclomática 8, y diseñamos casos por cobertura de decisión — incluido el caso límite de franjas contiguas, que solo se descubre leyendo el código." |
| ¿Encontraron defectos? | "Sí: la API devuelve 400 donde debería diferenciar 403/409, y dos reglas de negocio del diseño (duración máxima y límite de reservas) no están implementadas — están reportadas en la sección de defectos." |
| ¿Contra qué base de datos corren? | "Oracle XE con el esquema real del proyecto y datos de seed; las pruebas crean y limpian sus propios datos." |

## Datos técnicos por si acaso

- Usuario de la demo: `maye@unmsm.edu.pe` / `123` (seed oficial).
- Herramientas: **Jest** (runner y aserciones) + **Supertest** (peticiones HTTP a la app Express in-process).
- Trazabilidad: cada test lleva el ID de la matriz (`CP-AU-01` ↔ `docs/Matriz_Casos_Prueba.md`).

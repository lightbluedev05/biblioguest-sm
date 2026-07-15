# Matriz Completa de Casos de Prueba — BiblioGuest

> **Responsable:** Maye · **Para automatizar:** Pizarro (traducir cada ID a `test('CP-XX-NN: ...', ...)` en Jest + Supertest)
> **Base:** `3_Diseno_Casos_Prueba_BiblioGuest.docx` (21 casos, 6 módulos) **verificada y corregida contra el backend real** (`BACKEND/src` + `ApiDocs.md` + `oracle/setup/03_storeObjects.sql`), y **completada** con los módulos restantes de ApiDocs.

## Convenciones

- **Formato de respuesta real del backend:** `{ "error": bool, "status": n, "body": ... }` (ver `src/util/respuestas.js`).
- **Códigos reales:** crear recurso exitoso → **201**; errores de negocio de Oracle (`ORA-20xxx`) llegan como **400** con el mensaje del procedimiento (los controladores no distinguen 403/409 — ver *Discrepancias*).
- **Prioridad** según el criterio del informe: primero **seguridad**, luego **lógica de negocio**, al final **interfaz** (alineado a ISTQB / ISO 29119).
- **Auto**: ✅ ya automatizado en `tests/api/` · 🔜 automatizable por Pizaro · ✋ manual/BD.

## ⚠️ Discrepancias detectadas al verificar el diseño original contra el código

Estos hallazgos salieron de contrastar el docx original con el backend real — **son parte del valor del trabajo de pruebas** (reportar a Arroyo como defectos/observaciones):

| # | Discrepancia | Detalle |
|---|--------------|---------|
| D1 | El docx esperaba **403** para usuario sancionado y **409** para solape; el backend real responde **400** en ambos (el controlador `reservaLaptop_controller.js:21` mapea todo error a 400) | Defecto menor de diseño de API: códigos HTTP no diferenciados |
| D2 | El docx esperaba validación de **duración máxima 4h (laptop) / 2h (cubículo)**; `pr_reservar_laptop` **no valida duración máxima** | Regla de negocio no implementada — CP-RL-04/05 quedan como *fallo esperado* hasta que se implemente |
| D3 | El docx esperaba **límite de 2 reservas activas por usuario**; no existe esa validación en el código | Regla de negocio no implementada — CP-RL-06 igual que arriba |
| D4 | El docx usaba el campo `correo` en login; el backend real usa **`identificador`** (código institucional o correo) | Corregido en esta matriz |
| D5 | El docx usaba rutas `/api/laptops/available`; las reales son `/reservaLaptop/disponibilidad` y `/laptop?estado=disponible` | Corregido en esta matriz |
| D6 | Inconsistencias internas entre `fn_reserva_solapa_laptop` y `fn_reserva_solapa_cubiculo` (mayúsculas del estado, ROLLBACK) | Ver `Caja_Blanca_fn_reserva_solapa_laptop.md` §5 |

---

## Módulo 1: Autenticación (`/auth`) — Prioridad del módulo: ALTA (seguridad)

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-AU-01 | Login exitoso con credenciales válidas | `POST /auth/login` · `identificador: maye@unmsm.edu.pe`, `password: 123` (usuario del seed) | 200 · `body.token` JWT + `body.usuario` con rol | Partición de equivalencia | Alta | ✅ |
| CP-AU-02 | Login con contraseña incorrecta | `identificador: maye@unmsm.edu.pe`, `password: incorrecta` | 401 · "Credenciales inválidas" · sin token | Partición de equivalencia | Alta | ✅ |
| CP-AU-03 | Login con identificador no registrado | `identificador: fantasma@unmsm.edu.pe`, `password: 123` | 401 · "Credenciales inválidas" | Partición de equivalencia | Alta | 🔜 |
| CP-AU-04 | Login con campo vacío | `identificador: ""`, `password: 123` | 400 · mensaje de campos requeridos | Valores límite | Media | 🔜 |
| CP-AU-05 | Acceso a endpoint protegido sin token | `GET /auth/me` sin header `Authorization` | 401 · "Token de acceso no proporcionado" | Partición de equivalencia | Alta | 🔜 |
| CP-AU-06 | Acceso con token corrupto/expirado | `GET /auth/me` con `Bearer abc123` | 401 · "Token inválido o expirado" | Partición de equivalencia | Alta | 🔜 |
| CP-AU-07 | Registro de bibliotecario con rol estudiante | `POST /auth/registro/bibliotecario` con token de estudiante | 403 · rol insuficiente | Tabla de decisión | Alta | 🔜 |

## Módulo 2: Reserva de Laptop (`/reservaLaptop`) — ALTA (lógica de negocio crítica, Riesgo R1)

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-RL-01 | Reserva exitosa (usuario activo, laptop libre) | `POST /reservaLaptop` · `idUsuario, idLaptop, fecha, horaInicio: "09:00", horaFin: "11:00"` | **201** · reserva con estado `activa` e `id_reserva` | Partición de equivalencia | Alta | 🔜 |
| CP-RL-02 | Reserva con usuario sancionado | idUsuario con sanción activa | **400** · "ORA-20007: Usuario con sanción activa" *(docx decía 403 → D1)* | Tabla de decisión | Alta | 🔜 |
| CP-RL-03 | Reserva con solape de horario | misma laptop/fecha ya reservada 09:00–11:00; pedir 10:00–12:00 | **400** · mensaje "Franja solapada con otra reserva activa" *(docx decía 409 → D1)* | Partición de equivalencia | Alta | ✅ |
| CP-RL-04 | Reserva que excede duración máxima (4 h) | 08:00–13:30 | ⚠️ Esperado por negocio: rechazo · **Real: la crea (D2)** → caso documenta defecto | Valores límite | Media | 🔜 |
| CP-RL-05 | Reserva en el límite exacto (4 h) | 08:00–12:00 | 201 · reserva creada | Valores límite | Media | 🔜 |
| CP-RL-06 | Tercera reserva activa simultánea | usuario con 2 reservas activas | ⚠️ Esperado por negocio: rechazo · **Real: la crea (D3)** → caso documenta defecto | Tabla de decisión | Alta | 🔜 |
| CP-RL-07 | **Valor límite de solape:** franja contigua | laptop reservada 09:00–11:00; pedir **11:00–13:00** | **201** · NO es solape (comparadores estrictos — ver caja blanca CB-06) | Valores límite / Caja blanca | Alta | 🔜 |
| CP-RL-08 | Hora inicio ≥ hora fin | 15:00–13:00 | 400 · "ORA-20005: hora_inicio debe ser menor que hora_fin" | Valores límite | Media | 🔜 |
| CP-RL-09 | Reserva de laptop dada de baja | idLaptop en estado `baja` | 400 · "ORA-20008: Laptop dada de baja" | Tabla de decisión | Media | 🔜 |
| CP-RL-10 | Cancelar reserva activa | `DELETE /reservaLaptop/:id` (reserva activa) | 200 · estado pasa a `cancelada` | Partición de equivalencia | Media | 🔜 |
| CP-RL-11 | Cancelar reserva ya cancelada | `DELETE /reservaLaptop/:id` (ya cancelada) | 400 · "ORA-20011: Solo se pueden cancelar reservas activas" | Tabla de decisión | Media | 🔜 |
| CP-RL-12 | Concurrencia: 2 requests simultáneos por la misma franja (Riesgo R1) | 2 `POST` en paralelo, misma laptop/franja | Solo 1 crea (201); el otro 400 por solape (trigger `trg_rl_no_solape` como 2.ª barrera) | Prueba de concurrencia | Alta | 🔜 (k6/Jest — Pizaro) |

## Módulo 3: Reserva de Cubículo (`/reservaCubiculo`) — ALTA

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-RC-01 | Reserva exitosa con grupo válido (≥3 miembros aceptados) | `POST /reservaCubiculo` · grupo de 4 activos | 201 · reserva `activa`/`pendiente` según flujo | Partición de equivalencia | Alta | 🔜 |
| CP-RC-02 | Grupo con menos de 3 miembros | grupo de 2 | 400 · "ORA-20011: El grupo debe tener al menos 3 miembros aceptados" | Valores límite | Alta | 🔜 |
| CP-RC-03 | Solape de horario de cubículo | cubículo ocupado 10:00–12:00; pedir 11:00–13:00 | 400 · "Franja solapada con otra reserva activa" (ORA-20014) | Partición de equivalencia | Alta | 🔜 |
| CP-RC-04 | Flujo aceptar → confirmar → ingreso → finalizar | `POST /reservaCubiculo/:id/aceptar`, `/confirmar`, `/ingreso`, `/finalizar` | 200 en cada transición válida; 400 si la transición no corresponde al estado | Tabla de decisión (máquina de estados) | Media | 🔜 |

## Módulo 4: Préstamo de Libro (`/prestamoLibro`) — ALTA

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-PL-01 | Préstamo exitoso de ejemplar disponible | `POST /prestamoLibro` · usuario activo + ejemplar `disponible` | 201 · préstamo creado; ejemplar pasa a `prestado` (trigger `trg_prestamo_sync_ejemplar`) | Partición de equivalencia | Alta | 🔜 |
| CP-PL-02 | Préstamo de ejemplar ya prestado | ejemplar en estado `prestado` | 400 · ejemplar no disponible (ORA-20030/20002) | Tabla de decisión | Alta | 🔜 |
| CP-PL-03 | Préstamo de ejemplar deteriorado | ejemplar `deteriorado` | 400 · ejemplar no disponible | Tabla de decisión | Media | 🔜 |
| CP-PL-04 | Devolución tardía genera datos de multa | `POST /prestamoLibro/:id/devolver` con `fecha_fin` vencida | 200 · `fn_dias_atraso` > 0 y multa calculada | Caja blanca (fn_dias_atraso) | Alta | ✋ (requiere manipular fechas en BD) |
| CP-PL-05 | Préstamo por usuario sancionado | usuario con sanción activa | 400 · "ORA-20001: sanción activa" | Tabla de decisión | Alta | 🔜 |

## Módulo 5: Sanciones (`/sancion`) — ALTA (bloquea reservas)

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-SA-01 | Trigger bloquea usuario al crear sanción activa | `POST /sancion` 🔒 (bibliotecario) sobre usuario 9 | 201 · estado del usuario pasa a `sancionado` automáticamente (`trg_sancion_sync_usuario`) | Caja blanca (trigger) | Alta | 🔜 |
| CP-SA-02 | Usuario sancionado intenta reservar laptop | como CP-RL-02 | 400 · sanción activa | Tabla de decisión | Alta | 🔜 |
| CP-SA-03 | Sanción cumplida restaura al usuario | `PUT /sancion/:id` → estado `cumplida` | 200 · usuario vuelve a `activo` y puede reservar | Caja blanca (trigger) | Alta | 🔜 |
| CP-SA-04 | Estudiante consulta sanciones de otro usuario | `GET /sancion?idUsuario=X` con token de estudiante | 403 · rol insuficiente | Tabla de decisión | Alta | 🔜 |

## Módulo 6: Disponibilidad — MEDIA

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-DI-01 | Slots de laptop excluyen reservas activas | `GET /reservaLaptop/disponibilidad?fecha&horaInicioNum&duracionHoras` *(ruta real — D5)* | 200 · la franja reservada no aparece como disponible | Partición de equivalencia | Media | 🔜 |
| CP-DI-02 | Sin disponibilidad → lista vacía | todos los recursos ocupados en esa franja | 200 · lista vacía `[]` | Partición de equivalencia | Media | 🔜 |
| CP-DI-03 | Filtro por estado en laptops | `GET /laptop?estado=disponible` | 200 · solo laptops `disponible` | Partición de equivalencia | Baja | 🔜 |

## Módulo 7: Libro / Catálogo (`/libro`, `/autor`, `/categoria`, `/etiqueta`) — MEDIA *(módulo agregado — no estaba en el docx)*

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-LB-01 | Crear libro sin token | `POST /libro` 🔒 sin `Authorization` | 401 · token no proporcionado | Partición de equivalencia | Alta | 🔜 |
| CP-LB-02 | Crear libro con rol estudiante | `POST /libro` con token de estudiante | 403 · roles permitidos: bibliotecario/administrador | Tabla de decisión | Alta | 🔜 |
| CP-LB-03 | Crear libro válido (bibliotecario) | `POST /libro` con ISBN nuevo | 201 · libro creado | Partición de equivalencia | Media | 🔜 |
| CP-LB-04 | Crear libro con ISBN duplicado | mismo ISBN de CP-LB-03 | 409/500 · violación de constraint UNIQUE (ORA-00001) | Valores límite | Media | 🔜 |
| CP-LB-05 | Buscar libro por título/ISBN | `GET /libro?titulo=X` | 200 · lista filtrada | Partición de equivalencia | Baja | 🔜 |
| CP-LB-06 | Asociar autor inexistente a libro | `POST /libro/:id/autores` con idAutor inexistente | 500/400 · FK violada (ORA-02291) | Partición de equivalencia | Baja | 🔜 |
| CP-AT-01 | CRUD básico de autor | `POST/PUT/DELETE /autor` (🔒 Biblio+) | 201/200/200; 403 con rol estudiante | Partición de equivalencia | Baja | 🔜 |
| CP-CA-01 | CRUD básico de categoría | `POST/PUT/DELETE /categoria` | ídem | Partición de equivalencia | Baja | 🔜 |
| CP-ET-01 | CRUD básico de etiqueta | `POST/PUT/DELETE /etiqueta` | ídem | Partición de equivalencia | Baja | 🔜 |

## Módulo 8: Ejemplar (`/ejemplar`) — MEDIA *(agregado)*

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-EJ-01 | Crear ejemplar de libro existente | `POST /ejemplar` con idLibro válido | 201 · ejemplar `disponible` | Partición de equivalencia | Media | 🔜 |
| CP-EJ-02 | Deteriorar y restaurar ejemplar | `POST /ejemplar/:id/deteriorar` → `/restaurar` | 200 · estados `deteriorado` → `disponible` | Tabla de decisión | Media | 🔜 |
| CP-EJ-03 | Eliminar ejemplar con préstamos asociados | `DELETE /ejemplar/:id` con préstamo activo | 500 · ORA-02292 (integridad referencial) | Partición de equivalencia | Baja | 🔜 |

## Módulo 9: Recursos físicos (`/laptop`, `/cubiculo`) — MEDIA *(agregado)*

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-LT-01 | Crear laptop válida | `POST /laptop` | 201 | Partición de equivalencia | Media | 🔜 |
| CP-LT-02 | Eliminar laptop con reservas | `DELETE /laptop/:id` con reservas que la referencian | 500 · ORA-02292 (documentado en el propio modelo, `laptop_model.js:261`) | Partición de equivalencia | Baja | 🔜 |
| CP-CU-01 | Crear cubículo con capacidad inválida | `POST /cubiculo` con capacidad 0 o negativa | 400 · validación | Valores límite | Media | 🔜 |

## Módulo 10: Usuario (`/usuario`) — ALTA (privacidad) *(agregado)*

| ID | Escenario | Entradas | Resultado esperado (real) | Técnica | Prioridad | Auto |
|----|-----------|----------|---------------------------|---------|-----------|------|
| CP-US-01 | Listar usuarios sin token | `GET /usuario` 🔒 sin token | 401 | Partición de equivalencia | Alta | 🔜 |
| CP-US-02 | Estudiante lista todos los usuarios | `GET /usuario` con token de estudiante | 403 (solo Biblio+/Admin) | Tabla de decisión | Alta | 🔜 |
| CP-US-03 | Usuario consulta sus propias reservas | `GET /usuario/mis-reservas-cubiculo` con su token | 200 · solo sus reservas | Partición de equivalencia | Media | 🔜 |

## Resumen de cobertura

| Módulo | Casos | Origen | Prioridad máx. |
|--------|-------|--------|----------------|
| Autenticación | 7 | 4 del docx + 3 nuevos | Alta |
| Reserva de Laptop | 12 | 6 del docx + 6 nuevos (incl. concurrencia R1) | Alta |
| Reserva de Cubículo | 4 | 3 del docx + 1 nuevo | Alta |
| Préstamo de Libro | 5 | 3 del docx + 2 nuevos | Alta |
| Sanciones | 4 | 3 del docx + 1 nuevo | Alta |
| Disponibilidad | 3 | 2 del docx + 1 nuevo | Media |
| Libro / Catálogo | 9 | nuevos | Alta (seguridad) |
| Ejemplar | 3 | nuevos | Media |
| Laptop / Cubículo (CRUD) | 3 | nuevos | Media |
| Usuario | 3 | nuevos | Alta (privacidad) |
| **TOTAL** | **53** | 21 heredados y corregidos + 32 nuevos | — |

**Caja blanca adicional:** 7 casos CB-01…CB-07 sobre `fn_reserva_solapa_laptop`
(ver `Caja_Blanca_fn_reserva_solapa_laptop.md`) → total general **60 casos diseñados**.

### Nota para Pizaro (automatización)
- Mantener el ID en el nombre del test: `test('CP-AU-01: login válido', ...)`.
- Ya están automatizados como ejemplo: **CP-AU-01, CP-AU-02** (`tests/api/auth.test.js`) y **CP-RL-03** (`tests/api/reservaLaptop.test.js`).
- CP-RL-12 (concurrencia) va en `tests/performance/` con `Promise.all` de 2 POST o k6.
- Los casos de seguridad (CP-AU-05/06/07, CP-LB-01/02, CP-US-01/02, CP-SA-04) van en `tests/security/` — coordinar con Arroyo.

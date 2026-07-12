# 🐳 INSTRUCCIONES – Levantar EXPRESS JS y Oracle XE 21 con Docker

> **Objetivo:** iniciar la API DE EXPRESS JS y una base de datos **Oracle XE 21** en Docker, ejecutar los scripts de inicialización y conectarte desde Oracle SQL Developer.  
> **Tiempo estimado de arranque:** ⏳ ~10–15 segundos.

---

## ✅ Requisitos previos

1. Abre **Docker Desktop** y espera a que aparezca como **Running**.
2. Ubícate en la **raíz del proyecto**, al mismo nivel de:
   ```
   /BACKEND
   /FRONTEND
   /oracle
   .gitignore
   CONTRIBUTING.md
   docker-compose.yml
   ```

---

## 🔐 Crear el archivo `.env` (credenciales)

Crea un archivo **`.env`** en la **raíz** con el contenido necesario (solicitar las credenciales)

**`!!!POR NINGUN MOTIVO SUBIR AL REPO EL ARCHIVO .env , ASEGURARSE DE QUE NO ES TRACKEADO POR GIT, MEDIANTE EL .gitignore¡¡¡`**

---

## ▶️ Levantar el contenedor

1. Abre la **terminal** en VS Code:
   - Atajo: **Ctrl + Ñ** (teclado ES) o **Ctrl + `** (backtick).
   - Menú: **Ver → Terminal**.
2. Ejecuta:
   ```bash
   docker compose up -d
   ```
   Esto iniciará el contenedor (`bd-oracle-xe-21`) y el backend en EXPRESS JS y **ejecutará los scripts** ubicados en `./oracle/setup` (montados dentro del contenedor en `/container-entrypoint-initdb.d`), estos scripts cargaran todo el schema y datos necesarios **solo la primera vez**.

> ⏳ Espera **10–15 s** para que la base termine de levantar y acepte conexiones.  
> Puedes ver el progreso con:
> ```bash
> docker logs -f bd-oracle-xe-21
> ```

> Una vez iniciado puedes ver los logs del backend con:
> ```bash
> docker logs -f biblioguest-backend
> ```

---

## ⏹️ Detener / bajar el contenedor

**Por terminal (recomendado):**
```bash
docker compose stop   # detiene el contenedor
docker compose down   # detiene y desmonta recursos del stack (el volumen queda)
# ¡Cuidado! Esto borra los datos si agregas -v:
# docker compose down -v
```

**Desde Docker Desktop:**
- Ve a **Docker Desktop → Containers**.
- Selecciona el contenedor (p. ej. `bd-oracle-xe-21`) y pulsa **Stop** (■) para detenerlo.  
  También puedes **Delete** (🗑️) para eliminarlo; los datos persisten mientras no elimines el volumen.

---

## 🧪 Conectarse desde Oracle SQL Developer

Crea una **nueva conexión** con estos datos:

- **Name:** (cualquiera, ej. `BiblioGuest`)
- **Tipo de Base de Datos:** Oracle  
- **Tipo de Autenticación:** Por defecto
- **Usuario:** `BG_USER`
- **Contraseña:** la definida en el `.env` (`ORACLE_XE_BG_USER_PASSWORD`)
- **Tipo de Conexión:** Básico
- **Nombre del Host:** `localhost`
- **Puerto:** `1521`
- **Usar:** **Nombre del Servicio** (no SID)
  - ✅ **Oracle XE 21 (esta guía):** `FREEPDB1`

Guarda la conexión y conéctate. Si falla al primer intento, espera unos segundos y vuelve a intentar.

---

## 📂 Scripts de inicialización

- Los scripts estan colocados en:
  ```
  ./oracle/setup/
  ├─ 001_create_user.sql
  ├─ 002_schema.sql
  └─ 003_seed.sql
  ```
- Se ejecutan **una sola vez** (primer arranque con volumen vacío) y en **orden alfabético**.
- Para re-ejecutarlos desde cero (**borra datos**):
  ```bash
  docker compose down -v
  docker compose up -d
  ```

---

## 🧭 Notas y tips útiles

- **Logs en vivo del contenedor:**
  ```bash
  docker logs -f bd-oracle-xe-21
  ```
- **Cadena JDBC (ejemplo):**
  ```
  jdbc:oracle:thin:@//localhost:1521/XEPDB1
  ```
- **Si usas un tablespace propio (ej. `BiblioGuest`) para `BG_USER`, recuerda otorgar cuota:**
  ```sql
  -- Ejecutar como SYSTEM en XEPDB1
  ALTER USER BG_USER DEFAULT TABLESPACE BiblioGuest;
  ALTER USER BG_USER QUOTA UNLIMITED ON BiblioGuest;
  ```

---

> 🏁 Con esto podrás levantar Oracle XE 21 en Docker, cargar el esquema/seed automáticamente y conectarte desde SQL Developer sin complicaciones.

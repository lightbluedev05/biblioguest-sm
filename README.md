
# 📚 BiblioGest

Sistema integral de gestión bibliotecaria desarrollado para la Universidad Nacional Mayor de San Marcos (UNMSM). BiblioGest permite la administración eficiente de préstamos de libros, reservas de laptops y cubículos, gestión de usuarios y sanciones.

---

## 🏗️ Arquitectura del Proyecto

```
BiblioGest/
├── BACKEND/                # Servidor Node.js + Express
├── FRONTEND/               # Aplicación React con Vite
├── oracle/                 # Base de datos Oracle (scripts SQL de inicialización)
├── CONTRIBUTING.md         # Guía de contribución y flujo de trabajo
├── InstructionsDocker.md   # Instrucciones detalladas de despliegue con Docker
├── docker-compose.yml      # Configuración de Docker Compose (servicios app y DB)
└── .env                    # Variables de entorno locales (no trackeado)
```

---

## 🎨 Paleta de Colores

El proyecto utiliza la identidad visual de la UNMSM:

- **Rojo Biblio** (`#D9232D`) - Color principal
- **Dorado San Marcos** (`#E8A03E`) - Acentos y botones
- **Azul Universitario** (`#3B6C9D`) - Elementos secundarios
- **Gris Oscuro** (`#2D2D2D`) - Textos
- **Fondo Claro** (`#FFFFFF`) - Superficies
- **Fondo App** (`#F8F9FA`) - Fondo general

---

## 📁 Estructura del Backend

```
BACKEND/
├── src/
│   ├── app.js              # Configuración de Express
│   ├── index.js            # Punto de entrada del servidor
│   ├── config/
│   │   ├── config.js       # Configuración general
│   │   └── db.js           # Conexión a base de datos
│   ├── controllers/        # Lógica de negocio
│   ├── middleware/
│   │   ├── authMiddleware.js # Middleware de autenticación JWT y roles
│   │   ├── errors.js       # Manejo de errores
│   │   └── validation.js   # Validación de datos
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de la API
│   ├── services/           # Servicios de negocio
│   └── util/
│       └── respuestas.js   # Respuestas estandarizadas en español
├── package.json
└── .gitignore
```

### 🚀 Ejecutar el Backend

```bash
cd BACKEND
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

---

## 🎯 Estructura del Frontend

```
FRONTEND/
├── src/
│   ├── App.jsx                    # Componente principal y rutas
│   ├── main.jsx                   # Punto de entrada
│   ├── styles.css                 # Estilos globales con Tailwind
│   │
│   ├── Colors/
│   │   └── ColorPalette.jsx       # Paleta de colores del proyecto
│   │
│   ├── assets/                    # Archivos estáticos como imágenes y logos
│   │
│   ├── pages/                     # Vistas y componentes específicos por ruta
│   │   ├── public/                # Páginas de acceso público
│   │   │   ├── Landing/           # Página de inicio
│   │   │   │   ├── LandingPage.jsx
│   │   │   │   └── components/
│   │   │   │       └── HeroSection.jsx
│   │   │   ├── Login/             # Página de inicio de sesión
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── components/
│   │   │   │       └── LoginForm.jsx
│   │   │   └── Catalogo/          # Catálogo público de libros
│   │   │       ├── page/
│   │   │       │   └── Libros.jsx
│   │   │       └── components/
│   │   │           ├── atomos/
│   │   │           │   ├── Badge.jsx
│   │   │           │   ├── BookCover.jsx
│   │   │           │   ├── Button.jsx
│   │   │           │   └── Modal.jsx
│   │   │           ├── moleculas/
│   │   │           │   ├── ActiveReservationNotification.jsx
│   │   │           │   ├── BookCard.jsx
│   │   │           │   ├── BookDetailModal.jsx
│   │   │           │   └── FilterControls.jsx
│   │   │           └── organismos/
│   │   │               └── BookGrid.jsx
│   │   │
│   │   ├── estudiante/            # Páginas exclusivas para Estudiantes
│   │   │   ├── laptops/
│   │   │   │   ├── LaptopReservationPage.jsx
│   │   │   │   └── components/
│   │   │   │       └── ReservationTemplate.jsx
│   │   │   ├── cubiculos/
│   │   │   │   └── page/
│   │   │   │       └── Cubiculos.jsx
│   │   │   └── prestamos/
│   │   │       └── MisPrestamosPage.jsx
│   │   │
│   │   ├── bibliotecario/         # Páginas exclusivas para Bibliotecarios
│   │   │   ├── libros/
│   │   │   │   └── GestionLibros.jsx
│   │   │   ├── prestamos/
│   │   │   │   └── GestionPrestamos.jsx
│   │   │   ├── laptops/
│   │   │   │   └── GestionLaptops.jsx
│   │   │   ├── cubiculos/
│   │   │   │   └── GestionCubiculos.jsx
│   │   │   ├── reservas/
│   │   │   │   ├── GestionReservasLaptops.jsx
│   │   │   │   └── GestionReservasCubiculos.jsx
│   │   │   └── usuarios/
│   │   │       └── GestionUsuarios.jsx
│   │   │
│   │   ├── admin/                 # Páginas exclusivas para Administradores
│   │   │   ├── bibliotecarios/
│   │   │   │   └── GestionBibliotecarios.jsx
│   │   │   ├── sanciones/
│   │   │   │   └── GestionSanciones.jsx
│   │   │   └── configuracion/
│   │   │       └── Configuracion.jsx
│   │   │
│   │   ├── dashboard/             # Tableros principales
│   │   │   ├── DashboardAdmin.jsx
│   │   │   └── DashboardEstudiante.jsx
│   │   │
│   │   └── donaciones/            # Página de donaciones de libros
│   │       └── page/
│   │           └── Donaciones.jsx
│   │
│   ├── shared/                    # Recursos compartidos globalmente
│   │   ├── components/            # Componentes reutilizables comunes
│   │   │   ├── atoms/             # Componentes básicos (Alert, Button, etc.)
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── DatePicker.jsx
│   │   │   │   ├── Icon.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   └── TimePicker.jsx
│   │   │   ├── molecules/         # Componentes intermedios (Modal, SearchBar)
│   │   │   │   ├── FilterGroup.jsx
│   │   │   │   ├── LaptopCard.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── NewsCard.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── SidebarItem.jsx
│   │   │   │   └── TimeRangeSelector.jsx
│   │   │   └── organism/          # Elementos complejos (Navbar, Sidebar)
│   │   │       ├── Footer.jsx
│   │   │       ├── LaptopList.jsx
│   │   │       ├── Navbar.jsx
│   │   │       ├── NewsSection.jsx
│   │   │       ├── ReservationFilters.jsx
│   │   │       └── Sidebar.jsx
│   │   ├── layouts/               # Plantillas de diseño
│   │   │   └── MainLayout.jsx
│   │   ├── context/               # Proveedores de contexto (AuthContext.jsx)
│   │   ├── guards/                # Guardas de acceso (ProtectedRoute.jsx)
│   │   └── hooks/                 # Hooks de React personalizados (useAuth.js)
│   │
│   └── services/                  # Capa de consumo de APIs externas
│       ├── libroService.js
│       └── prestamoService.js
│
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── vite.config.js
└── vercel.json                     # Configuración para deploy en Vercel
```

### 🎨 Arquitectura del Frontend

El frontend está estructurado en base a las mejores prácticas de modularidad, con una separación clara entre vistas específicas de negocio (`pages/`) y componentes o utilidades compartidas (`shared/`). También se implementó un flujo jerárquico inspirado en Atomic Design para los componentes del catálogo y los elementos globales.

### 🚀 Ejecutar el Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`

### 📱 Rutas Disponibles

**Rutas Públicas:**
- `/` - Landing page (Página principal)
- `/login` - Página de inicio de sesión
- `/catalogo` - Catálogo público de libros
- `/donar` - Formulario de donación de libros

**Rutas de Estudiante (Requieren rol `estudiante`):**
- `/dashboard` - Panel de control del estudiante
- `/laptops` - Formulario de reserva de laptops
- `/cubiculos` - Formulario de reserva de cubículos de estudio
- `/prestamos` - Listado e historial de préstamos del estudiante

**Rutas de Gestión de Bibliotecarios (Requieren rol `bibliotecario` o `administrador`):**
- `/gestion/dashboard` - Tablero general de la biblioteca
- `/gestion/libros` - Control del inventario de libros y ejemplares
- `/gestion/prestamos` - Préstamos físicos y devoluciones
- `/gestion/laptops` - Catálogo y estados de laptops
- `/gestion/reservas/laptops` - Validación de reservas de laptops
- `/gestion/cubiculos` - Gestión de cubículos físicos
- `/gestion/reservas/cubiculos` - Validación de reservas de cubículos
- `/gestion/usuarios` - Control de estudiantes registrados

**Rutas de Administrador (Requieren rol `administrador`):**
- `/admin/dashboard` - Tablero de administración global
- `/admin/bibliotecarios` - Alta, baja y edición de cuentas de bibliotecarios
- `/admin/sanciones` - Control de penalizaciones y bloqueos
- `/admin/config` - Variables generales de la biblioteca (multas, tiempos máximos, etc.)

---

## 🗄️ Base de Datos Oracle

```
oracle/
└── setup/
    ├── 01_schema.sql        # Creación de tablas principales y constraints
    ├── 02_auth_schema.sql   # Tablas auxiliares para autenticación y roles
    ├── 03_storeObjects.sql  # Funciones, procedimientos y triggers
    ├── 04_security.sql      # Creación de roles, usuarios de conexión y sinónimos
    ├── 05_seed.sql          # Inserción de datos iniciales de prueba
    ├── 06_views.sql         # Vistas de consultas optimizadas para reportes
    └── 07_packages.sql      # Paquetes PL/SQL lógicos del dominio
```

### 📊 Esquema Principal

El sistema cuenta con las siguientes entidades principales:

- **Usuario**: Estudiantes y personal académico
- **Libro**: Catálogo bibliográfico
- **Ejemplar**: Copias físicas de libros
- **PrestamoLibro**: Registros de préstamos
- **Laptop**: Equipos disponibles para reserva
- **Cubiculo**: Espacios de estudio
- **ReservaLaptop / ReservaCubiculo**: Reservas de recursos
- **Sancion**: Control de penalizaciones
- **Biblioteca**: Sedes físicas
- **UnidadAcademica**: Facultades y escuelas
- **Autor / Categorias / Etiquetas**: Datos y taxonomías de libros
- **GrupoUsuarios**: Agrupaciones de estudiantes

### 🔧 Objetos de Base de Datos

**Funciones principales:**
- `fn_minutos()` - Convierte formato HH24:MI a minutos de transcurso diario.
- `fn_build_ts()` - Construye una marca TIMESTAMP a partir de una fecha y hora (HH24:MI).
- `fn_tiene_sancion_activa()` - Comprueba si el usuario tiene penalizaciones vigentes.
- `fn_reserva_solapa_laptop()` - Detecta solapamiento de horarios en reservas de laptops.
- `fn_reserva_solapa_cubiculo()` - Detecta solapamiento de horarios en reservas de cubículos.
- `fn_dias_atraso()` - Calcula la cantidad de días de atraso en devoluciones de libros.
- `fn_calcular_multa()` - Determina el costo de la multa en base a los días de retraso.

**Procedimientos principales:**
- `pr_crear_prestamo_libro()` - Registra la entrega de un ejemplar físico.
- `pr_cancelar_prestamo_libro()` - Permite revertir o anular un préstamo de libro.
- `pr_asignar_bibliotecario_prestamo()` - Asocia al bibliotecario que procesa la operación.
- `pr_devolver_prestamo_libro()` - Procesa la devolución y genera posibles multas.
- `pr_reservar_laptop()` - Genera un ticket de reserva de laptop.
- `pr_cancelar_reserva_laptop()` - Libera el cupo y cancela la reserva de laptop.
- `pr_reservar_cubiculo()` - Agenda el uso de un cubículo de estudio.
- `pr_cancelar_reserva_cubiculo()` - Cancela la agenda del cubículo.
- `pr_confirmar_reserva_cubiculo()` - Valida la asistencia del estudiante al cubículo.
- `pr_registrar_ingreso_reserva_cubiculo()` - Marca el inicio formal de uso.
- `pr_finalizar_reserva_cubiculo()` - Termina el préstamo del espacio.
- `PRC_HORARIOS_DISP_LAPTOP()` - Consulta la disponibilidad de horarios de laptops.

**Triggers:**
- Normalización de horas (HH24:MI)
- Prevención de solapes en reservas de laptops y cubículos
- Sincronización de estados (ejemplares, usuarios)
- Actualización automática de estados de préstamos y sanciones

### 🐳 Levantar la Base de Datos

Para levantar el stack completo (Base de datos + API Backend) mediante Docker Compose:

```bash
docker compose up -d
```

Esto iniciará Oracle XE 21c y el servidor backend de Express en una red local compartida.

**Credenciales de Conexión (Aplicación / Backend):**
- **Usuario:** `BG_CONNECT`
- **Contraseña:** `bgconnect123` (o la configurada en `ORACLE_PASSWORD` de tu `.env`)
- **Service Name:** `XEPDB1` (para Oracle XE 21c) o `FREEPDB1` (para Oracle Free 23c)

**Esquema Propietario (Administrador de DB):**
- **Usuario:** `BG_OWNER`
- **Contraseña:** (definida por `ORACLE_XE_BG_OWNER_PASSWORD` en `.env`)

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express 5.1.0**
- **Oracle Database Driver (oracledb 6.10.0)** - Cliente para interacción con la base de datos
- **jsonwebtoken 9.0.2** & **bcryptjs 2.4.3** - Firma, verificación de JWT y cifrado de contraseñas
- **Cors 2.8.5** - Habilitación de CORS
- **Dotenv 17.2.3** - Manejo de variables de entorno locales
- **Morgan 1.10.0** - Logging de peticiones HTTP
- **Nodemon 3.1.10** - Auto-reload en desarrollo

### Frontend
- **React 19.1.1**
- **Vite 7.1.7** - Build tool
- **React Router 7.9.5** - Enrutamiento
- **Tailwind CSS 4.1.15** - Estilos
- **Material-UI 7.3.5** - Componentes UI
- **Lucide React** - Iconos
- **Day.js** - Manejo de fechas

### Base de Datos
- **Oracle XE 21c**
- **Docker** para containerización

---

## 🤝 Contribuir

Lee el archivo [`CONTRIBUTING.md`](./CONTRIBUTING.md) para conocer:
- Flujo de trabajo (Git Flow)
- Convenciones de commits
- Proceso de Pull Requests
- Guías de Code Review

---

## 📦 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
ORACLE_XE_PASSWORD=tu_password_sys
ORACLE_XE_BG_USER_PASSWORD=tu_password_bg_user
```

---

## 🚀 Deploy

### Frontend (Vercel)
El proyecto incluye `vercel.json` configurado para SPA routing.

```bash
npm run build
vercel --prod
```

### Backend
Configurar servidor Node.js con PM2 o similar.

---

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso de Base de Datos de la UNMSM.

---

**Universidad Nacional Mayor de San Marcos** 🇵🇪  
*Decana de América*

# INTEGRANTES
- Mihael Jhire Cristobal Rojas
- Miguel Alonso Solis Cunza
- Carol Sofia Montes Ramos
- Ricardo Jose Matamoros Laura
- Luis Arroyo Tapia

# 📚 BiblioGest

Sistema integral de gestión bibliotecaria desarrollado para la Universidad Nacional Mayor de San Marcos (UNMSM). BiblioGest permite la administración eficiente de préstamos de libros, reservas de laptops y cubículos, gestión de usuarios y sanciones.

> 🎥 **Video de Exposición**: El enlace al video de la presentación del proyecto se encuentra en el archivo [`EnlaceVideo.txt`](./1.ENTREGA_FINAL/EnlaceVideo.txt) en la raíz del repositorio.

> 🎥 **Entrega Final - ConsultoraFisi**: El entregable final con todos nuestros scripts y los modelos necesarios para el diseño de nuestra base de datos. [`EntregaFinal - Consultora FISI`](<./1.ENTREGA_FINAL/EntregaFinal - Consultora FISI/>)

---

## 🏗️ Arquitectura del Proyecto

```
BiblioGest/
├── BACKEND/              # Servidor Node.js + Express
├── FRONTEND/             # Aplicación React con Vite
├── oracle/               # Base de datos Oracle
└── CONTRIBUTING.md       # Guía de contribución
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
│   │   ├── errors.js       # Manejo de errores
│   │   └── validation.js   # Validación de datos
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de la API
│   ├── services/           # Servicios de negocio
│   └── util/
│       └── answers.js      # Respuestas estandarizadas
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
│   ├── globals/                   # Componentes compartidos
│   │   ├── components/
│   │   │   ├── atoms/            # Componentes básicos
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── DatePicker.jsx
│   │   │   │   ├── Icon.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   └── TimePicker.jsx
│   │   │   │
│   │   │   ├── molecules/        # Componentes compuestos
│   │   │   │   ├── FilterGroup.jsx
│   │   │   │   ├── LaptopCard.jsx
│   │   │   │   ├── NewsCard.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── SidebarItem.jsx
│   │   │   │   └── TimeRangeSelector.jsx
│   │   │   │
│   │   │   └── organism/         # Componentes complejos
│   │   │       ├── Footer.jsx
│   │   │       ├── LaptopList.jsx
│   │   │       ├── Navbar.jsx
│   │   │       ├── NewsSection.jsx
│   │   │       ├── ReservationFilters.jsx
│   │   │       └── Sidebar.jsx
│   │   │
│   │   └── layaout/
│   │       └── MainLayout.jsx     # Layout principal con sidebar
│   │
│   ├── modules/                   # Módulos de funcionalidad
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── components/
│   │   │       └── LoginForm.jsx
│   │   │
│   │   ├── landing/
│   │   │   ├── LandingPage.jsx
│   │   │   └── components/
│   │   │       └── HeroSection.jsx
│   │   │
│   │   ├── libros/
│   │   │   ├── page/
│   │   │   │   └── Libros.jsx
│   │   │   └── components/
│   │   │       ├── atomos/
│   │   │       │   ├── Badge.jsx
│   │   │       │   ├── BookCover.jsx
│   │   │       │   ├── Button.jsx
│   │   │       │   └── Modal.jsx
│   │   │       ├── moleculas/
│   │   │       │   ├── ActiveReservationNotification.jsx
│   │   │       │   ├── BookCard.jsx
│   │   │       │   └── FilterControls.jsx
│   │   │       └── organismos/
│   │   │           └── BookGrid.jsx
│   │   │
│   │   └── reservation/
│   │       ├── LaptopReservationPage.jsx
│   │       └── components/
│   │           └── ReservationTemplate.jsx
│   │
│   └── Colors/
│       └── ColorPalette.jsx       # Paleta de colores del proyecto
│
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── vite.config.js
└── vercel.json                     # Configuración para deploy en Vercel
```

### 🎨 Arquitectura Atomic Design

El frontend sigue el patrón **Atomic Design**:

- **Atoms** (Átomos): Componentes básicos reutilizables (botones, inputs, badges)
- **Molecules** (Moléculas): Grupos de átomos que forman componentes funcionales
- **Organisms** (Organismos): Secciones completas de la interfaz
- **Templates** (Plantillas): Layouts que estructuran las páginas
- **Pages** (Páginas): Vistas completas con datos reales

### 🚀 Ejecutar el Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`

### 📱 Rutas Disponibles

- `/` - Landing page
- `/login` - Página de inicio de sesión
- `/laptop` - Reserva de laptops
- `/libro` - Catálogo de libros

---

## 🗄️ Base de Datos Oracle

```
oracle/
├── setup/
│   ├── 01_schema.sql        # Creación de tablas y constraints
│   ├── 02_storeObjects.sql  # Funciones, procedimientos y triggers
│   └── 03_seed.sql          # Datos de prueba
└── INSTRUCTIONS.md
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

### 🔧 Objetos de Base de Datos

**Funciones principales:**
- `fn_minutos()` - Convierte formato HH24:MI a minutos
- `fn_tiene_sancion_activa()` - Verifica sanciones del usuario
- `fn_reserva_solapa_laptop()` - Detecta conflictos de horarios
- `fn_dias_atraso()` - Calcula días de retraso en devoluciones
- `fn_calcular_multa()` - Calcula multas por retraso

**Procedimientos principales:**
- `pr_crear_prestamo_libro()` - Registra préstamos
- `pr_devolver_prestamo_libro()` - Procesa devoluciones
- `pr_reservar_laptop()` - Gestiona reservas de laptops
- `pr_reservar_cubiculo()` - Gestiona reservas de cubículos

**Triggers:**
- Normalización de horas (HH24:MI)
- Prevención de solapes en reservas
- Sincronización de estados (ejemplares, usuarios)
- Actualización automática de estados de préstamos

### 🐳 Levantar la Base de Datos

```bash
docker-compose up -d
```

Esto iniciará Oracle XE 21c en el puerto 1521.

**Credenciales:**
- Usuario: `BG_USER`
- Password: (definida en variables de entorno)
- SID: `XEPDB1`

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express 5.1.0**
- **Morgan** - Logging de peticiones HTTP
- **Nodemon** - Auto-reload en desarrollo

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

## 👥 Equipo de Desarrollo

- **Mihael Cristobal** - Full Stack Developer
- **Ricardo Matamoros** - Backend Developer  
- **Miguel Solis** - Frontend Developer
- **Luis Arroyo** - Full Stack Developer
- **Carol Montes** - Frontend Developer

---

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso de Base de Datos de la UNMSM.

---

## 📞 Contacto

Para consultas sobre el proyecto:
- Email: biblioteca@unmsm.edu.pe
- Teléfono: +51 1 619-7000

---

**Universidad Nacional Mayor de San Marcos** 🇵🇪  
*Decana de América*

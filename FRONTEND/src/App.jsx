import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ColorPalette from "./Colors/ColorPalette";

// Layouts
import { MainLayout } from "./shared/layouts/MainLayout";

// Guards
import { ProtectedRoute } from "./shared/guards/ProtectedRoute";

// Páginas públicas
import LandingPage from "./pages/public/Landing/LandingPage";
import LoginPage from "./pages/public/Login/LoginPage";
import LibrosPage from "./pages/public/Catalogo/page/Libros";

// Páginas de estudiante
import LaptopReservationPage from "./pages/estudiante/laptops/LaptopReservationPage";
import Cubiculos from "./pages/estudiante/cubiculos/page/Cubiculos";
import MisPrestamosPage from "./pages/estudiante/prestamos/MisPrestamosPage";

// Páginas de bibliotecario/admin
import GestionLibros from "./pages/bibliotecario/libros/GestionLibros";
import GestionPrestamos from "./pages/bibliotecario/prestamos/GestionPrestamos";
import GestionLaptops from "./pages/bibliotecario/laptops/GestionLaptops";
import GestionReservasLaptops from "./pages/bibliotecario/reservas/GestionReservasLaptops";
import GestionCubiculos from "./pages/bibliotecario/cubiculos/GestionCubiculos";
import GestionReservasCubiculos from "./pages/bibliotecario/reservas/GestionReservasCubiculos";
import GestionUsuarios from "./pages/bibliotecario/usuarios/GestionUsuarios";
import GestionBibliotecarios from "./pages/admin/bibliotecarios/GestionBibliotecarios";
import GestionSanciones from "./pages/admin/sanciones/GestionSanciones";
import Configuracion from "./pages/admin/configuracion/Configuracion";

// Dashboards
import DashboardAdmin from "./pages/dashboard/DashboardAdmin";
import DashboardEstudiante from "./pages/dashboard/DashboardEstudiante";

// Otras páginas
import Donaciones from "./pages/donaciones/page/Donaciones";

import "./styles.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Catálogo público (dentro de MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/catalogo" element={<LibrosPage />} />
          <Route path="/donar" element={<Donaciones />} />
        </Route>

        {/* Rutas de estudiante (requieren autenticación) */}
        <Route element={<ProtectedRoute roles={['estudiante']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardEstudiante />} />
            <Route path="/laptops" element={<LaptopReservationPage />} />
            <Route path="/cubiculos" element={<Cubiculos />} />
            <Route path="/prestamos" element={<MisPrestamosPage />} />
          </Route>
        </Route>

        {/* Rutas de bibliotecario (biblio + admin) */}
        <Route element={<ProtectedRoute roles={['bibliotecario', 'administrador']} />}>
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path="/gestion/dashboard" element={<DashboardAdmin />} />
            {/* Libros */}
            <Route path="/gestion/libros" element={<GestionLibros />} />
            <Route path="/gestion/prestamos" element={<GestionPrestamos />} />
            {/* Laptops */}
            <Route path="/gestion/laptops" element={<GestionLaptops />} />
            <Route path="/gestion/reservas/laptops" element={<GestionReservasLaptops />} />
            {/* Cubículos */}
            <Route path="/gestion/cubiculos" element={<GestionCubiculos />} />
            <Route path="/gestion/reservas/cubiculos" element={<GestionReservasCubiculos />} />
            {/* Usuarios */}
            <Route path="/gestion/usuarios" element={<GestionUsuarios />} />
          </Route>
        </Route>

        {/* Rutas de admin (solo admin) */}
        <Route element={<ProtectedRoute roles={['administrador']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/bibliotecarios" element={<GestionBibliotecarios />} />
            <Route path="/admin/sanciones" element={<GestionSanciones />} />
            <Route path="/admin/config" element={<Configuracion />} />
          </Route>
        </Route>

        {/* Redirigir rutas antiguas a nuevas */}
        <Route path="/laptop" element={<Navigate to="/laptops" replace />} />
        <Route path="/libro" element={<Navigate to="/catalogo" replace />} />
        <Route path="/cubiculo" element={<Navigate to="/cubiculos" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

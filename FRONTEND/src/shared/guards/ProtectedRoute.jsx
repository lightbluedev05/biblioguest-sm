import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente para proteger rutas basado en autenticación y roles
 * 
 * @param {Object} props
 * @param {string[]} [props.roles] - Roles permitidos para acceder a la ruta
 * @param {string} [props.redirectTo] - Ruta a la que redirigir si no tiene acceso
 * 
 * @example
 * // Solo autenticados
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/perfil" element={<MiPerfil />} />
 * </Route>
 * 
 * // Solo admin
 * <Route element={<ProtectedRoute roles={['administrador']} />}>
 *   <Route path="/admin/*" element={<AdminPanel />} />
 * </Route>
 * 
 * // Biblio o admin
 * <Route element={<ProtectedRoute roles={['bibliotecario', 'administrador']} />}>
 *   <Route path="/gestion/*" element={<GestionPanel />} />
 * </Route>
 */
export const ProtectedRoute = ({ roles, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, usuario, tieneRol } = useAuth();
  const location = useLocation();

  // Mientras carga, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si se especificaron roles, verificar que el usuario tenga uno de ellos
  if (roles && roles.length > 0) {
    // Admin tiene acceso a todo
    if (usuario.rol === 'administrador') {
      return <Outlet />;
    }

    // Verificar si tiene alguno de los roles permitidos
    if (!tieneRol(roles)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta sección.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Roles requeridos: {roles.join(', ')}
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  // Usuario autenticado y con permisos: mostrar contenido
  return <Outlet />;
};

export default ProtectedRoute;

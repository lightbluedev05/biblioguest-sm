import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * 
 * @returns {Object} Objeto con:
 *   - usuario: datos del usuario autenticado
 *   - token: JWT token
 *   - isLoading: true mientras carga el estado inicial
 *   - isAuthenticated: true si hay sesión activa
 *   - login: función para iniciar sesión
 *   - logout: función para cerrar sesión
 *   - tieneRol: función para verificar roles
 * 
 * @example
 * const { usuario, login, logout, tieneRol } = useAuth();
 * 
 * // Verificar rol
 * if (tieneRol(['administrador'])) {
 *   // Mostrar opciones de admin
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};

export default useAuth;

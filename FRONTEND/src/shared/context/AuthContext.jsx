import { createContext, useState, useEffect, useCallback } from 'react';

// Crear el contexto
export const AuthContext = createContext(null);

// URL base del API (ajustar según entorno)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar token de localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');
    
    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = useCallback(async (identificador, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador, password }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.body || 'Error al iniciar sesión');
      }

      // Guardar en estado y localStorage
      setToken(data.body.token);
      setUsuario(data.body.usuario);
      localStorage.setItem('token', data.body.token);
      localStorage.setItem('usuario', JSON.stringify(data.body.usuario));

      return { success: true, usuario: data.body.usuario };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }, []);

  // Verificar si el usuario tiene un rol específico
  const tieneRol = useCallback((rolesPermitidos) => {
    if (!usuario) return false;
    return rolesPermitidos.includes(usuario.rol);
  }, [usuario]);

  // Verificar si está autenticado
  const isAuthenticated = !!token && !!usuario;

  // Valor del contexto
  const value = {
    usuario,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    tieneRol,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';
import Input from "../../../../shared/components/atoms/Input"; 
import Button from "../../../../shared/components/atoms/Button"; 

function LoginForm() { 
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir a la página anterior o al inicio
  const from = location.state?.from?.pathname || '/catalogo';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(identificador, password);

    if (result.success) {
      // Redirigir según el rol
      const rol = result.usuario.rol;
      if (rol === 'administrador') {
        navigate('/admin/bibliotecarios');
      } else if (rol === 'bibliotecario') {
        navigate('/gestion/prestamos');
      } else if (rol === 'estudiante') {
        navigate('/catalogo');
      } else {
        navigate(from);
      }
    } else {
      setError(result.error || 'Credenciales inválidas');
    }

    setIsLoading(false);
  };

  return ( 
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-surface/30 to-surface/10 backdrop-blur-sm p-10 rounded-2xl shadow-2xl max-w-md w-full space-y-6 border border-surface/30">
      {/* Logo y título */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-white rounded-full p-3 shadow-lg ring-4 ring-primary/20">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/UNMSM_coatofarms_seal.svg/960px-UNMSM_coatofarms_seal.svg.png" 
              alt="UNMSM" 
              className="w-full h-full object-contain"
            />  
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-purple-50"> 
            Biblioguest
          </h2>
          <p className="text-sm text-neutral/60 mt-1">
            Sistema de Biblioteca UNMSM
          </p>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="space-y-5 pt-4">
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <Input 
            label="Correo o Código Institucional" 
            placeholder="usuario@unmsm.edu.pe o código" 
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            required
          /> 
        </div>
        
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <Input 
            label="Contraseña" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /> 
        </div>

        {/* Recordar contraseña */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-surface/50 text-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <span className="text-neutral/70 group-hover:text-neutral transition-colors">
              Recordarme
            </span>
          </label>
          
          <a 
            href="#" 
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      {/* Botón de ingreso */}
      <div className="pt-2">
        <Button 
          type="submit"
          variant="primary" 
          className="w-full transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar al Sistema'}
        </Button>
      </div>
    </form> 
  ); 
} 

export default LoginForm;
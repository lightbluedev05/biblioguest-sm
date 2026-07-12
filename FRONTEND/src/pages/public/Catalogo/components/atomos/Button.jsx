export const Button = ({ onClick, children, variant = 'secondary', disabled = false, className = '' }) => {
  const baseStyle = 'px-4 py-2 font-bold text-white rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    // Dorado San Marcos (para acciones positivas como "Reservar")
    secondary: 'bg-[#E8A03E] hover:bg-yellow-600 focus:ring-[#E8A03E]',
    // Azul Universitario (para acciones neutras o de cancelación)
    accent: 'bg-[#3B6C9D] hover:bg-blue-800 focus:ring-[#3B6C9D]',
    // Rojo Biblio (para alertas o acciones destructivas)
    primary: 'bg-[#D9232D] hover:bg-red-700 focus:ring-[#D9232D]',
    // Botón deshabilitado
    disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none hover:scale-100',
  };

  const style = disabled ? variants.disabled : variants[variant];

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${style} ${className}`}>
      {children}
    </button>
  );
};
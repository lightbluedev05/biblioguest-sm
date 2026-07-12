import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="shadow-md sticky top-0 z-50">
      <nav className="bg-primary text-white px-6 py-6 relative flex items-center">
        {/* === Logo / Nombre === */}
        <div className="text-surface font-extrabold text-2xl tracking-wide">
          BiblioGuest
        </div>

        {/* === Enlaces de navegación === */}
        <div className="hidden md:flex gap-6 text-base font-medium absolute left-1/2 -translate-x-1/2">
          <Link
            to="/"
            className="hover:text-secondary transition-colors duration-200"
          >
            Inicio
          </Link>
          <a
            href="#catalogo"
            className="hover:text-secondary transition-colors duration-200"
          >
            Catálogo
          </a>
          <a
            href="#perfil"
            className="hover:text-secondary transition-colors duration-200"
          >
            Mi Perfil
          </a>
        </div>

        {/* === Botón de inicio de sesión === */}
        <div className="text-base font-medium absolute right-8">
          <Link
            to="/login"
            className="hover:text-secondary transition-colors duration-200"
          >
            Iniciar Sesión
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

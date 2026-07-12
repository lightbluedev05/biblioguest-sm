

    function Footer() {
    return (
        <footer className="bg-neutral text-surface py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Sobre Nosotros */}
            <div>
            <h3 className="font-extrabold text-xl mb-3 text-secondary">
                BiblioGuest
            </h3>
            <p className="text-sm text-surface/70 leading-relaxed">
                Plataforma universitaria para acceder a libros, reservas, noticias y
                recursos académicos desde cualquier lugar.
            </p>
            </div>

            {/* Navegación */}
            <div>
            <h4 className="font-bold text-lg mb-3">Navegación</h4>
            <ul className="space-y-2 text-sm text-surface/80">
                <li><a href="#" className="hover:text-secondary">Inicio</a></li>
                <li><a href="#" className="hover:text-secondary">Catálogo</a></li>
                <li><a href="#" className="hover:text-secondary">Mi Perfil</a></li>
                <li><a href="#" className="hover:text-secondary">Noticias</a></li>
            </ul>
            </div>

            {/* Contacto */}
            <div>
            <h4 className="font-bold text-lg mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-surface/80">
                <li><a href="#" className="hover:text-secondary">biblioteca@universidad.edu.pe</a></li>
                <li><span>(01) 555-1234</span></li>
                <li><span>Av. Universitaria 123 - Lima</span></li>
                <li><span>Perú 🇵🇪</span></li>
            </ul>
            </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-surface/50 text-sm mt-10">
            © {new Date().getFullYear()} BiblioGuest. Todos los derechos reservados.
        </div>
        </footer>
    );
    }

    export default Footer;

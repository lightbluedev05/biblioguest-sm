import { useState, useEffect } from "react";

function ColorCard({ name, className }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${className.replace("bg-", "color-")}`)
      .trim();
    await navigator.clipboard.writeText(color);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      <div className={`h-32 w-full ${className} rounded-t-xl`} />
      <div className="p-4 text-center">
        <h3 className="font-bold text-neutral">{name}</h3>
        <button
          onClick={handleCopy}
          className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md py-1 transition"
        >
          {copied ? "¡Copiado!" : "Copiar HEX"}
        </button>
      </div>
    </div>
  );
}

export default function ColorPalette() {
  return (
    <div className="min-h-screen bg-background text-neutral p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">🎨 Paleta de Colores</h1>
        <p className="text-accent font-medium">BiblioGuest — UNMSM</p>
      </header>

      {/* MUESTRAS */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Muestras</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <ColorCard name="Rojo Biblio" className="bg-primary" />
          <ColorCard name="Dorado San Marcos" className="bg-secondary" />
          <ColorCard name="Azul Universitario" className="bg-accent" />
          <ColorCard name="Gris Oscuro" className="bg-neutral" />
          <ColorCard name="Fondo Claro" className="bg-surface" />
          <ColorCard name="Fondo App" className="bg-background" />
        </div>
      </section>

      {/* EJEMPLOS DE USO */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Ejemplos de Uso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Botón principal */}
          <div className="bg-surface p-6 rounded-xl shadow flex flex-col items-center">
            <h3 className="font-bold mb-4 text-neutral">Botón Principal</h3>
            <button className="bg-secondary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition">
              Reservar Libro
            </button>
          </div>

          {/* Alerta */}
          <div className="bg-surface p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 text-neutral">Alerta</h3>
            <div className="border-l-4 border-secondary bg-secondary/10 text-secondary p-4 rounded-r-lg">
              <p className="font-semibold">¡Importante!</p>
              <p className="text-sm">Tu préstamo vence en 3 días.</p>
            </div>
          </div>

          {/* Tarjeta */}
          <div className="bg-surface p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 text-neutral">Tarjeta de Libro</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-primary font-bold">Cien Años de Soledad</h4>
              <p className="text-neutral text-sm mt-1">
                Disponible en el 2do piso.
              </p>
            </div>
          </div>

          {/* Navbar */}
          <div className="md:col-span-2 lg:col-span-3 bg-surface p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 text-center text-neutral">
              Cabecera / Navbar
            </h3>
            <nav className="bg-primary text-white p-4 rounded-lg flex justify-between items-center">
              <div className="text-surface font-bold text-xl">BiblioGuest</div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-secondary transition">
                  Inicio
                </a>
                <a href="#" className="hover:text-secondary transition">
                  Catálogo
                </a>
                <a href="#" className="hover:text-secondary transition">
                  Mi Perfil
                </a>
              </div>
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, Book, User, Tag, Calendar, Building2, Hash, Layers, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '../atomos/Button';
import { Badge } from '../atomos/Badge';
import { getLibroDetalle, getEjemplaresLibro, mapLibroDetalleToFrontend, solicitarPrestamo } from '../../../../../services/libroService';

/**
 * Modal para mostrar detalles completos de un libro
 * Incluye autores, categorías, etiquetas y opción de préstamo
 */
export const BookDetailModal = ({
  show,
  onClose,
  bookId,
  isAuthenticated = false,
  usuario = null,
  token = null
}) => {
  const [bookDetail, setBookDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para préstamo
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanDates, setLoanDates] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanMessage, setLoanMessage] = useState({ type: '', text: '' });

  // Cargar detalle del libro cuando se abre el modal
  useEffect(() => {
    if (show && bookId) {
      loadBookDetail();
    }
  }, [show, bookId]);

  const loadBookDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Cargar detalle del libro (ahora incluye ejemplaresDisponibles)
      const detalleResponse = await getLibroDetalle(bookId);
      const libro = mapLibroDetalleToFrontend(detalleResponse.body || detalleResponse);
      setBookDetail(libro);
    } catch (err) {
      console.error('Error cargando detalle:', err);
      setError('No se pudo cargar la información del libro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoanSubmit = async () => {
    if (!loanDates.fechaInicio || !loanDates.fechaFin) {
      setLoanMessage({ type: 'error', text: 'Por favor selecciona las fechas de préstamo' });
      return;
    }

    if (!bookDetail || bookDetail.ejemplaresDisponibles === 0) {
      setLoanMessage({ type: 'error', text: 'No hay ejemplares disponibles para préstamo' });
      return;
    }

    setIsSubmitting(true);
    setLoanMessage({ type: '', text: '' });

    try {
      // Obtener ejemplares reales del backend para tener el ID
      const ejemplaresResponse = await getEjemplaresLibro(bookId);
      const ejemplaresData = ejemplaresResponse.body?.data || ejemplaresResponse.body || [];
      const ejemplaresDisponibles = Array.isArray(ejemplaresData) ? ejemplaresData : [];

      if (ejemplaresDisponibles.length === 0) {
        throw new Error('No hay ejemplares disponibles en este momento');
      }

      // Usar el primer ejemplar disponible
      const ejemplar = ejemplaresDisponibles[0];
      const idEjemplar = ejemplar.ID_EJEMPLAR || ejemplar.idEjemplar;
      const idUsuario = usuario?.idUsuario || usuario?.id;

      if (!idUsuario) {
        throw new Error('Debes iniciar sesión para solicitar un préstamo');
      }

      if (!idEjemplar) {
        throw new Error('No se pudo obtener el ID del ejemplar');
      }

      await solicitarPrestamo({
        idUsuario,
        idEjemplar,
        fechaInicio: loanDates.fechaInicio,
        fechaFin: loanDates.fechaFin
      }, token);

      setLoanMessage({ type: 'success', text: '¡Préstamo solicitado exitosamente! Acércate a la biblioteca para recoger el libro.' });
      setShowLoanForm(false);

      // Recargar detalles
      loadBookDetail();
    } catch (err) {
      setLoanMessage({ type: 'error', text: err.message || 'Error al solicitar el préstamo' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-[#D9232D] to-[#8B1A1A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={28} />
            <h2 className="text-xl font-bold">Detalle del Libro</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-[#D9232D] mb-4" />
              <p className="text-gray-600">Cargando información del libro...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Book size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-red-600">{error}</p>
              <Button variant="secondary" onClick={loadBookDetail} className="mt-4">
                Reintentar
              </Button>
            </div>
          ) : bookDetail ? (
            <div className="space-y-6">
              {/* Título y Subtítulo */}
              <div>
                <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{bookDetail.titulo}</h3>
                {bookDetail.subtitulo && (
                  <p className="text-lg text-gray-600 italic">{bookDetail.subtitulo}</p>
                )}
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                {bookDetail.isbn && (
                  <div className="flex items-center gap-3">
                    <Hash size={20} className="text-[#3B6C9D]" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">ISBN</p>
                      <p className="font-medium text-[#2D2D2D]">{bookDetail.isbn}</p>
                    </div>
                  </div>
                )}

                {bookDetail.editorial && (
                  <div className="flex items-center gap-3">
                    <Building2 size={20} className="text-[#3B6C9D]" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Editorial</p>
                      <p className="font-medium text-[#2D2D2D]">{bookDetail.editorial}</p>
                    </div>
                  </div>
                )}

                {bookDetail.edicion && (
                  <div className="flex items-center gap-3">
                    <Layers size={20} className="text-[#3B6C9D]" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Edición</p>
                      <p className="font-medium text-[#2D2D2D]">{bookDetail.edicion}ª Edición</p>
                    </div>
                  </div>
                )}

                {bookDetail.anio && (
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-[#3B6C9D]" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Año</p>
                      <p className="font-medium text-[#2D2D2D]">{bookDetail.anio}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Autores */}
              {bookDetail.autores && bookDetail.autores.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User size={20} className="text-[#E8A03E]" />
                    <h4 className="font-semibold text-[#2D2D2D]">Autores</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bookDetail.autores.map((autor, idx) => (
                      <span
                        key={autor.id || idx}
                        className="px-3 py-1.5 bg-[#E8A03E]/10 text-[#B8860B] rounded-full text-sm font-medium border border-[#E8A03E]/30"
                      >
                        {autor.nombreCompleto || `${autor.nombre} ${autor.apellido}`}
                        {autor.nacionalidad && <span className="text-xs ml-1 opacity-70">({autor.nacionalidad})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorías */}
              {bookDetail.categorias && bookDetail.categorias.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Book size={20} className="text-[#3B6C9D]" />
                    <h4 className="font-semibold text-[#2D2D2D]">Categorías</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bookDetail.categorias.map((cat, idx) => (
                      <span
                        key={cat.id || idx}
                        className="px-3 py-1.5 bg-[#3B6C9D]/10 text-[#3B6C9D] rounded-full text-sm font-medium border border-[#3B6C9D]/30"
                      >
                        {cat.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Etiquetas */}
              {bookDetail.etiquetas && bookDetail.etiquetas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={20} className="text-[#6B8E23]" />
                    <h4 className="font-semibold text-[#2D2D2D]">Etiquetas</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bookDetail.etiquetas.map((etiqueta, idx) => (
                      <Badge
                        key={etiqueta.id || idx}
                        className="bg-[#6B8E23]/10 text-[#6B8E23] border border-[#6B8E23]/30"
                      >
                        {etiqueta.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Disponibilidad */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#2D2D2D]">Disponibilidad</p>
                    <p className="text-sm text-gray-600">
                      {bookDetail.ejemplaresDisponibles > 0
                        ? `${bookDetail.ejemplaresDisponibles} ejemplar${bookDetail.ejemplaresDisponibles > 1 ? 'es' : ''} disponible${bookDetail.ejemplaresDisponibles > 1 ? 's' : ''}`
                        : 'No hay ejemplares disponibles actualmente'
                      }
                      {bookDetail.totalEjemplares > 0 && (
                        <span className="text-gray-400 ml-1">
                          (Total: {bookDetail.totalEjemplares})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${bookDetail.ejemplaresDisponibles > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>

              {/* Mensaje de préstamo */}
              {loanMessage.text && (
                <div className={`p-4 rounded-lg ${loanMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {loanMessage.text}
                </div>
              )}

              {/* Formulario de préstamo */}
              {showLoanForm && isAuthenticated && bookDetail?.ejemplaresDisponibles > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-[#2D2D2D]">Solicitar Préstamo</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        value={loanDates.fechaInicio}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setLoanDates({ ...loanDates, fechaInicio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8A03E] focus:border-[#E8A03E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de devolución
                      </label>
                      <input
                        type="date"
                        value={loanDates.fechaFin}
                        min={loanDates.fechaInicio || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setLoanDates({ ...loanDates, fechaFin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8A03E] focus:border-[#E8A03E]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleLoanSubmit}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Procesando...' : 'Confirmar Préstamo'}
                    </Button>
                    <Button
                      variant="accent"
                      onClick={() => setShowLoanForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="p-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
          {isAuthenticated && bookDetail?.ejemplaresDisponibles > 0 && !showLoanForm && !loanMessage.text && (
            <Button variant="secondary" onClick={() => setShowLoanForm(true)}>
              Solicitar Préstamo
            </Button>
          )}
          <Button variant="accent" onClick={onClose}>
            Cerrar
          </Button>
        </footer>
      </div>
    </div>
  );
};

import { useState, useEffect, useContext } from 'react';
import { BookOpen, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Loader2, RefreshCw, Eye, X } from 'lucide-react';
import { AuthContext } from '../../../shared/context/AuthContext';
import { getMisPrestamos, cancelarPrestamo, mapPrestamoToFrontend, formatDate, getPrestamoDetalle } from '../../../services/prestamoService';

/**
 * Página "Mis Préstamos" para estudiantes
 * Muestra los préstamos activos, historial y permite cancelar préstamos pendientes
 */
export default function MisPrestamosPage() {
  const { usuario, token, isAuthenticated } = useContext(AuthContext) || {};

  const [prestamos, setPrestamos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Modal de detalle
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  // Estados de acción
  const [actionLoading, setActionLoading] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (isAuthenticated && usuario) {
      loadPrestamos();
    }
  }, [isAuthenticated, usuario]);

  const loadPrestamos = async () => {
    if (!usuario?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const idUsuario = usuario.id;
      const response = await getMisPrestamos(idUsuario, { limit: 50 }, token);
      const rawPrestamos = response.body?.data || response.body || [];

      const mapped = (Array.isArray(rawPrestamos) ? rawPrestamos : [])
        .map(mapPrestamoToFrontend);

      setPrestamos(mapped);
    } catch (err) {
      console.error('Error cargando préstamos:', err);
      setError('No se pudieron cargar tus préstamos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerDetalle = async (prestamo) => {
    setDetalleLoading(true);
    setSelectedPrestamo(prestamo);

    try {
      const response = await getPrestamoDetalle(prestamo.id);
      const detalle = response.body || response;
      setSelectedPrestamo(mapPrestamoToFrontend(detalle));
    } catch (err) {
      console.error('Error cargando detalle:', err);
      // Mantener el préstamo básico
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleCancelar = async (prestamo) => {
    if (!confirm(`¿Estás seguro de cancelar este préstamo?`)) return;

    setActionLoading(prestamo.id);
    setMensaje({ tipo: '', texto: '' });

    try {
      await cancelarPrestamo(prestamo.id, token);
      setMensaje({ tipo: 'success', texto: 'Préstamo cancelado exitosamente' });
      loadPrestamos(); // Recargar lista
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al cancelar el préstamo' });
    } finally {
      setActionLoading(null);
    }
  };

  // Filtrar préstamos
  const prestamosFiltrados = prestamos.filter(p => {
    if (filtroEstado === 'todos') return true;
    return p.estado?.toLowerCase() === filtroEstado;
  });

  // Contadores por estado
  const contadores = {
    activos: prestamos.filter(p => p.estado?.toLowerCase() === 'activo').length,
    atrasados: prestamos.filter(p => p.estado?.toLowerCase() === 'atrasado').length,
    finalizados: prestamos.filter(p => p.estado?.toLowerCase() === 'finalizado').length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión</h2>
          <p className="text-gray-600">Debes iniciar sesión para ver tus préstamos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Mis Préstamos</h1>
            <p className="text-lg text-gray-600">
              Gestiona tus préstamos de libros de la biblioteca
            </p>
          </div>
          <button
            onClick={loadPrestamos}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </header>

      {/* Mensaje de acción */}
      {mensaje.texto && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${mensaje.tipo === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
          {mensaje.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje({ tipo: '', texto: '' })}
            className="ml-auto hover:opacity-70"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider">Activos</p>
              <p className="text-3xl font-bold text-blue-600">{contadores.activos}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider">Atrasados</p>
              <p className="text-3xl font-bold text-red-600">{contadores.atrasados}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider">Devueltos</p>
              <p className="text-3xl font-bold text-green-600">{contadores.finalizados}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'todos', label: 'Todos', count: prestamos.length },
            { value: 'activo', label: 'Activos', count: contadores.activos },
            { value: 'atrasado', label: 'Atrasados', count: contadores.atrasados },
            { value: 'finalizado', label: 'Devueltos', count: contadores.finalizados }
          ].map(filtro => (
            <button
              key={filtro.value}
              onClick={() => setFiltroEstado(filtro.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === filtro.value
                  ? 'bg-[#D9232D] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {filtro.label} ({filtro.count})
            </button>
          ))}
        </div>
      </div>

      {/* Lista de préstamos */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={48} className="animate-spin text-[#D9232D] mb-4" />
          <p className="text-lg text-gray-600">Cargando tus préstamos...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPrestamos}
            className="px-6 py-2 bg-[#D9232D] text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : prestamosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filtroEstado === 'todos'
              ? 'No tienes préstamos'
              : `No tienes préstamos ${filtroEstado === 'activo' ? 'activos' : filtroEstado === 'atrasado' ? 'atrasados' : 'devueltos'}`
            }
          </h3>
          <p className="text-gray-500">
            Visita el catálogo para solicitar un libro
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prestamosFiltrados.map(prestamo => (
            <div
              key={prestamo.id}
              className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info del préstamo */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${prestamo.estadoColor}`}>
                        {prestamo.estadoLabel}
                      </span>
                      <span className="text-sm text-gray-500">
                        #{prestamo.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#2D2D2D] mb-1">
                      {prestamo.libro?.titulo || `Ejemplar #${prestamo.idEjemplar}`}
                    </h3>

                    {prestamo.ejemplar?.codigoBarra && (
                      <p className="text-sm text-gray-500 mb-2">
                        Código: {prestamo.ejemplar.codigoBarra}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} className="text-gray-400" />
                        <span>Inicio: {formatDate(prestamo.fechaInicio)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-400" />
                        <span>Fin: {formatDate(prestamo.fechaFin)}</span>
                      </div>
                      {prestamo.fechaDevolucion && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Devuelto: {formatDate(prestamo.fechaDevolucion)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerDetalle(prestamo)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3B6C9D] text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <Eye size={18} />
                      Ver Detalle
                    </button>

                    {prestamo.estado?.toLowerCase() === 'activo' && !prestamo.idBibliotecario && (
                      <button
                        onClick={() => handleCancelar(prestamo)}
                        disabled={actionLoading === prestamo.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === prestamo.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <XCircle size={18} />
                        )}
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedPrestamo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedPrestamo(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="bg-gradient-to-r from-[#3B6C9D] to-[#2D5A8E] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen size={28} />
                <h2 className="text-xl font-bold">Detalle del Préstamo</h2>
              </div>
              <button
                onClick={() => setSelectedPrestamo(null)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={24} />
              </button>
            </header>

            <div className="p-6 space-y-4">
              {detalleLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-[#3B6C9D]" />
                </div>
              ) : (
                <>
                  {/* Estado */}
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedPrestamo.estadoColor}`}>
                      {selectedPrestamo.estadoLabel}
                    </span>
                    <span className="text-gray-500">Préstamo #{selectedPrestamo.id}</span>
                  </div>

                  {/* Libro */}
                  {selectedPrestamo.libro && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Libro</p>
                      <p className="text-lg font-semibold text-[#2D2D2D]">{selectedPrestamo.libro.titulo}</p>
                      {selectedPrestamo.libro.isbn && (
                        <p className="text-sm text-gray-600 mt-1">ISBN: {selectedPrestamo.libro.isbn}</p>
                      )}
                    </div>
                  )}

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Fecha de inicio</p>
                      <p className="font-medium">{formatDate(selectedPrestamo.fechaInicio)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de fin</p>
                      <p className="font-medium">{formatDate(selectedPrestamo.fechaFin)}</p>
                    </div>
                    {selectedPrestamo.fechaSolicitud && (
                      <div>
                        <p className="text-sm text-gray-500">Fecha de solicitud</p>
                        <p className="font-medium">{formatDate(selectedPrestamo.fechaSolicitud)}</p>
                      </div>
                    )}
                    {selectedPrestamo.fechaDevolucion && (
                      <div>
                        <p className="text-sm text-gray-500">Fecha de devolución</p>
                        <p className="font-medium text-green-600">{formatDate(selectedPrestamo.fechaDevolucion)}</p>
                      </div>
                    )}
                  </div>

                  {/* Ejemplar */}
                  {selectedPrestamo.ejemplar?.codigoBarra && (
                    <div>
                      <p className="text-sm text-gray-500">Código del ejemplar</p>
                      <p className="font-mono font-medium">{selectedPrestamo.ejemplar.codigoBarra}</p>
                    </div>
                  )}

                  {/* Info adicional */}
                  {selectedPrestamo.idBibliotecario && (
                    <div className="bg-green-50 rounded-lg p-3 text-green-800 text-sm">
                      <CheckCircle size={16} className="inline mr-2" />
                      Libro entregado por bibliotecario
                    </div>
                  )}
                </>
              )}
            </div>

            <footer className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
              <button
                onClick={() => setSelectedPrestamo(null)}
                className="px-6 py-2 bg-[#3B6C9D] text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

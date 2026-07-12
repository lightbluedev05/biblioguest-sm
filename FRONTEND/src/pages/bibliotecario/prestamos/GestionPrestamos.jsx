import { useState, useEffect } from 'react';
import { Search, Plus, Eye, X, BookOpen, AlertCircle, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';

// URL base del API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Badge de estado
const EstadoBadge = ({ estado }) => {
  const estilos = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    activo: 'bg-blue-100 text-blue-800',
    finalizado: 'bg-green-100 text-green-800',
    finalizado_tardio: 'bg-orange-100 text-orange-800',
    atrasado: 'bg-red-100 text-red-800',
    cancelado: 'bg-gray-100 text-gray-800',
  };

  const etiquetas = {
    pendiente: 'Pendiente',
    activo: 'Activo',
    finalizado: 'Finalizado',
    finalizado_tardio: 'Devuelto con Atraso',
    atrasado: 'Atrasado',
    cancelado: 'Cancelado',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estilos[estado] || 'bg-gray-100 text-gray-800'}`}>
      {etiquetas[estado] || estado}
    </span>
  );
};

// Modal reutilizable
const Modal = ({ show, onClose, title, children, size = 'md' }) => {
  if (!show) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function GestionPrestamos() {
  const { token } = useAuth();

  // Estados
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  // Estados de modales
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  
  // Estado para modal de confirmación
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Estado para mensajes de error/éxito
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estados del formulario nuevo préstamo
  const [formData, setFormData] = useState({
    idUsuario: '',
    idEjemplar: '',
    fechaInicio: '',
    fechaFin: ''
  });

  // Función para normalizar campos de MAYÚSCULAS (Oracle) a camelCase
  const normalizarPrestamo = (p) => ({
    idPrestamo: p.ID_PRESTAMO || p.idPrestamo,
    idUsuario: p.ID_USUARIO || p.idUsuario,
    nombreUsuario: p.NOMBRE_USUARIO || p.nombreUsuario,
    codigoInstitucional: p.CODIGO_INSTITUCIONAL || p.codigoInstitucional,
    idBibliotecario: p.ID_BIBLIOTECARIO || p.idBibliotecario,
    nombreBibliotecario: p.NOMBRE_BIBLIOTECARIO || p.nombreBibliotecario,
    idEjemplar: p.ID_EJEMPLAR || p.idEjemplar,
    idLibro: p.ID_LIBRO || p.idLibro,
    tituloLibro: p.TITULO_LIBRO || p.tituloLibro,
    isbn: p.ISBN || p.isbn,
    estado: (p.ESTADO || p.estado || '').toLowerCase(),
    fechaInicio: p.FECHA_INICIO || p.fechaInicio,
    fechaFin: p.FECHA_FIN || p.fechaFin,
    fechaDevolucionReal: p.FECHA_DEVOLUCION_REAL || p.fechaDevolucionReal,
    diasAtraso: p.DIAS_ATRASO || p.diasAtraso || 0
  });

  // Cargar préstamos
  useEffect(() => {
    cargarPrestamos();
  }, [filtroEstado]);

  const cargarPrestamos = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      
      const response = await fetch(`${API_URL}/prestamoLibro?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      console.log('📋 Respuesta API préstamos:', { status: response.status, data });
      
      if (!data.error && data.body) {
        const prestamosRaw = Array.isArray(data.body.data) ? data.body.data : 
                            Array.isArray(data.body) ? data.body : [];
        const prestamosData = prestamosRaw.map(normalizarPrestamo);
        console.log('📋 Préstamos normalizados:', prestamosData);
        setPrestamos(prestamosData);
      } else {
        setError(data.body || 'Error al cargar préstamos');
        setPrestamos([]);
      }
    } catch (err) {
      setError('Error al cargar préstamos');
      setPrestamos([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar préstamos por búsqueda (proteger contra valores no-array)
  const prestamosFiltrados = Array.isArray(prestamos) ? prestamos.filter(p =>
    p.nombreUsuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.tituloLibro?.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.idPrestamo).includes(busqueda)
  ) : [];

  // Handlers
  const handleVerDetalle = async (prestamo) => {
    try {
      const response = await fetch(`${API_URL}/prestamoLibro/${prestamo.idPrestamo}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('📄 Detalle préstamo raw:', data);
      if (!data.error && data.body) {
        const detalleNormalizado = normalizarPrestamo(data.body);
        console.log('📄 Detalle normalizado:', detalleNormalizado);
        setPrestamoSeleccionado(detalleNormalizado);
        setModalDetalleOpen(true);
      }
    } catch (err) {
      alert('Error al cargar detalle');
    }
  };

  const handleCrearPrestamo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/prestamoLibro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!data.error) {
        setModalNuevoOpen(false);
        setFormData({ idUsuario: '', idEjemplar: '', fechaInicio: '', fechaFin: '' });
        setMensaje({ tipo: 'exito', texto: 'Préstamo creado exitosamente' });
        cargarPrestamos();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al crear préstamo' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al crear préstamo' });
    }
  };

  // Función para mostrar modal de confirmación
  const mostrarConfirmacion = (mensaje, accion) => {
    setConfirmMessage(mensaje);
    setConfirmAction(() => accion);
    setModalConfirmOpen(true);
  };

  // Ejecutar acción confirmada
  const ejecutarAccionConfirmada = async () => {
    setModalConfirmOpen(false);
    if (confirmAction) {
      await confirmAction();
    }
  };

  const handleEntregarPrestamo = async (idPrestamo) => {
    try {
      const response = await fetch(`${API_URL}/prestamoLibro/${idPrestamo}/entregar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      if (!data.error) {
        setModalDetalleOpen(false);
        setMensaje({ tipo: 'exito', texto: 'Libro entregado correctamente' });
        cargarPrestamos();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al registrar entrega' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar entrega' });
    }
  };

  const handleDevolverPrestamo = async (idPrestamo) => {
    try {
      const response = await fetch(`${API_URL}/prestamoLibro/${idPrestamo}/devolver`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      if (!data.error) {
        setModalDetalleOpen(false);
        setMensaje({ tipo: 'exito', texto: 'Devolución registrada correctamente' });
        cargarPrestamos();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al registrar devolución' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar devolución' });
    }
  };

  const handleCancelarPrestamo = async (idPrestamo) => {
    try {
      const response = await fetch(`${API_URL}/prestamoLibro/${idPrestamo}/cancelar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      if (!data.error) {
        setModalDetalleOpen(false);
        setMensaje({ tipo: 'exito', texto: 'Préstamo cancelado' });
        cargarPrestamos();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al cancelar' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al cancelar préstamo' });
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Préstamos de Libros</h1>
        <p className="text-gray-600 mt-1">Gestiona los préstamos de libros a estudiantes</p>
      </header>

      {/* Barra de acciones */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por usuario, libro o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Filtro estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="atrasado">Atrasado</option>
          <option value="finalizado">Finalizado</option>
          <option value="finalizado_tardio">Devuelto con Atraso</option>
          <option value="cancelado">Cancelado</option>
        </select>
        
        {/* Botón nuevo préstamo */}
        <button
          onClick={() => setModalNuevoOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          Nuevo Préstamo
        </button>
      </div>

      {/* Tabla de préstamos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={40} />
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">ID</th>
                <th className="text-left p-4 font-semibold text-gray-700">Usuario</th>
                <th className="text-left p-4 font-semibold text-gray-700">Libro</th>
                <th className="text-left p-4 font-semibold text-gray-700">Fecha Inicio</th>
                <th className="text-left p-4 font-semibold text-gray-700">Fecha Fin</th>
                <th className="text-left p-4 font-semibold text-gray-700">Estado</th>
                <th className="text-center p-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prestamosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <BookOpen className="mx-auto mb-2 text-gray-300" size={48} />
                    No se encontraron préstamos
                  </td>
                </tr>
              ) : (
                prestamosFiltrados.map((prestamo) => (
                  <tr key={prestamo.idPrestamo} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600 font-mono">#{prestamo.idPrestamo}</td>
                    <td className="p-4 text-gray-800">{prestamo.nombreUsuario || `Usuario #${prestamo.idUsuario}`}</td>
                    <td className="p-4 text-gray-600">{prestamo.tituloLibro || `Ejemplar #${prestamo.idEjemplar}`}</td>
                    <td className="p-4 text-gray-600">{formatFecha(prestamo.fechaInicio)}</td>
                    <td className="p-4 text-gray-600">{formatFecha(prestamo.fechaFin)}</td>
                    <td className="p-4"><EstadoBadge estado={prestamo.estado} /></td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleVerDetalle(prestamo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nuevo Préstamo */}
      <Modal
        show={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        title="Nuevo Préstamo de Libro"
      >
        <form onSubmit={handleCrearPrestamo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID del Usuario *</label>
            <input
              type="number"
              value={formData.idUsuario}
              onChange={(e) => setFormData({...formData, idUsuario: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
              placeholder="Ingrese el ID del estudiante"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID del Ejemplar *</label>
            <input
              type="number"
              value={formData.idEjemplar}
              onChange={(e) => setFormData({...formData, idEjemplar: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
              placeholder="Ingrese el ID del ejemplar"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Devolución *</label>
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalNuevoOpen(false)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Crear Préstamo
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle Préstamo */}
      <Modal
        show={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        title={`Préstamo #${prestamoSeleccionado?.idPrestamo}`}
        size="lg"
      >
        {prestamoSeleccionado && (
          <div className="space-y-6">
            {/* Info del préstamo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Usuario</h3>
                <p className="text-gray-900">{prestamoSeleccionado.nombreUsuario || `ID: ${prestamoSeleccionado.idUsuario}`}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                <EstadoBadge estado={prestamoSeleccionado.estado} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Libro</h3>
                <p className="text-gray-700">{prestamoSeleccionado.tituloLibro || `Ejemplar #${prestamoSeleccionado.idEjemplar}`}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bibliotecario</h3>
                <p className="text-gray-700">{prestamoSeleccionado.nombreBibliotecario || 'No asignado'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fecha Inicio</h3>
                <p className="text-gray-700">{formatFecha(prestamoSeleccionado.fechaInicio)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fecha Fin</h3>
                <p className="text-gray-700">{formatFecha(prestamoSeleccionado.fechaFin)}</p>
              </div>
              {prestamoSeleccionado.fechaDevolucionReal && (
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Fecha Devolución Real</h3>
                  <p className="text-gray-700">{formatFecha(prestamoSeleccionado.fechaDevolucionReal)}</p>
                </div>
              )}
            </div>

            {/* Acciones según estado */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {prestamoSeleccionado.estado === 'pendiente' && (
                <>
                  <button
                    onClick={() => mostrarConfirmacion(
                      '¿Confirmar entrega del libro al estudiante?',
                      () => handleEntregarPrestamo(prestamoSeleccionado.idPrestamo)
                    )}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Package size={18} />
                    Confirmar Entrega
                  </button>
                  <button
                    onClick={() => mostrarConfirmacion(
                      '¿Cancelar este préstamo?',
                      () => handleCancelarPrestamo(prestamoSeleccionado.idPrestamo)
                    )}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle size={18} />
                    Cancelar Préstamo
                  </button>
                </>
              )}
              
              {(prestamoSeleccionado.estado === 'activo' || prestamoSeleccionado.estado === 'atrasado') && (
                <>
                  {/* Si no tiene bibliotecario, se puede cancelar o entregar */}
                  {!prestamoSeleccionado.idBibliotecario && (
                    <>
                      <button
                        onClick={() => mostrarConfirmacion(
                          '¿Confirmar entrega del libro al estudiante?',
                          () => handleEntregarPrestamo(prestamoSeleccionado.idPrestamo)
                        )}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Package size={18} />
                        Confirmar Entrega
                      </button>
                      <button
                        onClick={() => mostrarConfirmacion(
                          '¿Cancelar este préstamo?',
                          () => handleCancelarPrestamo(prestamoSeleccionado.idPrestamo)
                        )}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={18} />
                        Cancelar Préstamo
                      </button>
                    </>
                  )}
                  {/* Si ya tiene bibliotecario, se puede devolver */}
                  {prestamoSeleccionado.idBibliotecario && (
                    <button
                      onClick={() => mostrarConfirmacion(
                        '¿Confirmar devolución del libro?',
                        () => handleDevolverPrestamo(prestamoSeleccionado.idPrestamo)
                      )}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} />
                      Registrar Devolución
                    </button>
                  )}
                </>
              )}

              {['finalizado', 'finalizado_tardio', 'cancelado'].includes(prestamoSeleccionado.estado) && (
                <p className="text-gray-500 italic">
                  {prestamoSeleccionado.estado === 'finalizado_tardio' 
                    ? 'Este préstamo fue devuelto con atraso.'
                    : `Este préstamo ya fue ${prestamoSeleccionado.estado}.`
                  }
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación */}
      <Modal
        show={modalConfirmOpen}
        onClose={() => setModalConfirmOpen(false)}
        title="Confirmar Acción"
        size="sm"
      >
        <div className="text-center">
          <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
          <p className="text-gray-700 mb-6">{confirmMessage}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setModalConfirmOpen(false)}
              className="px-6 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={ejecutarAccionConfirmada}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Banda de mensajes */}
      {mensaje.texto && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg flex items-center gap-3 z-50 ${
          mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {mensaje.tipo === 'exito' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{mensaje.texto}</span>
          <button 
            onClick={() => setMensaje({ tipo: '', texto: '' })}
            className="ml-2 hover:opacity-70"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, X, Book, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';

// URL base del API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import { Modal } from '../../../shared/components/molecules/Modal';

// Componente principal
export default function GestionLibros() {
  const { usuario, token } = useAuth();
  const esAdmin = usuario?.rol === 'administrador';

  // Estados
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados de modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Estado para modal de confirmación
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Estado para mensajes de error/éxito
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estados del formulario
  const [formData, setFormData] = useState({
    isbn: '',
    titulo: '',
    subtitulo: '',
    editorial: '',
    nroEdicion: 1,
    anio: new Date().getFullYear()
  });

  // Cargar libros
  useEffect(() => {
    cargarLibros();
  }, []);

  const cargarLibros = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/libro`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // DEBUG: Ver qué devuelve la API
      console.log('📚 Respuesta API libros:', { status: response.status, data });
      
      // Función para normalizar campos de MAYÚSCULAS (Oracle) a camelCase
      const normalizarLibro = (libro) => ({
        idLibro: libro.ID_LIBRO || libro.idLibro,
        isbn: libro.ISBN || libro.isbn,
        titulo: libro.TITULO || libro.titulo,
        subtitulo: libro.SUBTITULO || libro.subtitulo,
        editorial: libro.EDITORIAL || libro.editorial,
        nroEdicion: libro.NRO_EDICION || libro.nroEdicion,
        anio: libro.ANIO || libro.anio
      });
      
      // La API devuelve: { error: false, body: { data: [...], pagination: {...} } }
      if (!data.error && data.body) {
        const librosRaw = Array.isArray(data.body.data) ? data.body.data : 
                          Array.isArray(data.body) ? data.body : [];
        const librosData = librosRaw.map(normalizarLibro);
        console.log('📚 Libros normalizados:', librosData);
        setLibros(librosData);
      } else {
        setError(data.body || 'Error al cargar libros');
        setLibros([]);
      }
    } catch (err) {
      setError('Error al cargar libros');
      setLibros([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar libros (proteger contra valores no-array)
  const librosFiltrados = Array.isArray(libros) ? libros.filter(libro =>
    libro.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    libro.isbn?.toLowerCase().includes(busqueda.toLowerCase()) ||
    libro.editorial?.toLowerCase().includes(busqueda.toLowerCase())
  ) : [];

  // Handlers
  const handleVerDetalle = (libro) => {
    setLibroSeleccionado(libro);
    setModalDetalleOpen(true);
  };

  const handleNuevoLibro = () => {
    setFormData({
      isbn: '',
      titulo: '',
      subtitulo: '',
      editorial: '',
      nroEdicion: 1,
      anio: new Date().getFullYear()
    });
    setModoEdicion(false);
    setModalFormOpen(true);
  };

  const handleEditarLibro = (libro) => {
    setFormData({
      isbn: libro.isbn || '',
      titulo: libro.titulo || '',
      subtitulo: libro.subtitulo || '',
      editorial: libro.editorial || '',
      nroEdicion: libro.nroEdicion || 1,
      anio: libro.anio || new Date().getFullYear()
    });
    setLibroSeleccionado(libro);
    setModoEdicion(true);
    setModalFormOpen(true);
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

  const handleGuardarLibro = async (e) => {
    e.preventDefault();
    try {
      const url = modoEdicion 
        ? `${API_URL}/libro/${libroSeleccionado.idLibro}`
        : `${API_URL}/libro`;
      
      const response = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!data.error) {
        setModalFormOpen(false);
        setMensaje({ tipo: 'exito', texto: modoEdicion ? 'Libro actualizado' : 'Libro creado' });
        cargarLibros();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al guardar' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar libro' });
    }
  };

  const handleEliminarLibro = async (libro) => {
    try {
      const response = await fetch(`${API_URL}/libro/${libro.idLibro}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      console.log('Respuesta eliminar:', data);
      
      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Libro eliminado correctamente' });
        cargarLibros();
      } else {
        console.error('Error del backend:', data.body);
        setMensaje({ tipo: 'error', texto: data.body || 'Error al eliminar' });
      }
    } catch (err) {
      console.error('Error de red/fetch:', err);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar libro' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Libros</h1>
        <p className="text-gray-600 mt-1">
          {esAdmin ? 'Administra el catálogo de libros' : 'Consulta el catálogo de libros'}
        </p>
      </header>

      {/* Barra de acciones */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título, ISBN o editorial..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
          />
        </div>
        
        {/* Botón agregar (solo admin) */}
        {esAdmin && (
          <button
            onClick={handleNuevoLibro}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            <Plus size={20} />
            Agregar Libro
          </button>
        )}
      </div>

      {/* Tabla de libros */}
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
                <th className="text-left p-4 font-semibold text-gray-700">Título</th>
                <th className="text-left p-4 font-semibold text-gray-700">ISBN</th>
                <th className="text-left p-4 font-semibold text-gray-700">Editorial</th>
                <th className="text-left p-4 font-semibold text-gray-700">Año</th>
                <th className="text-center p-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {librosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <Book className="mx-auto mb-2 text-gray-300" size={48} />
                    No se encontraron libros
                  </td>
                </tr>
              ) : (
                librosFiltrados.map((libro) => (
                  <tr key={libro.idLibro} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{libro.titulo}</p>
                        {libro.subtitulo && (
                          <p className="text-sm text-gray-500">{libro.subtitulo}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{libro.isbn}</td>
                    <td className="p-4 text-gray-600">{libro.editorial}</td>
                    <td className="p-4 text-gray-600">{libro.anio}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleVerDetalle(libro)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        {esAdmin && (
                          <>
                            <button
                              onClick={() => handleEditarLibro(libro)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => mostrarConfirmacion(
                                `¿Eliminar "${libro.titulo}"?`,
                                () => handleEliminarLibro(libro)
                              )}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Formulario (Agregar/Editar) */}
      <Modal
        show={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        title={modoEdicion ? 'Editar Libro' : 'Agregar Libro'}
      >
        <form onSubmit={handleGuardarLibro} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <input
                type="text"
                value={formData.subtitulo}
                onChange={(e) => setFormData({...formData, subtitulo: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Editorial *</label>
              <input
                type="text"
                value={formData.editorial}
                onChange={(e) => setFormData({...formData, editorial: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edición</label>
              <input
                type="number"
                value={formData.nroEdicion}
                onChange={(e) => setFormData({...formData, nroEdicion: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input
                type="number"
                value={formData.anio}
                onChange={(e) => setFormData({...formData, anio: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                min={1900}
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalFormOpen(false)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {modoEdicion ? 'Guardar Cambios' : 'Agregar Libro'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        show={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        title="Detalle del Libro"
        size="lg"
      >
        {libroSeleccionado && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Título</h3>
                <p className="text-lg text-gray-900">{libroSeleccionado.titulo}</p>
              </div>
              {libroSeleccionado.subtitulo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subtítulo</h3>
                  <p className="text-gray-700">{libroSeleccionado.subtitulo}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                <p className="text-gray-700 font-mono">{libroSeleccionado.isbn}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Editorial</h3>
                <p className="text-gray-700">{libroSeleccionado.editorial}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Edición</h3>
                <p className="text-gray-700">{libroSeleccionado.nroEdicion}ª edición</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Año</h3>
                <p className="text-gray-700">{libroSeleccionado.anio}</p>
              </div>
            </div>

            {/* Aquí se pueden mostrar ejemplares, autores, etc. */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Ejemplares</h3>
              <p className="text-gray-500 text-sm">Funcionalidad de ejemplares próximamente...</p>
            </div>

            {esAdmin && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setModalDetalleOpen(false);
                    handleEditarLibro(libroSeleccionado);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Edit size={18} />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setModalDetalleOpen(false);
                    mostrarConfirmacion(
                      `¿Eliminar "${libroSeleccionado.titulo}"?`,
                      () => handleEliminarLibro(libroSeleccionado)
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Confirmación */}
      <Modal
        show={modalConfirmOpen}
        onClose={() => setModalConfirmOpen(false)}
        title="Confirmar Acción"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">{confirmMessage}</p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setModalConfirmOpen(false)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={ejecutarAccionConfirmada}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Notificación */}
      {mensaje.texto && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg text-white ${
          mensaje.tipo === 'error' ? 'bg-red-600' : 
          mensaje.tipo === 'exito' ? 'bg-green-600' : 'bg-blue-600'
        } transition-all duration-300 z-50 flex items-center`}>
          {mensaje.texto}
          <button 
            onClick={() => setMensaje({ tipo: '', texto: '' })}
            className="ml-4 hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

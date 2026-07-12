
import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, X, LayoutGrid, Users } from 'lucide-react';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function GestionCubiculos() {
  const { token } = useAuth();
  
  // Estados principales
  const [cubiculos, setCubiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estados de paginación y filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({
    capacidadMin: '',
    estado: ''
  });

  // Estados de modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cubiculoSeleccionado, setCubiculoSeleccionado] = useState(null);
  
  // Estado para confirmación
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    capacidad: '',
    idBiblioteca: '', // Debería venir de un select o del token del bibliotecario si aplica
    estado: 'disponible'
  });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarCubiculos();
  }, [page, filtros]);

  // Limpiar mensaje
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarCubiculos = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v))
      });

      const response = await fetch(`${API_URL}/cubiculo?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error) {
        setCubiculos(data.body.data || []);
        setTotalPages(data.body.pagination?.total_pages || 1);
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar cubículos' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCubiculo = async (e) => {
    e.preventDefault();
    try {
      const url = modoEdicion 
        ? `${API_URL}/cubiculo/${cubiculoSeleccionado.ID_CUBICULO}`
        : `${API_URL}/cubiculo`;
      
      const method = modoEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!data.error) {
        setModalFormOpen(false);
        setMensaje({ tipo: 'exito', texto: modoEdicion ? 'Cubículo actualizado' : 'Cubículo creado' });
        cargarCubiculos();
        resetForm();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al guardar' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al procesar solicitud' });
    }
  };

  const mostrarConfirmacion = (mensaje, accion) => {
    setConfirmMessage(mensaje);
    setConfirmAction(() => accion);
    setModalConfirmOpen(true);
  };

  const ejecutarAccionConfirmada = async () => {
    if (confirmAction) {
        await confirmAction();
    }
    setModalConfirmOpen(false);
  };

  const handleEliminarCubiculo = async (cubiculo) => {
    try {
      const response = await fetch(`${API_URL}/cubiculo/${cubiculo.ID_CUBICULO}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Cubículo eliminado correctamente' });
        cargarCubiculos();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al eliminar' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar cubículo' });
    }
  };

  const resetForm = () => {
    setFormData({
        capacidad: '',
        idBiblioteca: '1', // Default hardcoded por ahora, idealmente dinámico
        estado: 'disponible'
    });
    setModoEdicion(false);
    setCubiculoSeleccionado(null);
  };

  const abrirModalEditar = (cubiculo) => {
    setCubiculoSeleccionado(cubiculo);
    setFormData({
      capacidad: cubiculo.CAPACIDAD || '',
      idBiblioteca: cubiculo.ID_BIBLIOTECA || '',
      estado: cubiculo.ESTADO || 'disponible'
    });
    setModoEdicion(true);
    setModalFormOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Cubículos</h1>
          <p className="text-gray-500 mt-1 text-sm">Administra los espacios de estudio grupal</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalFormOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-medium"
        >
          <Plus size={20} />
          Nuevo Cubículo
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="number"
                placeholder="Filtrar por capacidad mínima..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setFiltros(prev => ({ ...prev, capacidadMin: e.target.value }))}
            />
        </div>
        <div className="w-1/4">
             <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
             >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="mantenimiento">Mantenimiento</option>
             </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID / Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacidad</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Biblioteca</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">Cargando...</td>
                </tr>
              ) : cubiculos.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">No se encontraron cubículos</td>
                </tr>
              ) : (
                cubiculos.map((cubiculo) => (
                  <tr key={cubiculo.ID_CUBICULO} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <LayoutGrid size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Cubículo #{cubiculo.ID_CUBICULO}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Users size={16} />
                            <span>{cubiculo.CAPACIDAD} personas</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                        ID: {cubiculo.ID_BIBLIOTECA}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        cubiculo.ESTADO === 'disponible' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {cubiculo.ESTADO}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button
                            onClick={() => abrirModalEditar(cubiculo)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => mostrarConfirmacion(
                                `¿Eliminar cubículo #${cubiculo.ID_CUBICULO}?`,
                                () => handleEliminarCubiculo(cubiculo)
                            )}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

     {/* Modal Formulario */}
     <Modal
        show={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        title={modoEdicion ? "Editar Cubículo" : "Nuevo Cubículo"}
        size="md"
      >
        <form onSubmit={handleGuardarCubiculo} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (Personas)</label>
                <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Biblioteca</label>
                <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.idBiblioteca}
                    onChange={(e) => setFormData({...formData, idBiblioteca: e.target.value})}
                />
                <p className="text-xs text-gray-400 mt-1">Ingrese el ID de la biblioteca a la que pertenece.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                    <option value="disponible">Disponible</option>
                    <option value="mantenimiento">Mantenimiento</option>
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                    type="button"
                    onClick={() => setModalFormOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {modoEdicion ? 'Guardar Cambios' : 'Crear Cubículo'}
                </button>
            </div>
        </form>
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

      {/* Notificación Toast */}
      {mensaje.texto && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg text-white ${
          mensaje.tipo === 'error' ? 'bg-red-600' : 'bg-green-600'
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

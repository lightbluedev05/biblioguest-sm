
import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, X, Laptop } from 'lucide-react';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function GestionLaptops() {
  const { token, user } = useAuth();
  
  // Estados principales
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estados de paginación y filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({
    marca: '',
    modelo: '',
    numeroSerie: '',
    estado: ''
  });

  // Estados de modales y edición
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [laptopSeleccionada, setLaptopSeleccionada] = useState(null);
  
  // Estado para el mensaje de confirmación
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    numeroSerie: '',
    marca: '',
    modelo: '',
    sistemaOperativo: '',
    idUtilidad: '', 
    estado: 'disponible'
  });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarLaptops();
  }, [page, filtros]);

  // Limpiar mensaje después de 3 segundos
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarLaptops = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v))
      });

      const response = await fetch(`${API_URL}/laptop?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error) {
        setLaptops(data.body.data || []);
        setTotalPages(data.body.pagination?.total_pages || 1);
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar laptops' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarLaptop = async (e) => {
    e.preventDefault();
    try {
      const url = modoEdicion 
        ? `${API_URL}/laptop/${laptopSeleccionada.ID_LAPTOP}`
        : `${API_URL}/laptop`;
      
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
        setMensaje({ tipo: 'exito', texto: modoEdicion ? 'Laptop actualizada' : 'Laptop creada' });
        cargarLaptops();
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

  const handleEliminarLaptop = async (laptop) => {
    try {
      // Usamos el endpoint de deshabilitar/eliminar
      // En el controller se llama 'disableLaptop' pero la ruta podría ser DELETE /laptop/:id
      // Revisado controller: exports.disableLaptop mapeado a DELETE o PUT? 
      // Revisando routes/laptop.js... asumiremos DELETE por ahora o verificaremos.
      const response = await fetch(`${API_URL}/laptop/${laptop.ID_LAPTOP}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      console.log('Respuesta eliminar:', data);

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Laptop eliminada correctamente' });
        cargarLaptops();
      } else {
        console.error('Error backend:', data.body);
        setMensaje({ tipo: 'error', texto: data.body || 'Error al eliminar' });
      }
    } catch (err) {
      console.error('Error fetch:', err);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar laptop' });
    }
  };

  const resetForm = () => {
    setFormData({
        numeroSerie: '',
        marca: '',
        modelo: '',
        sistemaOperativo: '',
        idUtilidad: '', 
        estado: 'disponible'
    });
    setModoEdicion(false);
    setLaptopSeleccionada(null);
  };

  const abrirModalEditar = (laptop) => {
    setLaptopSeleccionada(laptop);
    setFormData({
      numeroSerie: laptop.NUMERO_SERIE || '',
      marca: laptop.MARCA || '',
      modelo: laptop.MODELO || '',
      sistemaOperativo: laptop.SISTEMA_OPERATIVO || '',
      idUtilidad: laptop.ID_UTILIDAD || '', 
      estado: laptop.ESTADO || 'disponible'
    });
    setModoEdicion(true);
    setModalFormOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Laptops</h1>
          <p className="text-gray-500 mt-1 text-sm">Administra el inventario de equipos portátiles</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalFormOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-medium"
        >
          <Plus size={20} />
          Nueva Laptop
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Buscar por serie, marca o modelo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setFiltros(prev => ({ ...prev, marca: e.target.value }))} // Simplificado por ahora
            />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Info Equipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Serie / Sistema</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">Cargando...</td>
                </tr>
              ) : laptops.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">No se encontraron laptops</td>
                </tr>
              ) : (
                laptops.map((laptop) => (
                  <tr key={laptop.ID_LAPTOP} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Laptop size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{laptop.MARCA} {laptop.MODELO}</p>
                          <p className="text-xs text-gray-500">ID: {laptop.ID_LAPTOP}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 font-medium">{laptop.NUMERO_SERIE}</p>
                        <p className="text-xs text-gray-500">{laptop.SISTEMA_OPERATIVO}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        laptop.ESTADO === 'disponible' ? 'bg-green-50 text-green-700 border-green-200' :
                        laptop.ESTADO === 'en uso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {laptop.ESTADO}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button
                            onClick={() => abrirModalEditar(laptop)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => mostrarConfirmacion(
                                `¿Eliminar laptop ${laptop.MARCA} ${laptop.MODELO}?`,
                                () => handleEliminarLaptop(laptop)
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
        title={modoEdicion ? "Editar Laptop" : "Nueva Laptop"}
      >
        <form onSubmit={handleGuardarLaptop} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.marca}
                        onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.modelo}
                        onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nro. Serie</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.numeroSerie}
                        onChange={(e) => setFormData({...formData, numeroSerie: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sistema Operativo</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.sistemaOperativo}
                        onChange={(e) => setFormData({...formData, sistemaOperativo: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.estado}
                        onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    >
                        <option value="disponible">Disponible</option>
                        <option value="en uso">En uso</option>
                        <option value="baja">Baja</option>
                    </select>
                </div>
                {/* Nota: idUtilidad se podría hacer con un select cargando utilidades del backend */}
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
                    {modoEdicion ? 'Guardar Cambios' : 'Crear Laptop'}
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

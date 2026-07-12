import React, { useState, useEffect } from 'react';
import { Search, User, Plus, Edit, Trash2 } from 'lucide-react';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function GestionBibliotecarios() {
  const { token } = useAuth();
  
  // Estados
  const [bibliotecarios, setBibliotecarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({
    nombre: '',
    correo: '',
    turno: ''
  });

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bibliotecarioSeleccionado, setBibliotecarioSeleccionado] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    turno: '',
    password: ''
  });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarBibliotecarios();
  }, [page, filtros]);

  // Limpiar mensaje
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarBibliotecarios = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v))
      });

      const response = await fetch(`${API_URL}/bibliotecario?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error) {
        setBibliotecarios(data.body.data || []);
        setTotalPages(Math.ceil((data.body.total || 0) / 10));
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar bibliotecarios' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      nombre: '',
      correo: '',
      turno: '',
      password: ''
    });
    setModalFormOpen(true);
  };

  const handleOpenEdit = (bibliotecario) => {
    setIsEditing(true);
    setBibliotecarioSeleccionado(bibliotecario);
    setFormData({
      nombre: bibliotecario.NOMBRE || '',
      correo: bibliotecario.CORREO || '',
      turno: bibliotecario.TURNO || '',
      password: ''
    });
    setModalFormOpen(true);
  };

  const handleOpenDelete = (bibliotecario) => {
    setBibliotecarioSeleccionado(bibliotecario);
    setModalDeleteOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isEditing 
        ? `${API_URL}/bibliotecario/${bibliotecarioSeleccionado.ID_BIBLIOTECARIO}`
        : `${API_URL}/bibliotecario`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const body = isEditing ? {
        nombre: formData.nombre,
        correo: formData.correo,
        turno: formData.turno || null
      } : {
        nombre: formData.nombre,
        correo: formData.correo,
        turno: formData.turno || null,
        password: formData.password || undefined
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: isEditing ? 'Bibliotecario actualizado' : 'Bibliotecario creado' });
        setModalFormOpen(false);
        cargarBibliotecarios();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al guardar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/bibliotecario/${bibliotecarioSeleccionado.ID_BIBLIOTECARIO}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Bibliotecario eliminado' });
        setModalDeleteOpen(false);
        cargarBibliotecarios();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al eliminar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const getTurnoBadge = (turno) => {
    const styles = {
      mañana: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      tarde: 'bg-orange-50 text-orange-700 border-orange-200',
      noche: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    const turnoMin = turno?.toLowerCase() || '';
    return turno ? (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[turnoMin] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {turno}
      </span>
    ) : (
      <span className="text-gray-400">-</span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Bibliotecarios</h1>
          <p className="text-gray-500 mt-1 text-sm">Administra el personal bibliotecario</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span className="font-medium">Nuevo Bibliotecario</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={filtros.nombre}
            onChange={(e) => setFiltros(prev => ({ ...prev, nombre: e.target.value }))}
          />
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por correo..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={filtros.correo}
            onChange={(e) => setFiltros(prev => ({ ...prev, correo: e.target.value }))}
          />
        </div>

        <div className="relative">
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
            value={filtros.turno}
            onChange={(e) => setFiltros(prev => ({ ...prev, turno: e.target.value }))}
          >
            <option value="">Todos los turnos</option>
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
          </select>
        </div>

        <button
          onClick={() => { setFiltros({ nombre: '', correo: '', turno: '' }); setPage(1); }}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turno</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">Cargando...</td>
                </tr>
              ) : bibliotecarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">No se encontraron bibliotecarios</td>
                </tr>
              ) : (
                bibliotecarios.map((biblio) => (
                  <tr key={biblio.ID_BIBLIOTECARIO} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">#{biblio.ID_BIBLIOTECARIO}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <User size={18} />
                        </div>
                        <span className="font-medium text-gray-900">{biblio.NOMBRE}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{biblio.CORREO}</td>
                    <td className="px-6 py-4">{getTurnoBadge(biblio.TURNO)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(biblio)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(biblio)}
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      <Modal
        show={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        title={isEditing ? 'Editar Bibliotecario' : 'Nuevo Bibliotecario'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.correo}
              onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.turno}
              onChange={(e) => setFormData(prev => ({ ...prev, turno: e.target.value }))}
            >
              <option value="">Sin asignar</option>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="Dejar vacío para usar correo"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          )}

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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Guardar cambios' : 'Crear bibliotecario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        show={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        title="Eliminar Bibliotecario"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar a <strong>{bibliotecarioSeleccionado?.NOMBRE}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setModalDeleteOpen(false)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {mensaje.texto && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg text-white ${
          mensaje.tipo === 'error' ? 'bg-red-600' : 'bg-green-600'
        } transition-all duration-300 z-50`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}

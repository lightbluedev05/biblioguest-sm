import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Plus, Edit, X, User } from 'lucide-react';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function GestionSanciones() {
  const { token } = useAuth();
  
  // Estados
  const [sanciones, setSanciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sancionSeleccionada, setSancionSeleccionada] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    idUsuario: '',
    fechaInicio: '',
    fechaFin: '',
    motivo: ''
  });

  // Búsqueda de usuarios
  const [buscarUsuario, setBuscarUsuario] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarSanciones();
  }, [page, filtros]);

  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Buscar usuarios cuando cambia el texto
  useEffect(() => {
    if (buscarUsuario.length >= 2) {
      buscarUsuarios();
    } else {
      setUsuariosEncontrados([]);
    }
  }, [buscarUsuario]);

  const cargarSanciones = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v))
      });

      const response = await fetch(`${API_URL}/sancion?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error) {
        setSanciones(data.body.data || []);
        setTotalPages(Math.ceil((data.body.total || 0) / 10));
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar sanciones' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuario?nombre=${buscarUsuario}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.error) {
        setUsuariosEncontrados(data.body.data || []);
      }
    } catch (error) {
      console.error('Error buscando usuarios:', error);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ idUsuario: '', fechaInicio: '', fechaFin: '', motivo: '' });
    setBuscarUsuario('');
    setUsuariosEncontrados([]);
    setModalFormOpen(true);
  };

  const handleOpenEdit = (sancion) => {
    setIsEditing(true);
    setSancionSeleccionada(sancion);
    setFormData({
      idUsuario: sancion.ID_USUARIO,
      fechaInicio: sancion.FECHA_INICIO ? new Date(sancion.FECHA_INICIO).toISOString().split('T')[0] : '',
      fechaFin: sancion.FECHA_FIN ? new Date(sancion.FECHA_FIN).toISOString().split('T')[0] : '',
      motivo: sancion.MOTIVO || ''
    });
    setBuscarUsuario(sancion.NOMBRE_USUARIO || '');
    setModalFormOpen(true);
  };

  const handleOpenCancelar = (sancion) => {
    setSancionSeleccionada(sancion);
    setModalCancelarOpen(true);
  };

  const handleSelectUsuario = (usuario) => {
    setFormData(prev => ({ ...prev, idUsuario: usuario.ID_USUARIO }));
    setBuscarUsuario(usuario.NOMBRE);
    setUsuariosEncontrados([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isEditing 
        ? `${API_URL}/sancion/${sancionSeleccionada.ID_SANCION}`
        : `${API_URL}/sancion`;
      
      const method = isEditing ? 'PUT' : 'POST';

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
        setMensaje({ tipo: 'exito', texto: isEditing ? 'Sanción actualizada' : 'Sanción creada' });
        setModalFormOpen(false);
        cargarSanciones();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al guardar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const handleCancelar = async () => {
    try {
      const response = await fetch(`${API_URL}/sancion/${sancionSeleccionada.ID_SANCION}/cancelar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Sanción cancelada' });
        setModalCancelarOpen(false);
        cargarSanciones();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al cancelar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      activa: 'bg-red-50 text-red-700 border-red-200',
      cancelada: 'bg-gray-50 text-gray-700 border-gray-200',
      cumplida: 'bg-green-50 text-green-700 border-green-200'
    };
    const estadoMin = estado?.toLowerCase() || 'activa';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[estadoMin] || styles.activa}`}>
        {estado}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Sanciones</h1>
          <p className="text-gray-500 mt-1 text-sm">Administra las sanciones de usuarios</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span className="font-medium">Nueva Sanción</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={filtros.estado}
          onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
        >
          <option value="">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="cancelada">Cancelada</option>
          <option value="cumplida">Cumplida</option>
        </select>
        
        <input
          type="date"
          placeholder="Desde"
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={filtros.fechaDesde}
          onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
        />

        <input
          type="date"
          placeholder="Hasta"
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={filtros.fechaHasta}
          onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
        />

        <button
          onClick={() => { setFiltros({ estado: '', fechaDesde: '', fechaHasta: '' }); setPage(1); }}
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Fin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">Cargando...</td>
                </tr>
              ) : sanciones.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">No se encontraron sanciones</td>
                </tr>
              ) : (
                sanciones.map((sancion) => (
                  <tr key={sancion.ID_SANCION} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                          <User size={18} />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{sancion.NOMBRE_USUARIO}</span>
                          <div className="text-sm text-gray-500">{sancion.CODIGO_INSTITUCIONAL}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(sancion.FECHA_INICIO)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(sancion.FECHA_FIN)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{sancion.MOTIVO || '-'}</td>
                    <td className="px-6 py-4">{getEstadoBadge(sancion.ESTADO)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(sancion)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      {sancion.ESTADO?.toLowerCase() === 'activa' && (
                        <button
                          onClick={() => handleOpenCancelar(sancion)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      )}
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
        title={isEditing ? 'Editar Sanción' : 'Nueva Sanción'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Usuario *</label>
              <input
                type="text"
                placeholder="Escriba nombre o código..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={buscarUsuario}
                onChange={(e) => setBuscarUsuario(e.target.value)}
              />
              {usuariosEncontrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {usuariosEncontrados.map(u => (
                    <div
                      key={u.ID_USUARIO}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectUsuario(u)}
                    >
                      <div className="font-medium">{u.NOMBRE}</div>
                      <div className="text-sm text-gray-500">{u.CODIGO_INSTITUCIONAL}</div>
                    </div>
                  ))}
                </div>
              )}
              {formData.idUsuario && (
                <div className="mt-2 text-sm text-green-600">Usuario seleccionado: ID {formData.idUsuario}</div>
              )}
            </div>
          )}

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                value={buscarUsuario}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.fechaInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.fechaFin}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
              value={formData.motivo}
              onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
              placeholder="Describe el motivo de la sanción..."
            />
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
              disabled={!isEditing && !formData.idUsuario}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isEditing ? 'Guardar cambios' : 'Crear sanción'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Cancelar */}
      <Modal
        show={modalCancelarOpen}
        onClose={() => setModalCancelarOpen(false)}
        title="Cancelar Sanción"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas cancelar esta sanción para <strong>{sancionSeleccionada?.NOMBRE_USUARIO}</strong>?
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setModalCancelarOpen(false)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              No, mantener
            </button>
            <button
              onClick={handleCancelar}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sí, cancelar
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

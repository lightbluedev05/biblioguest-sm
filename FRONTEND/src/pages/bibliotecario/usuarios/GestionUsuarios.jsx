import React, { useState, useEffect } from 'react';
import { Search, User, Plus, Edit, Trash2, Eye, BookOpen, Laptop, LayoutGrid } from 'lucide-react';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function GestionUsuarios() {
  const { token } = useAuth();
  
  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({
    nombre: '',
    codigo: '',
    estado: ''
  });

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [modalActividadOpen, setModalActividadOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [actividad, setActividad] = useState(null);
  const [loadingActividad, setLoadingActividad] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    codigoInstitucional: '',
    correo: '',
    idUnidad: '',
    password: '',
    estado: 'activo'
  });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarUsuarios();
  }, [page, filtros]);

  // Limpiar mensaje
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v))
      });

      const response = await fetch(`${API_URL}/usuario?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error) {
        setUsuarios(data.body.data || []);
        setTotalPages(Math.ceil((data.body.total || 0) / 10));
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar usuarios' });
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
      codigoInstitucional: '',
      correo: '',
      idUnidad: '',
      password: '',
      estado: 'activo'
    });
    setModalFormOpen(true);
  };

  const handleOpenEdit = (usuario) => {
    setIsEditing(true);
    setUsuarioSeleccionado(usuario);
    setFormData({
      nombre: usuario.NOMBRE || '',
      codigoInstitucional: usuario.CODIGO_INSTITUCIONAL || '',
      correo: usuario.CORREO || '',
      idUnidad: usuario.ID_UNIDAD || '',
      password: '',
      estado: usuario.ESTADO || 'activo'
    });
    setModalFormOpen(true);
  };

  const handleOpenDelete = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalDeleteOpen(true);
  };

  const handleOpenActividad = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setLoadingActividad(true);
    setModalActividadOpen(true);

    try {
      const response = await fetch(`${API_URL}/usuario/${usuario.ID_USUARIO}/actividad`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error) {
        setActividad(data.body);
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar actividad' });
        setModalActividadOpen(false);
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
      setModalActividadOpen(false);
    } finally {
      setLoadingActividad(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isEditing 
        ? `${API_URL}/usuario/${usuarioSeleccionado.ID_USUARIO}`
        : `${API_URL}/usuario`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const body = isEditing ? {
        nombre: formData.nombre,
        correo: formData.correo,
        estado: formData.estado,
        idUnidad: formData.idUnidad || null
      } : {
        nombre: formData.nombre,
        codigoInstitucional: formData.codigoInstitucional,
        correo: formData.correo,
        idUnidad: formData.idUnidad || null,
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
        setMensaje({ tipo: 'exito', texto: isEditing ? 'Usuario actualizado' : 'Usuario creado' });
        setModalFormOpen(false);
        cargarUsuarios();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al guardar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/usuario/${usuarioSeleccionado.ID_USUARIO}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Usuario bloqueado' });
        setModalDeleteOpen(false);
        cargarUsuarios();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al bloquear' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      activo: 'bg-green-50 text-green-700 border-green-200',
      bloqueado: 'bg-red-50 text-red-700 border-red-200',
      inactivo: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    const estadoMin = estado?.toLowerCase() || 'activo';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[estadoMin] || styles.activo}`}>
        {estado}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1 text-sm">Administra estudiantes del sistema</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span className="font-medium">Nuevo Usuario</span>
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
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Código institucional..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={filtros.codigo}
            onChange={(e) => setFiltros(prev => ({ ...prev, codigo: e.target.value }))}
          />
        </div>

        <div className="relative">
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
            value={filtros.estado}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>

        <button
          onClick={() => { setFiltros({ nombre: '', codigo: '', estado: '' }); setPage(1); }}
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unidad</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">Cargando...</td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">No se encontraron usuarios</td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.ID_USUARIO} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <User size={18} />
                        </div>
                        <span className="font-medium text-gray-900">{usuario.NOMBRE}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usuario.CODIGO_INSTITUCIONAL}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usuario.CORREO}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usuario.NOMBRE_UNIDAD || '-'}</td>
                    <td className="px-6 py-4">{getEstadoBadge(usuario.ESTADO)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenActividad(usuario)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ver actividad"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(usuario)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      {usuario.ESTADO !== 'bloqueado' && (
                        <button
                          onClick={() => handleOpenDelete(usuario)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Bloquear"
                        >
                          <Trash2 size={18} />
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
        title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
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

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Institucional *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.codigoInstitucional}
                onChange={(e) => setFormData(prev => ({ ...prev, codigoInstitucional: e.target.value }))}
              />
            </div>
          )}

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

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="Dejar vacío para usar código"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          )}

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
              >
                <option value="activo">Activo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
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
              {isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        show={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        title="Bloquear Usuario"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas bloquear a <strong>{usuarioSeleccionado?.NOMBRE}</strong>?
            El usuario no podrá acceder al sistema.
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
              Bloquear
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Actividad */}
      <Modal
        show={modalActividadOpen}
        onClose={() => setModalActividadOpen(false)}
        title={`Actividad de ${usuarioSeleccionado?.NOMBRE || 'Usuario'}`}
        size="lg"
      >
        {loadingActividad ? (
          <div className="text-center py-8 text-gray-500">Cargando actividad...</div>
        ) : actividad ? (
          <div className="space-y-6">
            {/* Préstamos */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpen size={16} /> Préstamos Activos ({actividad.prestamos?.length || 0})
              </h4>
              {actividad.prestamos?.length > 0 ? (
                <div className="space-y-2">
                  {actividad.prestamos.map((p, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="font-medium">{p.TITULO_LIBRO}</div>
                      <div className="text-gray-500">
                        {new Date(p.FECHA_INICIO).toLocaleDateString()} - {new Date(p.FECHA_FIN).toLocaleDateString()}
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          p.ESTADO === 'ATRASADO' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>{p.ESTADO}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin préstamos activos</p>
              )}
            </div>

            {/* Reservas Laptop */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Laptop size={16} /> Reservas de Laptop ({actividad.reservasLaptop?.length || 0})
              </h4>
              {actividad.reservasLaptop?.length > 0 ? (
                <div className="space-y-2">
                  {actividad.reservasLaptop.map((r, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="font-medium">{r.NOMBRE_LAPTOP}</div>
                      <div className="text-gray-500">
                        {new Date(r.FECHA_RESERVA).toLocaleDateString()} | {r.HORA_INICIO} - {r.HORA_FIN}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin reservas de laptop activas</p>
              )}
            </div>

            {/* Reservas Cubículo */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <LayoutGrid size={16} /> Reservas de Cubículo ({actividad.reservasCubiculo?.length || 0})
              </h4>
              {actividad.reservasCubiculo?.length > 0 ? (
                <div className="space-y-2">
                  {actividad.reservasCubiculo.map((r, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="font-medium">Cubículo #{r.ID_CUBICULO}</div>
                      <div className="text-gray-500">
                        {new Date(r.FECHA_RESERVA).toLocaleDateString()} | {r.HORA_INICIO} - {r.HORA_FIN}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin reservas de cubículo activas</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setModalActividadOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No se pudo cargar la actividad</p>
        )}
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

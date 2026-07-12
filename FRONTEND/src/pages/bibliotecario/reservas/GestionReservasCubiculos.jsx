
import React, { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle, XCircle, Clock, LayoutGrid, Users, User, Eye, ArrowRight } from 'lucide-react';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function GestionReservasCubiculos() {
  const { token, usuario } = useAuth();
  
  // Estados
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({
    fechaReserva: '', 
    idCubiculo: '',
    estado: ''
  });

  // Modales
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Modal Integrantes
  const [modalIntegrantesOpen, setModalIntegrantesOpen] = useState(false);
  const [integrantes, setIntegrantes] = useState([]);
  const [loadingIntegrantes, setLoadingIntegrantes] = useState(false);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarReservas();
  }, [page, filtros]);

  // Limpiar mensaje
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v))
      });

      const response = await fetch(`${API_URL}/reservaCubiculo?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error) {
        setReservas(data.body.data || []);
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar reservas' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const cargarIntegrantes = async (idReserva) => {
    try {
      setLoadingIntegrantes(true);
      setModalIntegrantesOpen(true);
      const response = await fetch(`${API_URL}/reservaCubiculo/${idReserva}/detalle`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error && data.body) {
        // El backend devuelve: { reserva, cubiculo, bibliotecario, miembros }
        // miembros es un array con { idUsuario, nombre, codigoInstitucional, correo, estadoMiembro }
        const miembrosData = data.body.miembros || [];
        // Mapear a formato esperado por la tabla (uppercase keys)
        const miembrosMapped = miembrosData.map(m => ({
          NOMBRE_USUARIO: m.nombre,
          CODIGO_INSTITUCIONAL: m.codigoInstitucional,
          ESTADO_MIEMBRO: m.estadoMiembro
        }));
        setIntegrantes(miembrosMapped);
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al cargar integrantes' });
        setModalIntegrantesOpen(false);
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
      setModalIntegrantesOpen(false);
    } finally {
      setLoadingIntegrantes(false);
    }
  };

  const mostrarConfirmacion = (mensaje, accion) => {
    setConfirmMessage(mensaje);
    setConfirmAction(() => accion);
    setModalConfirmOpen(true);
  };

  const ejecutarAccionConfirmada = async () => {
    if (confirmAction) await confirmAction();
    setModalConfirmOpen(false);
  };

  // Acciones
  const handleConfirmarReserva = async (idReserva) => {
    try {
      const response = await fetch(`${API_URL}/reservaCubiculo/${idReserva}/confirmar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Reserva activada correctamente' });
        cargarReservas();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al confirmar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const handleRegistrarIngreso = async (idReserva) => {
    try {
      const response = await fetch(`${API_URL}/reservaCubiculo/${idReserva}/ingreso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idBibliotecario: usuario.id }) 
      });
      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Ingreso registrado (Check-in)' });
        cargarReservas();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al registrar ingreso' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const handleFinalizarReserva = async (idReserva) => {
    try {
      const response = await fetch(`${API_URL}/reservaCubiculo/${idReserva}/finalizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Reserva finalizada (Cubículo liberado)' });
        cargarReservas();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al finalizar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const handleCancelarReserva = async (idReserva) => {
    try {
      const response = await fetch(`${API_URL}/reservaCubiculo/${idReserva}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Reserva cancelada' });
        cargarReservas();
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al cancelar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      activa: 'bg-green-50 text-green-700 border-green-200',
      pendiente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      finalizada: 'bg-gray-50 text-gray-700 border-gray-200',
      cancelada: 'bg-red-50 text-red-700 border-red-200'
    };
    const estadoMin = estado?.toLowerCase() || 'pendiente';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[estadoMin] || styles.pendiente}`}>
        {estado}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reservas de Cubículos</h1>
          <p className="text-gray-500 mt-1 text-sm">Gestiona el uso y ocupación de cubículos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={filtros.fechaReserva}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaReserva: e.target.value }))}
             />
        </div>
        
        <div className="relative">
            <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="number"
                placeholder="ID Cubículo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={filtros.idCubiculo}
                onChange={(e) => setFiltros(prev => ({ ...prev, idCubiculo: e.target.value }))}
            />
        </div>

        <div className="relative">
            <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="activa">Activa</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
            </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cubículo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Horario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bibliotecario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">Cargando...</td>
                </tr>
              ) : reservas.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">No se encontraron reservas</td>
                </tr>
              ) : (
                reservas.map((reserva) => (
                  <tr key={reserva.ID_RESERVA} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                 <LayoutGrid size={16} />
                             </div>
                             <span className="font-medium text-gray-900">Cubículo #{reserva.ID_CUBICULO}</span>
                         </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col text-sm text-gray-600">
                            <span>{new Date(reserva.FECHA_RESERVA).toLocaleDateString()}</span>
                            <span>{reserva.HORA_INICIO} - {reserva.HORA_FIN}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        {reserva.ID_BIBLIOTECARIO ? `ID: ${reserva.ID_BIBLIOTECARIO}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                        {getEstadoBadge(reserva.ESTADO)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                        {/* Ver Integrantes */}
                        <button
                            onClick={() => cargarIntegrantes(reserva.ID_RESERVA)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver Integrantes"
                        >
                            <Users size={18} />
                        </button>

                         {/* Acciones según estado */}
                        {reserva.ESTADO === 'pendiente' && (
                             <button
                                onClick={() => mostrarConfirmacion('¿Activar reserva? Se verificará que todos los miembros hayan aceptado.', () => handleConfirmarReserva(reserva.ID_RESERVA))}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Activar Reserva"
                            >
                                <CheckCircle size={18} />
                            </button>
                        )}

                        {reserva.ESTADO === 'activa' && !reserva.ID_BIBLIOTECARIO && (
                            <button 
                                onClick={() => mostrarConfirmacion('¿Registrar ingreso de alumnos?', () => handleRegistrarIngreso(reserva.ID_RESERVA))}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Registrar Ingreso (Check-in)"
                            >
                                <ArrowRight size={18} />
                            </button>
                        )}

                        {reserva.ESTADO === 'activa' && reserva.ID_BIBLIOTECARIO && (
                             <button 
                                onClick={() => mostrarConfirmacion('¿Finalizar reserva (Devolución)?', () => handleFinalizarReserva(reserva.ID_RESERVA))}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Finalizar (Salida)"
                            >
                                <Clock size={18} />
                             </button>
                        )}
                        
                        {(reserva.ESTADO === 'activa' || reserva.ESTADO === 'pendiente') && (
                             <button
                                onClick={() => mostrarConfirmacion('¿Cancelar reserva?', () => handleCancelarReserva(reserva.ID_RESERVA))}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancelar"
                            >
                                <XCircle size={18} />
                            </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Modal Integrantes */}
       <Modal
        show={modalIntegrantesOpen}
        onClose={() => setModalIntegrantesOpen(false)}
        title="Integrantes del Grupo"
        size="md"
      >
        {loadingIntegrantes ? (
             <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : (
             <div className="space-y-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200">
                             <th className="pb-2 text-sm font-semibold text-gray-600">Usuario</th>
                             <th className="pb-2 text-sm font-semibold text-gray-600">Código</th>
                             <th className="pb-2 text-sm font-semibold text-gray-600">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {integrantes.map((miembro, idx) => (
                            <tr key={idx} className="text-sm text-gray-700">
                                <td className="py-2">{miembro.NOMBRE_USUARIO}</td>
                                <td className="py-2">{miembro.CODIGO_INSTITUCIONAL}</td>
                                <td className="py-2">
                                     <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                                         miembro.ESTADO_MIEMBRO === 'aceptado' ? 'bg-green-500' :
                                         miembro.ESTADO_MIEMBRO === 'rechazado' ? 'bg-red-500' : 'bg-yellow-500'
                                     }`}>
                                         {miembro.ESTADO_MIEMBRO}
                                     </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-end pt-4">
                     <button
                        onClick={() => setModalIntegrantesOpen(false)}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                     >
                        Cerrar
                     </button>
                </div>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirmar
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

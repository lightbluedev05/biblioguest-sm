import React, { useState, useEffect } from 'react';
import { User, BookOpen, Laptop, LayoutGrid, AlertTriangle, Mail, Clock, Calendar, Check, X } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';

export default function DashboardEstudiante() {
  const { token, usuario } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarDashboard();
  }, []);

  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/dashboard/estudiante`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!result.error) {
        setData(result.body);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatTime = (time) => {
    if (!time) return '-';
    if (typeof time === 'string' && time.includes(':')) return time.substring(0, 5);
    return time;
  };

  const handleInvitacion = async (idReserva, accion) => {
    try {
      const response = await fetch(`${API_URL}/reservaCubiculo/${idReserva}/${accion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idUsuario: usuario?.id })
      });
      const result = await response.json();
      if (!result.error) {
        setMensaje({ tipo: 'exito', texto: accion === 'aceptar' ? 'Invitación aceptada' : 'Invitación rechazada' });
        cargarDashboard();
      } else {
        setMensaje({ tipo: 'error', texto: result.body || 'Error al procesar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando tu resumen...</div>
      </div>
    );
  }

  const user = data?.usuario || usuario || {};

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header con datos personales */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="p-4 bg-blue-100 rounded-2xl">
            <User size={48} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Hola, {user.NOMBRE || user.nombre || 'Estudiante'}!
            </h1>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} />
                <span>Código: <strong>{user.CODIGO_INSTITUCIONAL || user.codigo || '-'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span>{user.CORREO || user.correo || '-'}</span>
              </div>
              {user.NOMBRE_UNIDAD && (
                <div className="flex items-center gap-2 text-gray-600">
                  <LayoutGrid size={16} />
                  <span>{user.NOMBRE_UNIDAD}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas (sanciones activas) */}
      {data?.sanciones?.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={24} />
            <div>
              <h3 className="font-semibold text-red-800">Tienes sanciones activas</h3>
              <p className="text-sm text-red-600">
                {data.sanciones.map(s => s.MOTIVO || 'Sin motivo especificado').join('. ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invitaciones pendientes */}
      {data?.invitaciones?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <Mail size={20} />
            Invitaciones Pendientes
          </h3>
          <div className="space-y-2">
            {data.invitaciones.map((inv, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl">
                <div>
                  <div className="font-medium">Reserva de Cubículo en {inv.BIBLIOTECA}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(inv.FECHA_RESERVA)} | {formatTime(inv.HORA_INICIO)} - {formatTime(inv.HORA_FIN)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInvitacion(inv.ID_RESERVA, 'aceptar')}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    title="Aceptar"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleInvitacion(inv.ID_RESERVA, 'rechazar')}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    title="Rechazar"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de resúmenes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Préstamos de libros */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-green-600" />
            Mis Préstamos
          </h3>
          <div className="space-y-3">
            {data?.prestamos?.length > 0 ? (
              data.prestamos.map((p, i) => {
                const isAtrasado = p.ESTADO_REAL === 'ATRASADO' || 
                  (new Date(p.FECHA_FIN) < new Date() && p.ESTADO !== 'DEVUELTO');
                return (
                  <div key={i} className={`p-3 rounded-xl ${isAtrasado ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                    <div className="font-medium text-gray-900 line-clamp-1">{p.TITULO}</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">Vence: {formatDate(p.FECHA_FIN)}</span>
                      {isAtrasado && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Atrasado</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-400">
                <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p>No tienes préstamos activos</p>
              </div>
            )}
          </div>
        </div>

        {/* Reservas de laptop */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Laptop size={20} className="text-purple-600" />
            Mis Reservas de Laptop
          </h3>
          <div className="space-y-3">
            {data?.reservasLaptop?.length > 0 ? (
              data.reservasLaptop.map((r, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <div className="font-medium text-gray-900">{r.LAPTOP}</div>
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <span className="text-gray-500">{formatDate(r.FECHA_RESERVA)}</span>
                    <span className="text-purple-600 font-medium">
                      {formatTime(r.HORA_INICIO)} - {formatTime(r.HORA_FIN)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Laptop size={32} className="mx-auto mb-2 opacity-50" />
                <p>No tienes reservas de laptop</p>
              </div>
            )}
          </div>
        </div>

        {/* Reservas de cubículo */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LayoutGrid size={20} className="text-orange-600" />
            Mis Reservas de Cubículo
          </h3>
          <div className="space-y-3">
            {data?.reservasCubiculo?.length > 0 ? (
              data.reservasCubiculo.map((r, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Cubículo #{r.ID_CUBICULO}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.ESTADO_MIEMBRO === 'aceptado' ? 'bg-green-100 text-green-700' : 
                      r.ESTADO_MIEMBRO === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {r.ESTADO_MIEMBRO}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{r.BIBLIOTECA}</div>
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <span className="text-gray-500">{formatDate(r.FECHA_RESERVA)}</span>
                    <span className="text-orange-600 font-medium">
                      {formatTime(r.HORA_INICIO)} - {formatTime(r.HORA_FIN)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <LayoutGrid size={32} className="mx-auto mb-2 opacity-50" />
                <p>No tienes reservas de cubículo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Accesos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/catalogo" className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <BookOpen size={28} className="text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-700">Ver Catálogo</span>
          </a>
          <a href="/laptops" className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <Laptop size={28} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-700">Reservar Laptop</span>
          </a>
          <a href="/cubiculos" className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
            <LayoutGrid size={28} className="text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-700">Reservar Cubículo</span>
          </a>
          <a href="/prestamos" className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <Clock size={28} className="text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-700">Mis Préstamos</span>
          </a>
        </div>
      </div>

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

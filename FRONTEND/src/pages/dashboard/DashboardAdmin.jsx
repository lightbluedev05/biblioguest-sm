import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Laptop, LayoutGrid, Clock, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from  '../../shared/hooks/useAuth'

export default function DashboardAdmin() {
  const { token, usuario } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/dashboard/admin`, {
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
    return new Date(date).toLocaleDateString('es-PE');
  };

  const formatTime = (time) => {
    if (!time) return '-';
    if (typeof time === 'string' && time.includes(':')) return time.substring(0, 5);
    return time;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando dashboard...</div>
      </div>
    );
  }

  const stats = data?.estadisticas || {};

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {usuario?.nombre || 'Administrador'}
        </h1>
        <p className="text-gray-500 mt-1">Panel de control del sistema de biblioteca</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users size={24} />}
          label="Usuarios Activos"
          value={stats.totalUsuarios}
          color="blue"
        />
        <StatCard 
          icon={<BookOpen size={24} />}
          label="Libros en Catálogo"
          value={stats.totalLibros}
          color="green"
        />
        <StatCard 
          icon={<Laptop size={24} />}
          label="Laptops Disponibles"
          value={stats.totalLaptops}
          color="purple"
        />
        <StatCard 
          icon={<LayoutGrid size={24} />}
          label="Cubículos Disponibles"
          value={stats.totalCubiculos}
          color="orange"
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Clock size={24} />}
          label="Préstamos Activos"
          value={stats.prestamosActivos}
          color="indigo"
        />
        <StatCard 
          icon={<AlertTriangle size={24} />}
          label="Préstamos Atrasados"
          value={stats.prestamosAtrasados}
          color="red"
          highlight={stats.prestamosAtrasados > 0}
        />
        <StatCard 
          icon={<Calendar size={24} />}
          label="Reservas Laptop Hoy"
          value={stats.reservasLaptopHoy}
          color="teal"
        />
        <StatCard 
          icon={<TrendingUp size={24} />}
          label="Sanciones Activas"
          value={stats.sancionesActivas}
          color="amber"
          highlight={stats.sancionesActivas > 0}
        />
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Préstamos recientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Préstamos Recientes
          </h3>
          <div className="space-y-3">
            {data?.prestamosRecientes?.length > 0 ? (
              data.prestamosRecientes.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{p.TITULO_LIBRO}</div>
                    <div className="text-sm text-gray-500">{p.NOMBRE_USUARIO}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-600">{formatDate(p.FECHA_FIN)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.ESTADO === 'ACTIVO' ? 'bg-green-100 text-green-700' :
                      p.ESTADO === 'ATRASADO' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {p.ESTADO}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No hay préstamos recientes</p>
            )}
          </div>
        </div>

        {/* Reservas de hoy */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-purple-600" />
            Reservas de Hoy
          </h3>
          <div className="space-y-3">
            {data?.reservasHoy?.length > 0 ? (
              data.reservasHoy.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${r.TIPO === 'laptop' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                      {r.TIPO === 'laptop' ? <Laptop size={16} /> : <LayoutGrid size={16} />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{r.RECURSO}</div>
                      {r.NOMBRE_USUARIO && <div className="text-sm text-gray-500">{r.NOMBRE_USUARIO}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {formatTime(r.HORA_INICIO)} - {formatTime(r.HORA_FIN)}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.ESTADO === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.ESTADO}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No hay reservas para hoy</p>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de inventario */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Resumen de Inventario</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-700">{stats.ejemplaresDisponibles}</div>
            <div className="text-sm text-green-600">Ejemplares Disponibles</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-700">{stats.totalEjemplares}</div>
            <div className="text-sm text-blue-600">Total Ejemplares</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-700">{stats.totalLaptops}</div>
            <div className="text-sm text-purple-600">Laptops</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-700">{stats.totalCubiculos}</div>
            <div className="text-sm text-orange-600">Cubículos</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, highlight }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all ${colors[color]} ${highlight ? 'ring-2 ring-red-400' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="p-2 bg-white/50 rounded-xl">
          {icon}
        </div>
        <div className="text-3xl font-bold">{value || 0}</div>
      </div>
      <div className="mt-2 text-sm font-medium opacity-80">{label}</div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function Configuracion() {
  const { token } = useAuth();
  
  const [config, setConfig] = useState({
    diasPrestamoLibros: 7,
    diasAnticipacionLibros: 3,
    diasAnticipacionCubiculos: 1,
    diasAnticipacionLaptops: 1
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/configuracion`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.error && data.body) {
        setConfig({
          diasPrestamoLibros: data.body.DIAS_PRESTAMO_LIBROS || 7,
          diasAnticipacionLibros: data.body.DIAS_ANTICIPACION_LIBROS || 3,
          diasAnticipacionCubiculos: data.body.DIAS_ANTICIPACION_CUBICULOS || 1,
          diasAnticipacionLaptops: data.body.DIAS_ANTICIPACION_LAPTOPS || 1
        });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al cargar configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/configuracion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (!data.error) {
        setMensaje({ tipo: 'exito', texto: 'Configuración guardada correctamente' });
      } else {
        setMensaje({ tipo: 'error', texto: data.body || 'Error al guardar' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setConfig(prev => ({ ...prev, [field]: numValue }));
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configuración del Sistema</h1>
            <p className="text-gray-500 mt-1 text-sm">Ajusta los parámetros generales de la biblioteca</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarConfiguracion}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span>Recargar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={18} />
            <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
          </button>
        </div>
      </div>

      {/* Configuraciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Préstamo de Libros */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Préstamo de Libros</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de préstamo (duración)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="90"
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-center text-lg font-medium"
                  value={config.diasPrestamoLibros}
                  onChange={(e) => handleChange('diasPrestamoLibros', e.target.value)}
                />
                <span className="text-gray-500">días</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Cuántos días puede un usuario tener un libro prestado</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de anticipación para reservar
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="30"
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-center text-lg font-medium"
                  value={config.diasAnticipacionLibros}
                  onChange={(e) => handleChange('diasAnticipacionLibros', e.target.value)}
                />
                <span className="text-gray-500">días</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Con cuánta anticipación se puede reservar un libro</p>
            </div>
          </div>
        </div>

        {/* Reserva de Cubículos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Reserva de Cubículos</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de anticipación para reservar
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="30"
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-center text-lg font-medium"
                  value={config.diasAnticipacionCubiculos}
                  onChange={(e) => handleChange('diasAnticipacionCubiculos', e.target.value)}
                />
                <span className="text-gray-500">días</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Con cuánta anticipación se puede reservar un cubículo</p>
            </div>
          </div>
        </div>

        {/* Reserva de Laptops */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💻 Reserva de Laptops</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de anticipación para reservar
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="30"
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-center text-lg font-medium"
                  value={config.diasAnticipacionLaptops}
                  onChange={(e) => handleChange('diasAnticipacionLaptops', e.target.value)}
                />
                <span className="text-gray-500">días</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Con cuánta anticipación se puede reservar una laptop</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">ℹ️ Información</h3>
          <p className="text-sm text-purple-700">
            Los cambios en la configuración afectarán las nuevas reservas y préstamos. 
            Las reservas y préstamos existentes mantendrán sus fechas originales.
          </p>
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

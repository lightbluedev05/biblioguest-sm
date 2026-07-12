import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, MapPin, Filter, X, AlertCircle } from 'lucide-react';

// Atomic Design: Atoms
const Button = ({ children, variant = 'primary', onClick, disabled, className = '' }) => {
  const variants = {
    primary: 'bg-gray-800 text-white hover:bg-gray-700',
    secondary: 'bg-white text-gray-800 border-2 border-gray-800 hover:bg-gray-50',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ type = 'text', placeholder, value, onChange, className = '' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-800 bg-white ${className}`}
  />
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Atomic Design: Molecules
const CubiculoCard = ({ cubiculo, onReservar }) => {
  const estadoColor = {
    disponible: 'success',
    ocupado: 'danger',
    mantenimiento: 'warning'
  };
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Cubículo #{cubiculo.idCubiculo}</h3>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <MapPin size={16} />
            Biblioteca {cubiculo.idBiblioteca}
          </p>
        </div>
        <Badge variant={estadoColor[cubiculo.estado]}>
          {cubiculo.estado}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 mb-4 text-gray-700">
        <Users size={20} />
        <span className="font-medium">Capacidad: {cubiculo.capacidad} personas</span>
      </div>
      
      {cubiculo.estado === 'disponible' && (
        <Button onClick={() => onReservar(cubiculo)} className="w-full">
          Reservar Cubículo
        </Button>
      )}
    </div>
  );
};



const FilterPanel = ({ filters, onChange, onClear }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <Filter size={20} />
        Filtros
      </h3>
      <Button variant="ghost" onClick={onClear}>Limpiar</Button>
    </div>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
        <Input
          type="date"
          value={filters.fecha || ''}
          onChange={(e) => onChange('fecha', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad Mínima</label>
        <Input
          type="number"
          placeholder="Ej: 2"
          value={filters.capacidadMin || ''}
          onChange={(e) => onChange('capacidadMin', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad Máxima</label>
        <Input
          type="number"
          placeholder="Ej: 8"
          value={filters.capacidadMax || ''}
          onChange={(e) => onChange('capacidadMax', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Biblioteca</label>
        <Input
          type="number"
          placeholder="ID Biblioteca"
          value={filters.idBiblioteca || ''}
          onChange={(e) => onChange('idBiblioteca', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <select
          value={filters.estado || ''}
          onChange={(e) => onChange('estado', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-800 bg-white"
        >
          <option value="">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="ocupado">Ocupado</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>
    </div>
  </div>
);

// Modal para crear reserva
const ModalReserva = ({ cubiculo, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    miembros: ''
  });
  
  const handleSubmit = () => {
    const miembrosArray = formData.miembros.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    onSubmit({
      idCubiculo: cubiculo.idCubiculo,
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      miembros: miembrosArray
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50
  transition-opacity duration-300 ease-out">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nueva Reserva</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Cubículo #{cubiculo.idCubiculo}</p>
          <p className="text-sm text-gray-600">Capacidad: {cubiculo.capacidad} personas</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <Input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora Inicio</label>
              <Input
                type="time"
                value={formData.horaInicio}
                onChange={(e) => setFormData({...formData, horaInicio: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fin</label>
              <Input
                type="time"
                value={formData.horaFin}
                onChange={(e) => setFormData({...formData, horaFin: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IDs de Miembros (separados por coma)
            </label>
            <Input
              placeholder="Ej: 10, 15, 20"
              value={formData.miembros}
              onChange={(e) => setFormData({...formData, miembros: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 3 participantes incluyéndote</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Crear Reserva
          </Button>
        </div>
      </div>
    </div>
  );
};

// Atomic Design: Organisms & Templates
const Cubiculos = () => {
  const [cubiculos, setCubiculos] = useState([]);
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedCubiculo, setSelectedCubiculo] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentUserId] = useState(1); // ID del usuario actual (hardcoded para demo)
  
  // Simulación de datos (en producción usar API real)
  useEffect(() => {
    // Simular carga de cubículos
    setCubiculos([
      { idCubiculo: 1, capacidad: 4, idBiblioteca: 1, estado: 'disponible' },
      { idCubiculo: 2, capacidad: 6, idBiblioteca: 1, estado: 'disponible' },
      { idCubiculo: 3, capacidad: 8, idBiblioteca: 2, estado: 'ocupado' },
      { idCubiculo: 4, capacidad: 4, idBiblioteca: 2, estado: 'disponible' },
    ]);
  }, []);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const handleReservar = (cubiculo) => {
    setSelectedCubiculo(cubiculo);
    setShowModal(true);
  };
  
  const handleCreateReserva = (data) => {
    console.log('Crear reserva:', data);
    // Aquí iría el POST a /reservaCubiculo
    showNotification('Reserva creada exitosamente');
    setShowModal(false);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters({...filters, [key]: value});
  };
  
  const handleClearFilters = () => {
    setFilters({});
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-600' : 
          notification.type === 'warning' ? 'bg-yellow-600' : 
          'bg-red-600'
        } text-white`}>
          <AlertCircle size={20} />
          {notification.message}
        </div>
      )}
      
      {/* Header */}
      <header>
        <div className="mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Reserva de Cubículos</h1>
          <p className="text-gray-600 mt-1">Encuentra y reserva tu espacio de estudio</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cubiculos.map(cubiculo => (
                <CubiculoCard
                  key={cubiculo.idCubiculo}
                  cubiculo={cubiculo}
                  onReservar={handleReservar}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal */}
      {showModal && selectedCubiculo && (
        <ModalReserva
          cubiculo={selectedCubiculo}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateReserva}
        />
      )}
    </div>
  );
};

export default Cubiculos;
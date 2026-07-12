import React, { useState, useEffect } from 'react';
import { Laptop, BookOpen, Gift, Package, Calendar, User, CheckCircle, Clock, Heart, Sparkles, ArrowRight, X } from 'lucide-react';

// Atomic Design: Atoms
const Button = ({ children, variant = 'primary', onClick, disabled, className = '' }) => {
  const variants = {
    primary: 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105',
    secondary: 'bg-white text-gray-800 border-2 border-gray-800 hover:bg-gray-50 hover:scale-105',
    success: 'bg-green-600 text-white hover:bg-green-700 hover:scale-105',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-800'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', placeholder, value, onChange, required, className = '' }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800 bg-white transition-all duration-300 hover:border-gray-400 ${className}`}
    />
  </div>
);

const TextArea = ({ label, placeholder, value, onChange, required, rows = 4 }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800 bg-white transition-all duration-300 hover:border-gray-400 resize-none"
    />
  </div>
);

const Select = ({ label, options, value, onChange, required }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800 bg-white transition-all duration-300 hover:border-gray-400"
    >
      <option value="">Seleccionar...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Badge = ({ children, variant = 'default', icon: Icon }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800'
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${variants[variant]} animate-pulse`}>
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
};

// Atomic Design: Molecules
const DonationTypeCard = ({ type, icon: Icon, title, description, examples, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden cursor-pointer rounded-2xl p-8 border-3 transition-all duration-500 transform hover:scale-105 hover:rotate-1 ${
      selected 
        ? 'border-gray-800 bg-gradient-to-br from-white to-gray-50 shadow-2xl scale-105' 
        : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-xl'
    }`}
  >
    {selected && (
      <div className="absolute top-4 right-4 animate-bounce">
        <CheckCircle className="text-green-600" size={32} />
      </div>
    )}
    
    <div className={`mb-6 inline-block p-4 rounded-2xl transition-all duration-500 ${
      selected ? 'bg-gray-800 text-white scale-110 rotate-12' : 'bg-gray-100 text-gray-800'
    }`}>
      <Icon size={40} />
    </div>
    
    <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
    
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">Ejemplos:</p>
      <ul className="space-y-1">
        {examples.map((example, idx) => (
          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            {example}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const DonationCard = ({ donation }) => {
  const statusConfig = {
    pendiente: { variant: 'warning', icon: Clock, label: 'En Revisión' },
    aprobada: { variant: 'success', icon: CheckCircle, label: 'Aprobada' },
    rechazada: { variant: 'default', icon: X, label: 'Rechazada' },
    entregada: { variant: 'purple', icon: Gift, label: 'Entregada' }
  };
  
  const config = statusConfig[donation.estado];
  const Icon = donation.tipo === 'laptop' ? Laptop : BookOpen;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-gray-800 group-hover:text-white transition-all duration-300">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{donation.titulo}</h3>
            <p className="text-sm text-gray-500">
              {donation.tipo === 'laptop' ? 'Laptop' : 'Libro'}
            </p>
          </div>
        </div>
        <Badge variant={config.variant} icon={config.icon}>
          {config.label}
        </Badge>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{donation.descripcion}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{donation.fecha}</span>
        </div>
        {donation.cantidad && (
          <div className="flex items-center gap-2">
            <Package size={16} />
            <span>{donation.cantidad} unidad(es)</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Form Components
const LaptopForm = ({ formData, onChange }) => (
  <div className="space-y-6 animate-fadeIn">
    <Input
      label="Marca"
      placeholder="Ej: HP, Dell, Lenovo..."
      value={formData.marca}
      onChange={(e) => onChange('marca', e.target.value)}
      required
    />
    
    <Input
      label="Modelo"
      placeholder="Ej: Pavilion 15, Inspiron 5000..."
      value={formData.modelo}
      onChange={(e) => onChange('modelo', e.target.value)}
      required
    />
    
    <Select
      label="Estado"
      options={[
        { value: 'nuevo', label: 'Nuevo' },
        { value: 'usado_excelente', label: 'Usado - Excelente' },
        { value: 'usado_bueno', label: 'Usado - Bueno' },
        { value: 'usado_regular', label: 'Usado - Regular' }
      ]}
      value={formData.estado}
      onChange={(e) => onChange('estado', e.target.value)}
      required
    />
    
    <Input
      label="Procesador"
      placeholder="Ej: Intel Core i5, AMD Ryzen 5..."
      value={formData.procesador}
      onChange={(e) => onChange('procesador', e.target.value)}
    />
    
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="RAM"
        placeholder="Ej: 8GB, 16GB..."
        value={formData.ram}
        onChange={(e) => onChange('ram', e.target.value)}
      />
      
      <Input
        label="Almacenamiento"
        placeholder="Ej: 256GB SSD, 1TB HDD..."
        value={formData.almacenamiento}
        onChange={(e) => onChange('almacenamiento', e.target.value)}
      />
    </div>
    
    <TextArea
      label="Descripción adicional"
      placeholder="Cuéntanos más sobre el estado, accesorios incluidos, etc."
      value={formData.descripcion}
      onChange={(e) => onChange('descripcion', e.target.value)}
      rows={4}
    />
  </div>
);

const LibroForm = ({ formData, onChange }) => (
  <div className="space-y-6 animate-fadeIn">
    <Input
      label="Título del libro"
      placeholder="Ej: Cien años de soledad, El Quijote..."
      value={formData.titulo}
      onChange={(e) => onChange('titulo', e.target.value)}
      required
    />
    
    <Input
      label="Autor"
      placeholder="Ej: Gabriel García Márquez..."
      value={formData.autor}
      onChange={(e) => onChange('autor', e.target.value)}
      required
    />
    
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Editorial"
        placeholder="Ej: Planeta, Alfaguara..."
        value={formData.editorial}
        onChange={(e) => onChange('editorial', e.target.value)}
      />
      
      <Input
        label="Año de publicación"
        type="number"
        placeholder="Ej: 2020"
        value={formData.año}
        onChange={(e) => onChange('año', e.target.value)}
      />
    </div>
    
    <Select
      label="Categoría"
      options={[
        { value: 'ficcion', label: 'Ficción' },
        { value: 'no_ficcion', label: 'No Ficción' },
        { value: 'academico', label: 'Académico' },
        { value: 'tecnico', label: 'Técnico' },
        { value: 'infantil', label: 'Infantil' },
        { value: 'otro', label: 'Otro' }
      ]}
      value={formData.categoria}
      onChange={(e) => onChange('categoria', e.target.value)}
      required
    />
    
    <Select
      label="Estado"
      options={[
        { value: 'nuevo', label: 'Nuevo' },
        { value: 'como_nuevo', label: 'Como nuevo' },
        { value: 'bueno', label: 'Bueno' },
        { value: 'aceptable', label: 'Aceptable' }
      ]}
      value={formData.estado}
      onChange={(e) => onChange('estado', e.target.value)}
      required
    />
    
    <Input
      label="Cantidad"
      type="number"
      placeholder="¿Cuántos ejemplares donarás?"
      value={formData.cantidad}
      onChange={(e) => onChange('cantidad', e.target.value)}
      required
    />
    
    <TextArea
      label="Descripción adicional"
      placeholder="Información adicional sobre el libro..."
      value={formData.descripcion}
      onChange={(e) => onChange('descripcion', e.target.value)}
      rows={4}
    />
  </div>
);

// Main App
const Donaciones = () => {
  const [activeTab, setActiveTab] = useState('donar');
  const [donationType, setDonationType] = useState(null);
  const [formData, setFormData] = useState({});
  const [misDonaciones, setMisDonaciones] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Simular carga de donaciones del usuario
    setMisDonaciones([
      {
        id: 1,
        tipo: 'laptop',
        titulo: 'HP Pavilion 15',
        descripcion: 'Laptop en buen estado, procesador i5',
        estado: 'aprobada',
        fecha: '2025-12-01'
      },
      {
        id: 2,
        tipo: 'libro',
        titulo: 'Cien años de soledad',
        descripcion: 'Libro en excelente estado',
        estado: 'entregada',
        fecha: '2025-11-28',
        cantidad: 2
      },
      {
        id: 3,
        tipo: 'libro',
        titulo: 'Clean Code',
        descripcion: 'Libro técnico de programación',
        estado: 'pendiente',
        fecha: '2025-12-05'
      }
    ]);
  }, []);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  
  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const handleSubmit = () => {
    console.log('Donación enviada:', { tipo: donationType, ...formData });
    
    // Simular envío exitoso
    setShowConfetti(true);
    showNotification('¡Gracias por tu generosidad! Tu donación ha sido registrada exitosamente.');
    
    setTimeout(() => {
      setShowConfetti(false);
      setDonationType(null);
      setFormData({});
    }, 3000);
  };
  
  const resetForm = () => {
    setDonationType(null);
    setFormData({});
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Heart className="text-red-500" size={20} />
            </div>
          ))}
        </div>
      )}
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-slideIn ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          <Gift size={24} />
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}
      
      <header className="text-black">
        <div className="mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div>
              <h1 className="text-4xl font-bold">Sistema de Donaciones</h1>
              <p className="text-gray-900 mt-1 flex items-center gap-2">
                <Sparkles size={16} />
                Comparte conocimiento, transforma vidas
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto px-6">
          <div className="flex gap-2 -mb-px">
            <button
              onClick={() => setActiveTab('donar')}
              className={`px-8 py-4 font-semibold transition-all duration-300 rounded-t-2xl flex items-center gap-2
                ${activeTab === 'donar'
                  ? 'text-gray-900 bg-white border-b-4 border-amber-500 shadow-md scale-105'
                  : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border-b-2'}
              `}
            >
              <Gift size={20} />
              Hacer Donación
            </button>
            <button
              onClick={() => setActiveTab('mis-donaciones')}
              className={`px-8 py-4 font-semibold transition-all duration-300 rounded-t-2xl flex items-center gap-2
                ${activeTab === 'mis-donaciones'
                  ? 'text-gray-900 bg-white border-b-4 border-amber-500 shadow-md scale-105'
                  : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border-b-2'}
              `}
            >
              <Package size={20} />
              Mis Donaciones
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto px-6 py-12">
        {activeTab === 'donar' && (
          <div className="space-y-8">
            {!donationType ? (
              <>
                <div className="text-center mb-12 animate-fadeIn">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    ¿Qué te gustaría donar hoy?
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Tu generosidad ayuda a estudiantes a acceder a recursos educativos.
                    Selecciona el tipo de donación que deseas realizar.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  <DonationTypeCard
                    type="laptop"
                    icon={Laptop}
                    title="Donar Laptop"
                    description="Comparte tecnología y facilita el aprendizaje digital"
                    examples={[
                      'Laptops en buen estado',
                      'Con o sin cargador',
                      'Cualquier marca y modelo'
                    ]}
                    selected={donationType === 'laptop'}
                    onClick={() => setDonationType('laptop')}
                  />
                  
                  <DonationTypeCard
                    type="libro"
                    icon={BookOpen}
                    title="Donar Libros"
                    description="El conocimiento se multiplica cuando se comparte"
                    examples={[
                      'Libros académicos',
                      'Literatura general',
                      'Libros técnicos'
                    ]}
                    selected={donationType === 'libro'}
                    onClick={() => setDonationType('libro')}
                  />
                </div>
              </>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 animate-slideUp">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gray-800 text-white rounded-2xl">
                        {donationType === 'laptop' ? <Laptop size={32} /> : <BookOpen size={32} />}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                          {donationType === 'laptop' ? 'Donar Laptop' : 'Donar Libros'}
                        </h2>
                        <p className="text-gray-600">Completa la información de tu donación</p>
                      </div>
                    </div>
                    <button
                      onClick={resetForm}
                      className="p-3 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div>
                    {donationType === 'laptop' ? (
                      <LaptopForm formData={formData} onChange={handleFormChange} />
                    ) : (
                      <LibroForm formData={formData} onChange={handleFormChange} />
                    )}
                    
                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                      <Button variant="secondary" onClick={resetForm} className="flex-1">
                        Cancelar
                      </Button>
                      <Button onClick={handleSubmit} className="flex-1">
                        Enviar Donación
                        <ArrowRight className="inline ml-2" size={20} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'mis-donaciones' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Mis Donaciones
              </h2>
              <p className="text-gray-600 text-lg">
                Historial de todas tus contribuciones
              </p>
            </div>
            
            {misDonaciones.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                  <Package size={48} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Aún no has realizado donaciones</p>
                <Button onClick={() => setActiveTab('donar')} className="mt-6">
                  Hacer mi primera donación
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {misDonaciones.map(donacion => (
                  <DonationCard key={donacion.id} donation={donacion} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(30px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-confetti {
          animation: confetti 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Donaciones;
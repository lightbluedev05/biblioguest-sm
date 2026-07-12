import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../shared/hooks/useAuth";

// =========================================================================
// ⚙️ CONFIGURACIÓN DE API Y RUTAS
// =========================================================================
const API_CONFIG = {
  BASE_URL: "http://localhost:3000", 
  ENDPOINTS: {
    LAPTOPS: "/laptop",
    DISPONIBILIDAD: "/reservaLaptop/disponibilidad",
    CREAR_RESERVA: "/reservaLaptop"
  }
};

// =========================================================================
// 🛠️ FUNCIONES DE AYUDA
// =========================================================================
const convertTimeToInt = (timeString) => {
  if (!timeString) return "";
  const [time, modifier] = timeString.split(" ");
  let [hours] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = parseInt(hours, 10) + 12;
  return parseInt(hours, 10);
};

const convertTimeToString24 = (timeString) => {
    if (!timeString) return "00:00";
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours}:${minutes}`;
};

const calculateEndTime = (startTimeStr, durationStr) => {
    if(!startTimeStr || !durationStr) return "00:00";
    let startHour = convertTimeToInt(startTimeStr);
    const duration = parseInt(durationStr.split(" ")[0]); 
    const endHour = startHour + duration;
    return `${endHour}:00`; 
};

// =========================================================================
// 🎨 COMPONENTE DE TARJETA DE LAPTOP
// =========================================================================
function LaptopCard({ laptop, onReserve }) {
  const statusConfig = {
    disponible: { label: "Disponible", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" },
    "en uso": { label: "En uso", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" },
    baja: { label: "Fuera de servicio", color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-50" },
    mantenimiento: { label: "Mantenimiento", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" }
  };

  // Determinar estado actual
  const status = statusConfig[laptop.status] || statusConfig.baja;
  
  // Lógica corregida: 
  // La tarjeta es "usable" si el estado es disponible.
  // No nos importa aquí si seleccionó hora o no (eso se valida al hacer click).
  const isPhysicallyAvailable = laptop.status === 'disponible';

  return (
    <div className={`rounded-lg border-2 p-4 transition-all ${
      isPhysicallyAvailable 
        ? 'border-blue-200 bg-white hover:border-blue-400 hover:shadow-md' // Estilo activo
        : 'border-gray-200 bg-gray-50 opacity-60' // Estilo inactivo/gris
    }`}>
      {/* Header con nombre y estado */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${isPhysicallyAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
            {laptop.name}
          </h3>
          <p className={`text-sm ${isPhysicallyAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
            {laptop.os}
          </p>
        </div>
        
        {/* Indicador de Estado */}
        <div className={`px-3 py-1 rounded-full ${status.bgColor} flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
          <span className={`text-xs font-medium ${status.textColor}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Información adicional */}
      <div className="space-y-1 mb-4">
        <p className={`text-sm ${isPhysicallyAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
          <span className="font-medium">Marca:</span> {laptop.brand}
        </p>
        <p className={`text-sm ${isPhysicallyAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
          <span className="font-medium">Serie:</span> {laptop.serialNumber}
        </p>
      </div>

      {/* Botón de reserva */}
      <button
        onClick={() => onReserve(laptop)} // Siempre llama a onReserve, la validación de hora está allá
        disabled={!isPhysicallyAvailable} // Solo deshabilita si está en uso o baja
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isPhysicallyAvailable
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isPhysicallyAvailable ? 'Reservar' : 'No disponible'}
      </button>
    </div>
  );
}

// =========================================================================
// ⚛️ COMPONENTE PRINCIPAL
// =========================================================================
function LaptopReservationPage() {
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    duration: "",
    searchQuery: "",
    os: "",
    brand: "",
    availability: "todas"
  });

  const { usuario } = useAuth();
  const [allLaptops, setAllLaptops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const startTimeOptions = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
    "07:00 PM", "08:00 PM"
  ];
  const durationOptions = ["1 hora", "2 horas"];

  // Opciones dinámicas
  const osOptions = useMemo(() => {
    const uniqueOS = [...new Set(allLaptops.map(l => l.os))].filter(Boolean);
    return uniqueOS.map(os => ({ value: os, label: os }));
  }, [allLaptops]);

  const brandOptions = useMemo(() => {
    const uniqueBrands = [...new Set(allLaptops.map(l => l.brand))].filter(Boolean);
    return uniqueBrands.map(brand => ({ value: brand, label: brand }));
  }, [allLaptops]);

  const availabilityOptions = [
    { value: "todas", label: "Todas" },
    { value: "disponible", label: "Disponibles" },
    { value: "no_disponible", label: "No disponibles" }
  ];

  // ---------------------------------------------------------
  // 1. GET (Cargar TODAS las laptops)
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // 1. GET (Cargar laptops usando endpoint adecuado)
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchLaptops = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LAPTOPS}`;
        let isAvailabilitySearch = false;

        // Si tenemos hora y duración, usamos el endpoint de disponibilidad
        if (filters.date && filters.startTime && filters.duration) {
             const horaInicioNum = convertTimeToInt(filters.startTime);
             const duracionNum = parseInt(filters.duration.split(" ")[0]);

             params.append('fecha', filters.date);
             params.append('horaInicioNum', horaInicioNum);
             params.append('duracionHoras', duracionNum);
             
             url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISPONIBILIDAD}`;
             isAvailabilitySearch = true;
        } else {
            // Búsqueda general por fecha (aunque el backend de /laptop ignorará fecha)
            if (filters.date) params.append('fecha', filters.date);
        }

        // Filtros comunes
        if (filters.os) params.append('sistemaOperativo', filters.os);
        if (filters.brand) params.append('marca', filters.brand);

        const fullUrl = `${url}?${params.toString()}`;
        console.log("Fetching laptops:", fullUrl);

        const response = await fetch(fullUrl);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonResponse = await response.json();
        
        // Manejar diferencias en la estructura de respuesta
        // /laptop -> { body: { data: [...] } } o { body: [...] }
        // /reservaLaptop/disponibilidad -> { body: [...] } (según implementación común)
        let rawData = [];
        if (jsonResponse.body && Array.isArray(jsonResponse.body)) {
            rawData = jsonResponse.body;
        } else if (jsonResponse.body && jsonResponse.body.data) {
            rawData = jsonResponse.body.data;
        } else if (Array.isArray(jsonResponse)) {
            rawData = jsonResponse; // Por si acaso devuelve array directo
        }

        const mappedLaptops = rawData.map(laptop => {
            const brand = laptop.MARCA || laptop.marca || "";
            const model = laptop.MODELO || laptop.modelo || "";
            const name = `${brand} ${model}`.trim() || `Laptop ${laptop.ID_LAPTOP || laptop.idLaptop}`;

            return {
                id: laptop.ID_LAPTOP || laptop.idLaptop, 
                name: name,
                os: laptop.SISTEMA_OPERATIVO || laptop.sistemaOperativo,
                brand: brand,
                serialNumber: laptop.NUMERO_SERIE || model, 
                status: isAvailabilitySearch ? 'disponible' : laptop.ESTADO, 
                timeSlots: startTimeOptions,
                durations: durationOptions
            };
        });

        setAllLaptops(mappedLaptops);

      } catch (error) {
        console.error("Error cargando laptops:", error);
        setAllLaptops([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Agregar startTime y duration a dependencias para reactivar búsqueda
    fetchLaptops();
  }, [filters.date, filters.os, filters.brand, filters.startTime, filters.duration]);

  // ---------------------------------------------------------
  // 2. Filtrado Local
  // ---------------------------------------------------------
  const filteredLaptops = useMemo(() => {
    let result = allLaptops;

    if (filters.availability === "disponible") {
      result = result.filter(laptop => laptop.status === 'disponible');
    } else if (filters.availability === "no_disponible") {
      result = result.filter(laptop => laptop.status !== 'disponible');
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(laptop =>
        laptop.name.toLowerCase().includes(query) ||
        laptop.serialNumber.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allLaptops, filters.searchQuery, filters.availability]);

  // ---------------------------------------------------------
  // 3. POST (Reservar)
  // ---------------------------------------------------------
  const handleReserve = async (laptop) => {
    // AQUÍ es donde validamos si seleccionó hora.
    // Si no lo hizo, mostramos alerta, pero el botón en la tarjeta SÍ era clickeable.
    if (!filters.startTime || !filters.duration) {
        alert("⚠️ ATENCIÓN:\nPor favor selecciona una HORA DE INICIO y DURACIÓN en los filtros de arriba para confirmar tu reserva.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    if (!usuario || !usuario.id) {
        alert("Error: Usuario no identificado. Por favor inicie sesión nuevamente.");
        return;
    }

    const payload = {
        idUsuario: usuario.id,
        idLaptop: laptop.id,
        fecha: filters.date,
        horaInicio: convertTimeToString24(filters.startTime),
        horaFin: calculateEndTime(filters.startTime, filters.duration),
        idBibliotecario: null
    };

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREAR_RESERVA}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        console.log(payload)
        console.log("Respuesta de reserva:", response);

        if (response.ok) {
            alert(`✅ ¡Reserva Exitosa!\nEquipo: ${laptop.name}\nFecha: ${filters.date}\nHora: ${filters.startTime}`);
            setFilters({ ...filters });
        } else {
          const errorData = await response.json();
          const backendMsg = errorData.message || "Error desconocido";
          alert(`❌ No se pudo reservar: ${backendMsg}`);
        }
    } catch (error) {
        console.error("Error en reserva:", error);
        alert(`Error de conexión: ${error.message}`);
    }
  };

  // Variable para mostrar aviso visual arriba, pero no bloqueante
  const isTimeSelected = filters.startTime && filters.duration;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reserva de Laptops</h1>

        {/* Panel de Filtros */}
        <div className={`bg-white rounded-lg shadow-sm p-6 mb-6  transition-colors`}>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h2>
             {!isTimeSelected && (
                 <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 animate-pulse">
                     ⚠️ Selecciona Hora y Duración
                 </span>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Hora Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora Inicio <span className="text-red-500">*</span></label>
              <select
                value={filters.startTime}
                onChange={(e) => setFilters({...filters, startTime: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!filters.startTime ? 'border-amber-400 bg-amber-50' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar hora</option>
                {startTimeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Duración */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duración <span className="text-red-500">*</span></label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters({...filters, duration: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!filters.duration ? 'border-amber-400 bg-amber-50' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar duración</option>
                {durationOptions.map(dur => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>
            </div>

            {/* Disponibilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters({...filters, availability: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availabilityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Sistema Operativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sistema Operativo</label>
              <select
                value={filters.os}
                onChange={(e) => setFilters({...filters, os: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                {osOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({...filters, brand: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                {brandOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por nombre o serie..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Laptops Encontradas ({filteredLaptops.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Cargando laptops...</p>
            </div>
          ) : filteredLaptops.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No se encontraron laptops con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLaptops.map(laptop => (
                <LaptopCard
                  key={laptop.id}
                  laptop={laptop}
                  onReserve={handleReserve}
                  // Ya no pasamos 'isAvailable={canReserve}' aquí para no bloquear visualmente
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LaptopReservationPage;
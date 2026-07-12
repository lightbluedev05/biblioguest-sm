/**
 * Servicio para gestionar préstamos de libros
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Obtener préstamos de un usuario
 * @param {number} idUsuario - ID del usuario
 * @param {Object} filtros - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Lista de préstamos
 */
export const getMisPrestamos = async (idUsuario, filtros = {}, token = null) => {
  try {
    const params = new URLSearchParams();
    params.append('idUsuario', idUsuario);

    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const headers = {
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/prestamoLibro?${params.toString()}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un préstamo
 * @param {number} idPrestamo - ID del préstamo
 * @returns {Promise<Object>} - Detalle del préstamo
 */
export const getPrestamoDetalle = async (idPrestamo) => {
  try {
    const response = await fetch(`${API_URL}/prestamoLibro/${idPrestamo}/detalle`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener detalle del préstamo:', error);
    throw error;
  }
};

/**
 * Cancelar un préstamo
 * @param {number} idPrestamo - ID del préstamo
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const cancelarPrestamo = async (idPrestamo, token) => {
  try {
    const response = await fetch(`${API_URL}/prestamoLibro/${idPrestamo}/cancelar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.body || `Error HTTP: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error al cancelar préstamo:', error);
    throw error;
  }
};

/**
 * Mapear préstamo del backend al formato del frontend
 * @param {Object} prestamo - Préstamo desde el backend
 * @returns {Object} - Préstamo adaptado para el frontend
 */
export const mapPrestamoToFrontend = (prestamo) => {
  return {
    id: prestamo.ID_PRESTAMO || prestamo.idPrestamo,
    idUsuario: prestamo.ID_USUARIO || prestamo.idUsuario,
    idEjemplar: prestamo.ID_EJEMPLAR || prestamo.idEjemplar,
    idBibliotecario: prestamo.ID_BIBLIOTECARIO || prestamo.idBibliotecario,
    fechaSolicitud: prestamo.FECHA_SOLICITUD || prestamo.fechaSolicitud,
    fechaInicio: prestamo.FECHA_INICIO || prestamo.fechaInicio,
    fechaFin: prestamo.FECHA_FIN || prestamo.fechaFin,
    fechaDevolucion: prestamo.FECHA_DEVOLUCION_REAL || prestamo.fechaDevolucionReal,
    estado: prestamo.ESTADO || prestamo.estado,
    // Datos del libro (desde /detalle)
    libro: prestamo.libro ? {
      id: prestamo.libro.ID_LIBRO || prestamo.libro.idLibro,
      titulo: prestamo.libro.TITULO || prestamo.libro.titulo,
      isbn: prestamo.libro.ISBN || prestamo.libro.isbn,
      editorial: prestamo.libro.EDITORIAL || prestamo.libro.editorial
    } : null,
    // Datos del ejemplar
    ejemplar: prestamo.ejemplar ? {
      id: prestamo.ejemplar.ID_EJEMPLAR || prestamo.ejemplar.idEjemplar,
      codigoBarra: prestamo.ejemplar.CODIGO_BARRA || prestamo.ejemplar.codigoBarra
    } : null,
    // Estado formateado
    estadoLabel: getEstadoLabel(prestamo.ESTADO || prestamo.estado),
    estadoColor: getEstadoColor(prestamo.ESTADO || prestamo.estado)
  };
};

function getEstadoLabel(estado) {
  const labels = {
    'activo': 'Activo',
    'finalizado': 'Devuelto',
    'atrasado': 'Atrasado',
    'cancelado': 'Cancelado',
    'pendiente': 'Pendiente'
  };
  return labels[estado?.toLowerCase()] || estado || 'Desconocido';
}

function getEstadoColor(estado) {
  const colors = {
    'activo': 'bg-blue-100 text-blue-800 border-blue-200',
    'finalizado': 'bg-green-100 text-green-800 border-green-200',
    'atrasado': 'bg-red-100 text-red-800 border-red-200',
    'cancelado': 'bg-gray-100 text-gray-800 border-gray-200',
    'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };
  return colors[estado?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
}

/**
 * Formatear fecha para mostrar
 * @param {string} fecha - Fecha en formato ISO o DD/MM/YYYY
 * @returns {string} - Fecha formateada
 */
export const formatDate = (fecha) => {
  if (!fecha) return '-';

  // Si viene como ISO string o date string
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return fecha;

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

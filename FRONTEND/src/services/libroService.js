/**
 * Servicio para gestionar las llamadas al backend de libros
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Obtener lista de libros con filtros opcionales
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.titulo - Filtrar por título
 * @param {string} params.isbn - Filtrar por ISBN
 * @param {string} params.editorial - Filtrar por editorial
 * @param {number} params.anio - Filtrar por año
 * @param {number} params.page - Página actual (default: 1)
 * @param {number} params.limit - Items por página (default: 20)
 * @returns {Promise<Object>} - Lista de libros con paginación
 */
export const getLibros = async (params = {}) => {
  try {
    const searchParams = new URLSearchParams();

    if (params.titulo) searchParams.append('titulo', params.titulo);
    if (params.isbn) searchParams.append('isbn', params.isbn);
    if (params.editorial) searchParams.append('editorial', params.editorial);
    if (params.anio) searchParams.append('anio', params.anio);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);

    const url = `${API_URL}/libro?${searchParams.toString()}`;
    const response = await fetch(url, {
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
    console.error('Error al obtener libros:', error);
    throw error;
  }
};

/**
 * Obtener un libro por su ID (sin detalles relacionados)
 * @param {number} id - ID del libro
 * @returns {Promise<Object>} - Datos básicos del libro
 */
export const getLibro = async (id) => {
  try {
    const response = await fetch(`${API_URL}/libro/${id}`, {
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
    console.error('Error al obtener libro:', error);
    throw error;
  }
};

/**
 * Obtener un libro con toda su información relacionada (autores, categorías, etiquetas)
 * @param {number} id - ID del libro
 * @returns {Promise<Object>} - Libro con autores, categorías y etiquetas
 */
export const getLibroDetalle = async (id) => {
  try {
    const response = await fetch(`${API_URL}/libro/${id}/detalle`, {
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
    console.error('Error al obtener detalle del libro:', error);
    throw error;
  }
};

/**
 * Obtener lista de categorías disponibles
 * @returns {Promise<Object>} - Lista de categorías
 */
export const getCategorias = async () => {
  try {
    const response = await fetch(`${API_URL}/categoria`, {
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
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

/**
 * Obtener lista de etiquetas disponibles
 * @returns {Promise<Object>} - Lista de etiquetas
 */
export const getEtiquetas = async () => {
  try {
    const response = await fetch(`${API_URL}/etiqueta`, {
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
    console.error('Error al obtener etiquetas:', error);
    throw error;
  }
};

/**
 * Obtener ejemplares disponibles de un libro
 * @param {number} idLibro - ID del libro
 * @returns {Promise<Object>} - Lista de ejemplares
 */
export const getEjemplaresLibro = async (idLibro) => {
  try {
    const response = await fetch(`${API_URL}/ejemplar?idLibro=${idLibro}&estado=disponible`, {
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
    console.error('Error al obtener ejemplares:', error);
    throw error;
  }
};

/**
 * Solicitar préstamo de un libro (crear préstamo)
 * @param {Object} prestamo - Datos del préstamo
 * @param {number} prestamo.idUsuario - ID del usuario
 * @param {number} prestamo.idEjemplar - ID del ejemplar a prestar
 * @param {string} prestamo.fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} prestamo.fechaFin - Fecha de fin (YYYY-MM-DD)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const solicitarPrestamo = async (prestamo, token) => {
  try {
    const response = await fetch(`${API_URL}/prestamoLibro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(prestamo)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.body || `Error HTTP: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error al solicitar préstamo:', error);
    throw error;
  }
};

/**
 * Mapear libro del backend al formato del frontend
 * @param {Object} libroBackend - Libro desde el backend
 * @returns {Object} - Libro adaptado para el frontend
 */
export const mapLibroToFrontend = (libroBackend) => {
  // El backend puede devolver campos en MAYÚSCULAS o camelCase
  return {
    id: libroBackend.ID_LIBRO || libroBackend.idLibro,
    titulo: libroBackend.TITULO || libroBackend.titulo,
    subtitulo: libroBackend.SUBTITULO || libroBackend.subtitulo || '',
    isbn: libroBackend.ISBN || libroBackend.isbn || '',
    editorial: libroBackend.EDITORIAL || libroBackend.editorial || '',
    edicion: libroBackend.NRO_EDICION || libroBackend.nroEdicion || null,
    anio: libroBackend.ANIO || libroBackend.anio || null,
    // Campos adicionales para compatibilidad con componentes existentes
    title: libroBackend.TITULO || libroBackend.titulo,
    author: libroBackend.EDITORIAL || libroBackend.editorial || 'Editorial desconocida',
    category: 'General', // Se llena desde detalle
    status: 'Disponible',
    rating: 4.5, // Placeholder
    imageUrl: `https://placehold.co/300x450/${getRandomColor()}/FFFFFF?text=${encodeURIComponent((libroBackend.TITULO || libroBackend.titulo || 'Libro').substring(0, 10))}`
  };
};

/**
 * Mapear detalle del libro incluyendo autores, categorías y etiquetas
 * @param {Object} detalleBackend - Detalle del libro desde el backend
 * @returns {Object} - Libro con toda la información adaptada
 */
export const mapLibroDetalleToFrontend = (detalleBackend) => {
  const libro = detalleBackend.libro || detalleBackend;

  return {
    ...mapLibroToFrontend(libro),
    autores: (detalleBackend.autores || libro.autores || []).map(a => ({
      id: a.ID_AUTOR || a.idAutor,
      nombre: a.NOMBRE || a.nombre,
      apellido: a.APELLIDO || a.apellido,
      nacionalidad: a.NACIONALIDAD || a.nacionalidad,
      nombreCompleto: `${a.NOMBRE || a.nombre || ''} ${a.APELLIDO || a.apellido || ''}`.trim()
    })),
    categorias: (detalleBackend.categorias || libro.categorias || []).map(c => ({
      id: c.ID_CATEGORIA || c.idCategoria,
      nombre: c.NOMBRE || c.nombre,
      descripcion: c.DESCRIPCION || c.descripcion
    })),
    etiquetas: (detalleBackend.etiquetas || libro.etiquetas || []).map(e => ({
      id: e.ID_ETIQUETA || e.idEtiqueta,
      nombre: e.NOMBRE || e.nombre,
      descripcion: e.DESCRIPCION || e.descripcion
    })),
    // Nuevos campos de disponibilidad desde la query con JOINs
    ejemplaresDisponibles: detalleBackend.ejemplaresDisponibles || libro.ejemplaresDisponibles || 0,
    totalEjemplares: detalleBackend.totalEjemplares || libro.totalEjemplares || 0
  };
};

// Colores para las portadas de libros
const BOOK_COLORS = ['E8A03E', '3B6C9D', '2D2D2D', 'D9232D', '6B8E23', '8B4513', '4682B4', '9932CC'];

function getRandomColor() {
  return BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)];
}

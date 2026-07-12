import { useState, useEffect, useMemo, useContext } from 'react';
import { CheckCircle, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { ActiveReservationNotification } from '../components/moleculas/ActiveReservationNotification';
import { FilterControls } from '../components/moleculas/FilterControls';
import { BookGrid } from '../components/organismos/BookGrid';
import { BookDetailModal } from '../components/moleculas/BookDetailModal';
import { Modal } from '../components/atomos/Modal';
import { getLibros, getCategorias, mapLibroToFrontend } from '../../../../services/libroService';
import { AuthContext } from '../../../../shared/context/AuthContext';

export default function LibrosPage() {
  // Estado de autenticación
  const authContext = useContext(AuthContext);
  const { usuario, token, isAuthenticated } = authContext || {};

  // Estados de datos
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedEditorial, setSelectedEditorial] = useState('');
  const [selectedAnio, setSelectedAnio] = useState('');

  // Estado para modal de detalle
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Estado de reserva activa (para compatibilidad)
  const [activeReservation, setActiveReservation] = useState(null);

  // Estado para notificaciones
  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });

  // Cargar libros del backend
  useEffect(() => {
    loadBooks();
  }, [searchTerm, selectedEditorial, selectedAnio]);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {};
      if (searchTerm.trim()) params.titulo = searchTerm.trim();
      if (selectedEditorial) params.editorial = selectedEditorial;
      if (selectedAnio) params.anio = selectedAnio;
      params.limit = 50; // Cargar bastantes libros

      const response = await getLibros(params);
      const rawBooks = response.body?.data || response.body || [];

      // Mapear libros al formato del frontend
      const mappedBooks = (Array.isArray(rawBooks) ? rawBooks : []).map(mapLibroToFrontend);
      setBooks(mappedBooks);

    } catch (err) {
      console.error('Error cargando libros:', err);
      setError('No se pudieron cargar los libros. Verifica la conexión con el servidor.');
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategorias();
      const rawCategories = response.body?.data || response.body || [];

      const categoryNames = (Array.isArray(rawCategories) ? rawCategories : [])
        .map(c => c.NOMBRE || c.nombre)
        .filter(Boolean);

      setCategories(['Todos', ...categoryNames]);
    } catch (err) {
      console.error('Error cargando categorías:', err);
      // Mantener categorías por defecto
    }
  };

  // Extraer editoriales únicas para filtro
  const editorialOptions = useMemo(() => {
    const editorials = [...new Set(books.map(b => b.editorial).filter(Boolean))];
    return editorials;
  }, [books]);

  // Extraer años únicos para filtro
  const anioOptions = useMemo(() => {
    const years = [...new Set(books.map(b => b.anio).filter(Boolean))].sort((a, b) => b - a);
    return years;
  }, [books]);

  // Filtrado local por categoría (el resto se hace en el backend)
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesCategory =
        selectedCategory === 'Todos' ||
        book.category === selectedCategory ||
        (book.categorias && book.categorias.some(c => c.nombre === selectedCategory));

      return matchesCategory;
    });
  }, [books, selectedCategory]);

  const handleShowModal = (title, message) => {
    setModalInfo({ show: true, title, message });
  };

  const handleViewDetail = (book) => {
    setSelectedBookId(book.id);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedBookId(null);
  };

  const handleReserve = (book) => {
    if (activeReservation) {
      handleShowModal(
        'Límite de Reserva Alcanzado',
        `Ya tienes una reserva activa para "${activeReservation.titulo}". Solo puedes reservar un libro a la vez.`
      );
    } else {
      // Abrir modal de detalle para hacer el préstamo
      handleViewDetail(book);
    }
  };

  const handleCancelReservation = (book) => {
    setActiveReservation(null);
    handleShowModal(
      'Reserva Cancelada',
      `Has cancelado tu reserva de "${book.titulo || book.title}".`
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
      {/* Título y Encabezado */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Catálogo de Libros</h1>
        <p className="text-lg text-gray-600">
          Explora, filtra y reserva tu próxima lectura.
          {isAuthenticated && usuario && (
            <span className="ml-2 text-[#3B6C9D] font-medium">
              Bienvenido, {usuario.nombres || usuario.nombre || 'Estudiante'}
            </span>
          )}
        </p>
      </header>

      {/* Notificación de Reserva Activa */}
      <ActiveReservationNotification
        reservedBook={activeReservation}
        onCancel={() => handleCancelReservation(activeReservation)}
      />

      {/* Controles de Filtro */}
      <FilterControls
        searchTerm={searchTerm}
        onSearch={(e) => setSearchTerm(e.target.value)}
        category={selectedCategory}
        onCategoryChange={(e) => setSelectedCategory(e.target.value)}
        categories={categories}
        editorial={selectedEditorial}
        onEditorialChange={(e) => setSelectedEditorial(e.target.value)}
        editorialOptions={editorialOptions}
        anio={selectedAnio}
        onAnioChange={(e) => setSelectedAnio(e.target.value)}
        anioOptions={anioOptions}
      />

      {/* Estado de carga */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={48} className="animate-spin text-[#D9232D] mb-4" />
          <p className="text-lg text-gray-600">Cargando libros...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={loadBooks}
            className="px-6 py-2 bg-[#D9232D] text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        /* Cuadrícula de Libros */
        <BookGrid
          books={filteredBooks}
          activeReservationId={activeReservation ? activeReservation.id : null}
          onReserve={handleReserve}
          onCancel={handleCancelReservation}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* Modal de Detalle de Libro */}
      <BookDetailModal
        show={showDetailModal}
        onClose={handleCloseDetail}
        bookId={selectedBookId}
        isAuthenticated={isAuthenticated}
        usuario={usuario}
        token={token}
      />

      {/* Modal para Notificaciones */}
      <Modal
        show={modalInfo.show}
        title={modalInfo.title}
        onClose={() => setModalInfo({ ...modalInfo, show: false })}
      >
        <div className="flex items-center gap-3">
          <CheckCircle size={40} className="text-green-500" />
          <p>{modalInfo.message}</p>
        </div>
      </Modal>
    </div>
  );
}
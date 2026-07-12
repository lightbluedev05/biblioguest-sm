import { BookOpen } from 'lucide-react';
import { BookCard } from '../moleculas/BookCard';

/**
 * Cuadrícula de libros con manejo de estado vacío
 */
export const BookGrid = ({ books, onReserve, onCancel, onViewDetail, activeReservationId }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BookOpen size={48} className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold">No se encontraron libros</h3>
        <p>Intenta ajustar tus filtros de búsqueda o verifica la conexión con el servidor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map(book => {
        const bookId = book.id || book.idLibro || book.ID_LIBRO;
        const isReserved = activeReservationId === bookId;
        // Deshabilita si hay una reserva activa Y NO es este libro
        const isDisabled = activeReservationId !== null && activeReservationId !== bookId;

        return (
          <BookCard
            key={bookId}
            book={book}
            isReserved={isReserved}
            isDisabled={isDisabled}
            onReserve={() => onReserve(book)}
            onCancel={() => onCancel(book)}
            onViewDetail={() => onViewDetail && onViewDetail(book)}
          />
        );
      })}
    </div>
  );
};
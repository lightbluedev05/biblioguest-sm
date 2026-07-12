import { Star, Eye } from 'lucide-react';
import { BookCover } from '../atomos/BookCover';
import { Button } from '../atomos/Button';
import { Badge } from '../atomos/Badge';

/**
 * Tarjeta de libro con información básica y acciones
 * Adaptado para trabajar con datos del backend
 */
export const BookCard = ({ book, onReserve, onCancel, onViewDetail, isReserved, isDisabled }) => {
  // Normalizar campos (soporta tanto formato mock como backend)
  const titulo = book.titulo || book.title || 'Sin título';
  const autor = book.author || book.editorial || 'Sin autor';
  const categoria = book.category || (book.categorias && book.categorias[0]?.nombre) || 'General';
  const anio = book.anio || book.year || null;
  const rating = book.rating || 4.5;
  const imageUrl = book.imageUrl || `https://placehold.co/300x450/3B6C9D/FFFFFF?text=${encodeURIComponent(titulo.substring(0, 10))}`;

  return (
    <div className="bg-[#FFFFFF] rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transition-all transform hover:-translate-y-1 hover:shadow-xl duration-300 group">
      {/* Portada con overlay para ver detalle */}
      <div className="relative">
        <BookCover src={imageUrl} alt={titulo} />

        {/* Overlay al hacer hover */}
        <div
          onClick={() => onViewDetail && onViewDetail(book)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
        >
          <div className="bg-white/90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Eye size={24} className="text-[#2D2D2D]" />
          </div>
        </div>
      </div>

      {/* Información del libro */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-center mb-1">
          <Badge>{categoria}</Badge>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={16} fill="currentColor" />
            <span className="font-bold text-sm text-[#2D2D2D]">{rating}</span>
          </div>
        </div>

        <h3
          className="text-lg font-bold text-[#2D2D2D] truncate cursor-pointer hover:text-[#D9232D] transition-colors"
          title={titulo}
          onClick={() => onViewDetail && onViewDetail(book)}
        >
          {titulo}
        </h3>

        <p className="text-sm text-gray-600 truncate" title={autor}>
          {autor}
        </p>

        {anio && (
          <p className="text-xs text-gray-400 mt-1">
            Año: {anio}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* Botón Ver Detalle */}
        <button
          onClick={() => onViewDetail && onViewDetail(book)}
          className="w-full py-2 px-4 bg-[#3B6C9D] text-white rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          Ver Detalle
        </button>

        {/* Botón Reservar/Cancelar */}
        {isReserved ? (
          <Button variant="accent" onClick={onCancel} className="w-full">
            Cancelar Reserva
          </Button>
        ) : (
          <Button variant="secondary" onClick={onReserve} disabled={isDisabled} className="w-full">
            {isDisabled ? "Reserva no disponible" : "Reservar Ahora"}
          </Button>
        )}
      </div>
    </div>
  );
};
import { Search, Building2, Calendar } from 'lucide-react';

/**
 * Controles de filtro para el catálogo de libros
 * Incluye búsqueda, categoría, editorial y año
 */
export const FilterControls = ({
  searchTerm,
  onSearch,
  category,
  onCategoryChange,
  categories = ['Todos'],
  editorial,
  onEditorialChange,
  editorialOptions = [],
  anio,
  onAnioChange,
  anioOptions = []
}) => (
  <div className="bg-[#FFFFFF] p-4 rounded-lg shadow-md mb-8">
    {/* Primera fila: Búsqueda y Categoría */}
    <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
      {/* Barra de Búsqueda */}
      <div className="relative w-full md:flex-1">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={onSearch}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg text-[#2D2D2D] focus:outline-none focus:border-[#E8A03E] transition-colors"
        />
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Selector de Categoría */}
      <div className="relative w-full md:w-auto md:min-w-[180px]">
        <select
          value={category}
          onChange={onCategoryChange}
          className="w-full appearance-none bg-gray-100 border-2 border-gray-200 text-[#2D2D2D] py-3 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-[#E8A03E]"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    {/* Segunda fila: Filtros adicionales */}
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Filtro por Editorial */}
      {editorialOptions.length > 0 && (
        <div className="relative flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={14} className="text-gray-500" />
            <label className="text-xs font-medium text-gray-500 uppercase">Editorial</label>
          </div>
          <select
            value={editorial}
            onChange={onEditorialChange}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-[#2D2D2D] py-2 px-3 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-[#3B6C9D] text-sm"
          >
            <option value="">Todas las editoriales</option>
            {editorialOptions.map(ed => (
              <option key={ed} value={ed}>{ed}</option>
            ))}
          </select>
        </div>
      )}

      {/* Filtro por Año */}
      {anioOptions.length > 0 && (
        <div className="relative flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-gray-500" />
            <label className="text-xs font-medium text-gray-500 uppercase">Año</label>
          </div>
          <select
            value={anio}
            onChange={onAnioChange}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-[#2D2D2D] py-2 px-3 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-[#3B6C9D] text-sm"
          >
            <option value="">Todos los años</option>
            {anioOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {/* Espacio para equilibrar si no hay filtros adicionales */}
      {editorialOptions.length === 0 && anioOptions.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          Utiliza los filtros de arriba para buscar libros
        </p>
      )}
    </div>
  </div>
);
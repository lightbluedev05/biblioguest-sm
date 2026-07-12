export const BookCover = ({ src, alt, className = '' }) => (
  <img
    src={src}
    alt={alt}
    className={`w-full h-64 object-cover rounded-t-lg ${className}`}
    onError={(e) => { e.target.src = 'https://placehold.co/300x450/2D2D2D/FFFFFF?text=Error'; }}
  />
);
export const Badge = ({ children, className = '' }) => (
  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-[#2D2D2D] ${className}`}>
    {children}
  </span>
);
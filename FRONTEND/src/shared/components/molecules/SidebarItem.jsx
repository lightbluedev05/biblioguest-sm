import { Link } from "react-router-dom";
import { Icon } from "../atoms/Icon";

export const SidebarItem = ({ icon, text, active, isExpanded, to }) => {
  return (
    <li>
      <Link
        to={to}
        title={isExpanded ? undefined : text}
        className={`
          flex items-center p-3 my-1 rounded-lg cursor-pointer
          transition-all duration-200
          ${
            active
              ? 'bg-white/20 backdrop-blur-sm'
              : 'hover:bg-white/10'
          }
          ${!isExpanded && 'justify-center'} // Centrar ícono cuando está colapsado
        `}
      >
        <Icon icon={icon} />
        <span
          className={`
            font-medium whitespace-nowrap overflow-hidden transition-all
            ${isExpanded ? 'ml-4 opacity-100' : 'w-0 opacity-0'}
          `}
        >
          {text}
        </span>
      </Link>
    </li>
  );
};
import { Button } from "./Button";
import { X } from 'lucide-react';

export const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <header className="flex items-center justify-between p-4 bg-[#D9232D] text-white rounded-t-lg">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
            <X size={24} />
          </button>
        </header>
        <div className="p-6 text-[#2D2D2D]">
          {children}
        </div>
        <footer className="p-4 flex justify-end">
          <Button variant="accent" onClick={onClose}>
            Entendido
          </Button>
        </footer>
      </div>
    </div>
  );
};
import { AlertCircle } from 'lucide-react';
import { Button } from '../atomos/Button';

export const ActiveReservationNotification = ({ reservedBook, onCancel }) => {
  if (!reservedBook) return null;

  return (
    <div className="bg-[#D9232D] text-white p-4 rounded-lg shadow-lg mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertCircle size={28} />
        <div>
          <h4 className="font-bold">Ya tienes una reserva activa</h4>
          <p className="text-sm">Estás reservando: "{reservedBook.title}".</p>
          <p className="text-sm">Recuerda que solo puedes tener una reserva a la vez.</p>
        </div>
      </div>
      <Button variant="accent" onClick={onCancel} className="bg-white/20 hover:bg-white/30 text-white">
        Cancelar Reserva
      </Button>
    </div>
  );
};
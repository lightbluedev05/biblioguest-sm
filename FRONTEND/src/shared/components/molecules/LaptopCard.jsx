
    import { useState, useEffect } from "react";
    import Badge from "../atoms/Badge";
    import Button from "../atoms/Button";
    import { User, Clock, Timer} from "lucide-react"

    function LaptopCard({
    name,
    os,              
    brand,
    timeSlots = [],
    durations = [],
    onReserve,
    preSelectedTime = "",
    preSelectedDuration = ""
    }) {
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedDuration, setSelectedDuration] = useState("");


    useEffect(() => {
        setSelectedTime(preSelectedTime);
    }, [preSelectedTime]);

    useEffect(() => {
        setSelectedDuration(preSelectedDuration);
    }, [preSelectedDuration]);


    const handleReserve = () => {
        if (selectedTime && selectedDuration && onReserve) {
        onReserve({
            laptop: name,
            time: selectedTime,
            duration: selectedDuration
        });
        }
    };

    const isReserveEnabled = selectedTime && selectedDuration;

    return (
        <div className="bg-surface border border-neutral/20 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header con nombre y caracteristicas*/}
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral">{name}</h3>
            <p className="text-sm text-neutral/70 mt-1">
            {brand} • {os}
            </p>
            
        </div>

        {/* selector de hora */}
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
            
            <span className="text-neutral text-sm"><Clock/></span>
            <span className="text-sm font-semibold text-neutral">Hora</span>
            </div>
            <div className="flex flex-wrap gap-2">
            {timeSlots.map((time) => (
                <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`
                    px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${selectedTime === time
                    ? "bg-secondary text-white border-secondary"
                    : "bg-surface text-neutral border-neutral/30 hover:border-secondary/50"
                    }
                `}
                >
                {time}
                </button>
            ))}
            </div>
        </div>

        {/* Selector de duracion */}
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
            <span className="text-neutral text-sm"><Timer className="w-7 h-7"/></span>
            <span className="text-sm font-semibold text-neutral">Duración</span>
            </div>
            <div className="flex flex-wrap gap-2">
            {durations.map((duration) => (
                <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`
                    px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${selectedDuration === duration
                    ? "bg-secondary text-white border-secondary"
                    : "bg-surface text-neutral border-neutral/30 hover:border-secondary/50"
                    }
                `}
                >
                {duration}
                </button>
            ))}
            </div>
        </div>

        {/* Boton de reservar */}
        <Button
            variant={isReserveEnabled ? "primary" : "secondary"}
            onClick={handleReserve}
            disabled={!isReserveEnabled}
        >
            Reservar
        </Button>
        </div>
    );
    }

    export default LaptopCard;
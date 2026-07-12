    import {useState} from "react";
    import LaptopCard from "../molecules/LaptopCard";
    import SearchBar from "../molecules/SearchBar";

    function LaptopList({
    laptops = [],
    onReserve,
    onSearch,
    selectedStartTime,
    selectedDuration,
    searchPlaceholder = "Nombre de la Laptop..."
    }) {

        const [searchValue, setSearchValue] = useState("");

        const handleSearch = () => {
            if (onSearch) {
            onSearch(searchValue);
            }
        };

        
    
    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Buscador */}
        <div className="flex justify-center">
            <div className="w-full max-w-2xl">
            <SearchBar
                placeholder={searchPlaceholder}
                buttonLabel="Buscar"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
            />
            </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-neutral font-semibold">
            {laptops.length} resultado{laptops.length !== 1 ? 's' : ''}
        </div>

        {/* Lista de laptops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {laptops.length > 0 ? (
            laptops.map((laptop) => (
                <LaptopCard
                key={laptop.id}
                name={laptop.name}
                os={laptop.os}                   
                brand={laptop.brand}  
                timeSlots={laptop.timeSlots}
                durations={laptop.durations}
                onReserve={onReserve}
                preSelectedTime={selectedStartTime}
                preSelectedDuration={selectedDuration}
                />
            ))
            ) : (
            <div className="col-span-full text-center py-12 text-neutral/60">
                No se encontraron computadoras disponibles
            </div>
            )}
        </div>
        </div>
    );
    }

    export default LaptopList;
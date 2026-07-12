    import Navbar from "../../../../shared/components/organism/Navbar";
    import Footer from "../../../../shared/components/organism/Footer";
    import ReservationFilters from "../../../../shared/components/organism/ReservationFilters";
    import LaptopList from "../../../../shared/components/organism/LaptopList";

    function ReservationTemplate({
    filters,
    onFiltersChange,
    laptops,
    onReserve,
    onSearch,
    startTimeOptions,
    durationOptions,
    osOptions,          
    brandOptions, 
    selectedStartTime,
    selectedDuration
    }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">


        {/* Titulo y Encabezado */}
        <header className="mb-8">
        <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">
            Reserva de Laptops
        </h1>
        <p className="text-lg text-gray-600">
            Selecciona fecha, hora y reserva tu laptop.
        </p>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 space-y-8 bg-red-50">
            

            {/* Filtros */}
            <ReservationFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            startTimeOptions={startTimeOptions}
            durationOptions={durationOptions}
            osOptions={osOptions}           
            brandOptions={brandOptions} 
            />

            {/* Lista de laptops */}
            <LaptopList
            laptops={laptops}
            onReserve={onReserve}
            onSearch={onSearch}
            selectedStartTime={selectedStartTime}
            selectedDuration={selectedDuration}
            />
        </main>
        </div>
    );
    }

    export default ReservationTemplate;
    import DatePicker from "../atoms/DatePicker";
    import TimeRangeSelector from "./TimeRangeSelector";
    import Select from "../atoms/Select";

    function FilterGroup({
    date,
    onDateChange,
    startTime,
    onStartTimeChange,
    duration,
    onDurationChange,
    os,                  
    onOsChange,          
    brand,               
    onBrandChange,
    startTimeOptions = [],
    durationOptions = [],
    
    osOptions = [],      
    brandOptions = []
    }) {



    return (
        <div className="bg-surface p-6 rounded-lg shadow-md space-y-4">
        {/* Selector de fecha */}
        <div>
            
            <DatePicker
            label="¿Qué día?"
            value={date}
            onChange={onDateChange} 
            
            min={new Date().toISOString().split('T')[0]}
            />
        </div>

        {/* Selector de rango de tiempo */}
        <TimeRangeSelector
            startTime={startTime}
            duration={duration}
            onStartTimeChange={onStartTimeChange}
            onDurationChange={onDurationChange}
            startTimeOptions={startTimeOptions}
            durationOptions={durationOptions}
        />


        {/* selector del SO */}
        <div>
            <Select
            label="Sistema Operativo"
            value={os}
            onChange={onOsChange}
            options={osOptions}
            placeholder="Seleccionar SO..."
            />
        </div>

        {/* selector de marca */}
        <div>
            <Select
            label="Marca"
            value={brand}
            onChange={onBrandChange}
            options={brandOptions}
            placeholder="Seleccionar marca..."
            />
        </div>

    
        
        </div>
    );
    }

    export default FilterGroup;
    import TimePicker from "../atoms/TimePicker";

    function TimeRangeSelector({
    startTime,
    duration,
    onStartTimeChange,
    onDurationChange,
    startTimeOptions = [],
    durationOptions = []
    }) {
    return (
        <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* hora de inicio */}
        <div className="flex-1">
            <TimePicker
            label="¿A partir de qué hora?"
            value={startTime}
            onChange={onStartTimeChange}
            options={startTimeOptions}
            />
        </div>

        {/* duracion */}
        <div className="flex-1">
            <TimePicker
            label="¿Por cuánto tiempo?"
            value={duration}
            onChange={onDurationChange}
            options={durationOptions}
            />
        </div>
        </div>
    );
    }

    export default TimeRangeSelector;
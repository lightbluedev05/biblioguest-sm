    function Input({
    label,
    type = "text",
    placeholder = "",
    value,
    onChange,
    onKeyPress,
    error = "",
    disabled = false,
    className = ""
    }) {
    return (
        <div className="flex flex-col gap-1 w-full">
        {/* Label */}
        {label && (
            <label className="text-sm font-semibold text-neutral">
            {label}
            </label>
        )}

        {/* Input */}
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            //onKeyPress={onKeyPress}
            disabled={disabled}
            className={`
            w-full px-4 py-2 rounded-lg border outline-none transition
            ${error ? "border-primary" : "border-neutral/30"}
            focus:border-secondary
            focus:ring-2 focus:ring-secondary/30
            bg-surface text-neutral
            disabled:bg-background disabled:text-neutral/60
            placeholder-neutral/50
            ${className}`}
        />

        {/* Mensaje de error */}
        {error && <span className="text-sm text-primary">{error}</span>}
        </div>
    );
    }

    export default Input;

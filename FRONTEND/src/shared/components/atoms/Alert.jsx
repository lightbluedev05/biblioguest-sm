    function Alert({ children, alertMessage, description , variant = "primary"}) {
    const variants = {
        primary: "border-l-4 border-secondary bg-secondary/10 text-secondary p-4 rounded-r-lg",
        success: "border-l-4 border-green-500 bg-green-100 text-green-700",
        warning: "border-l-4 border-yellow-500 bg-yellow-100 text-yellow-700",
        error: "border-l-4 border-red-500 bg-red-100 text-red-700",
    };
    return (
        <div className={`${variants[variant]} p-4 rounded-lg shadow`}>
        <h3 className="font-bold mb-4 text-neutral">{children}</h3>
        
            {alertMessage && <p className="font-semibold">{alertMessage}</p>}
            {description && <p className="text-sm opacity-80">{description}</p>}    
        
        </div>
    );
    }

    export default Alert;

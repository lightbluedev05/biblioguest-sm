    function Badge({ children, variant = "default", icon }) {
    const variants = {
        default: "bg-neutral/10 text-neutral border border-neutral/20",
        success: "bg-green-100 text-green-800 border border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        danger: "bg-red-100 text-red-800 border border-red-200",
        info: "bg-blue-100 text-blue-800 border border-blue-200",
    };

    return (
        <span className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
        text-xs font-semibold
        ${variants[variant]}
        `}>
        {icon && <span>{icon}</span>}
        {children}
        </span>
    );
    }

    export default Badge;
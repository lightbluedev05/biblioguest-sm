function Button({children, onClick, variant = "primary", className = "",}) {

  const variants = {
    primary: "bg-secondary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-transform duration-200 hover:scale-105",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md py-2 px-6 ",
    danger: "bg-red-600 hover:bg-red-700 text-white transition-transform duration-200 hover:scale-105",
    outline:
      "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-transform duration-200 hover:scale-105 rounded-lg shadow-md",
  };


  return (
    <button className={`${variants[variant]} ${className}` }
    onClick = {onClick}>
      {children}
    </button>
  );
}

export default Button;



export const Button = ({ children, type = "button", variant = "primary", onClick, ...props }) => {
  // Si le pasan variant="danger", lo pintamos de rojo. Si no, usa el morado del CSS.
  const customStyle = variant === "danger" 
    ? { backgroundColor: "#d32f2f" } 
    : {};

  return (
    <button 
      type={type} 
      onClick={onClick} 
      style={customStyle}
      {...props}
    >
      {children}
    </button>
  );
};
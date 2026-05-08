export const Input = ({ label, id, type = "text", ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label htmlFor={id} style={{ color: '#6a1b9a', fontWeight: 'bold', fontSize: '14px' }}>
          {label}
        </label>
      )}
      <input 
        id={id} 
        type={type} 
        {...props} 
        style={{ width: '100%', boxSizing: 'border-box' }} 
      />
    </div>
  );
};
export const Select = ({ label, id, options = [], ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label htmlFor={id} style={{ color: '#6a1b9a', fontWeight: 'bold', fontSize: '14px' }}>
          {label}
        </label>
      )}
      <select id={id} {...props} style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'white' }}>
        <option value="">Seleccione una opción...</option>
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
import React from 'react';

export const Card = ({ children, style, className }) => {
  return (
    <div style={{ ...styles.card, ...style }} className={className}>
      {children}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f8fafc', 
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }
};
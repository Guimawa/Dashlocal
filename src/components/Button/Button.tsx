import React from 'react';

export type ButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false, type = 'button' }) => (
  <button type={type} disabled={disabled} onClick={onClick} style={{
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #007bff',
    background: disabled ? '#e0e0e0' : '#007bff',
    color: disabled ? '#888' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
  }}>
    {label}
  </button>
);

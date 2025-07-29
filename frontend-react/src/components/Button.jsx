// frontend-react/src/components/Button.jsx - BOTÓN COMPLETO
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Button = ({ 
  children, 
  onClick, 
  className = '', 
  type = 'button', 
  disabled = false,
  loading = false,
  icon: Icon,
  ...props 
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center space-x-2 px-4 py-2 
        rounded-lg font-medium transition-all duration-200
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-lg transform hover:-translate-y-0.5'
        }
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <FaSpinner className="animate-spin" />
      ) : Icon ? (
        <Icon />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;

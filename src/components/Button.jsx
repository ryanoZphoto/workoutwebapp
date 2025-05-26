import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button', 
  variant = 'primary', 
  ariaLabel,
  className = '',
  ...props 
}) => {
  const baseStyles = 'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 transition-colors touch-target';
  
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-high-contrast-text',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed';
  
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${disabled ? disabledStyles : ''} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles}
      aria-label={ariaLabel || null}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

import React from 'react';

const FormField = ({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  required = false, 
  error,
  helpText,
  className = '',
  ...props
}) => {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={inputId} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-blue-500"
        {...props}
      />

      {helpText && !error && (
        <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;

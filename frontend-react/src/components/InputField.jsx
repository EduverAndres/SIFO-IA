import React from 'react';

const InputField = ({ label, id, name, type, value, onChange, placeholder, required, icon: IconComponent }) => {
  return (
    <div className="relative"> {/* Añade relative para posicionar el icono */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {IconComponent && ( // Si la prop icon existe, renderízala
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {IconComponent}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                     ${IconComponent ? 'pl-10' : ''}`} // Añade padding izquierdo si hay icono
        />
      </div>
    </div>
  );
};

export default InputField;
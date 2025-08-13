import React from 'react';

const Input = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  className = '',
  type = 'text'
}) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-gray-300 ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2 ${className}`}
        />
      </div>
    </div>
  );
};

export default Input;
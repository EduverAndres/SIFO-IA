// components/ui/Select.jsx
import React from 'react';

const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  className = ''
}) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
import React, { useRef } from 'react';

const FileInput = ({ label, id, onChange, fileName, error, ...props }) => {
  const fileInputRef = useRef(null);

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Limpiar el input file
    }
    onChange({ target: { name: id, value: null, files: [] } }); // Simular un evento de cambio
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="file"
          id={id}
          name={id}
          onChange={onChange}
          ref={fileInputRef}
          className={`shadow appearance-none border ${error ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
          {...props}
        />
        {fileName && (
          <div className="ml-2 flex items-center text-gray-600 text-sm">
            <span>{fileName}</span>
            <button
              type="button"
              onClick={handleClearFile}
              className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
              aria-label="Eliminar archivo"
            >
              &times;
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default FileInput;
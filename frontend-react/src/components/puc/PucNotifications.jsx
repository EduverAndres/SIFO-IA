// components/puc/PucNotifications.jsx
import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';

const PucNotifications = ({ error, success, onClearError, onClearSuccess }) => {
  if (!error && !success) return null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
          <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
          </div>
          <button 
            onClick={onClearError} 
            className="ml-auto text-red-500 hover:text-red-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
          <FaCheckCircle className="text-green-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">Éxito</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
          <button 
            onClick={onClearSuccess} 
            className="ml-auto text-green-500 hover:text-green-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default PucNotifications;
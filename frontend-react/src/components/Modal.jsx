// frontend-react/src/components/ui/Modal.jsx
import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  ...props
}) => {
  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div 
        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        {/* Center modal */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen" 
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div 
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all 
            sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]} ${className}
          `}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {title && (
                  <h3 
                    className="text-lg leading-6 font-medium text-gray-900" 
                    id="modal-title"
                  >
                    {title}
                  </h3>
                )}
                
                {showCloseButton && (
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <FaTimes className="h-6 w-6" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
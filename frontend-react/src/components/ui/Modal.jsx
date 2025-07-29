// frontend-react/src/components/ui/Modal.jsx - VERSIÓN COMPLETA
import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
  isOpen,
  show, // Compatibilidad con ambas props
  onClose,
  title,
  children,
  size = 'md',
  maxWidth = 'md', // Compatibilidad adicional
  showCloseButton = true,
  closeOnOverlayClick = true,
  closable = true, // Compatibilidad adicional
  className = '',
  ...props
}) => {
  // Normalizar la prop de visibilidad
  const isVisible = isOpen || show;

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible && closable) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose, closable]);

  if (!isVisible) return null;

  // Mapear tamaños
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  // Determinar la clase de tamaño
  const sizeClass = sizeClasses[size] || sizeClasses[maxWidth] || sizeClasses.md;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && closable && e.target === e.currentTarget) {
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
      {/* Overlay con backdrop */}
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-all duration-300"
          aria-hidden="true"
        />

        {/* Spacer element para centrar el modal */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen" 
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div 
          className={`
            inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl 
            transform transition-all duration-300 sm:my-8 sm:align-middle sm:w-full 
            ${sizeClass} ${className}
          `}
          onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer click dentro
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {title && (
                  <h3 
                    className="text-xl font-semibold text-gray-900" 
                    id="modal-title"
                  >
                    {title}
                  </h3>
                )}
                
                {showCloseButton && closable && (
                  <button
                    type="button"
                    className="ml-4 bg-white rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 p-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <FaTimes className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white px-6 pb-6 pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

// Modal.jsx
import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, title = 'Menú de Opciones' }) => {
  // Efecto para manejar el escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.keyCode === 27) {
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

  // Renderizado condicional más seguro
  if (!isOpen) {
    return null;
  }

  // Función para cerrar el modal al hacer clic en el overlay
  const handleOverlayClick = (e) => {
    // Solo cerrar si se hace clic directamente en el overlay, no en el contenido del modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Contenedor del modal con animación de entrada */}
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl mx-auto relative
                    transform transition-all duration-500 ease-out
                    scale-100 opacity-100
                    border border-blue-200"
        onClick={(e) => e.stopPropagation()} // Prevenir que el clic en el contenido cierre el modal
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold
                      p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
          aria-label="Cerrar modal"
          type="button"
        >
          &times;
        </button>

        {/* Título del modal */}
        <h2 
          id="modal-title"
          className="text-3xl font-extrabold text-blue-700 mb-8 text-center pb-4 border-b border-blue-100"
        >
          {title}
        </h2>

        {/* Contenido del modal (children) */}
        <div className="modal-content overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
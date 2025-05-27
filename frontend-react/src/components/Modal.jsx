// Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, children, title = 'Menú de Opciones' }) => {
  if (!isOpen) {
    return null; // No renderizar nada si no está abierto
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
      {/* Contenedor del modal con animación de entrada */}
      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl mx-auto relative
                    transform transition-all duration-500 ease-out
                    ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                    border border-blue-200`}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold
                      p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        {/* Título del modal */}
        <h2 className="text-3xl font-extrabold text-blue-700 mb-8 text-center pb-4 border-b border-blue-100">
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
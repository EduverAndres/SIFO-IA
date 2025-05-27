// src/components/OrdenesDeCompraMenuModal.jsx
import React from 'react';
import {
  FaPlus,            // Crear Orden
  FaUserTie,         // Crear Proveedor
  FaBoxOpen,         // Crear Producto
  FaCartPlus,        // Agregar Detalle a OC
  FaFileInvoiceDollar, // Ver Órdenes de Compra
} from 'react-icons/fa'; // Importa los iconos específicos y contextuales

const OrdenesDeCompraMenuModal = ({
  onClose,
  // openCrearOrdenModal, // Ya no se usa directamente para abrir el modal de orden
  openCrearProveedorModal, // <--- Esta es la función clave
  openCrearProductoModal,
  openAgregarDetalleModal,
  openVerOrdenesModal,
}) => {
  const baseButtonClasses = "flex flex-col items-center justify-center p-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-white font-semibold text-center";
  const iconClasses = "text-4xl mb-3"; // Iconos un poco más grandes y con más margen inferior

  // Función para manejar el clic en "Crear Orden de Compra"
  // Ahora, al hacer clic en este botón, se abre el modal de Crear Proveedor.
  const handleCrearOrdenCompraClick = () => {
    onClose(); // Cierra el modal de menú de órdenes de compra
    openCrearProveedorModal(); // Llama directamente al modal de Crear Proveedor
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm">
        <h3 className="text-2xl font-extrabold text-blue-800 text-center">
          Gestión de Órdenes de Compra
        </h3>
        <p className="text-sm text-blue-600 text-center mt-2">
          Selecciona una opción para continuar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Botón Crear Orden de Compra - MODIFICADO PARA LLAMAR DIRECTAMENTE A CREARPROVEEDORMODAL */}
        <button
          onClick={handleCrearOrdenCompraClick} // <--- CAMBIO CLAVE AQUÍ
          className={`${baseButtonClasses} bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700`}
        >
          <FaPlus className={iconClasses} />
          <span>Crear Orden de Compra</span> {/* El texto sigue siendo "Crear Orden de Compra" */}
        </button>

        {/* Botón Crear Proveedor (este también abrirá el modal de proveedor, lo cual es redundante ahora si el de arriba hace lo mismo.
           Considera si quieres mantener este botón con esta función o reasignarle otra). */}
        <button
          onClick={() => {
            openCrearProveedorModal();
            onClose();
          }}
          className={`${baseButtonClasses} bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700`}
        >
          <FaUserTie className={iconClasses} />
          <span>Crear Proveedor</span>
        </button>

        {/* Botón Crear Producto */}
        <button
          onClick={() => {
            openCrearProductoModal();
            onClose();
          }}
          className={`${baseButtonClasses} bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700`}
        >
          <FaBoxOpen className={iconClasses} />
          <span>Crear Producto</span>
        </button>

        {/* Botón Agregar Detalle a OC Existente */}
        <button
          onClick={() => {
            openAgregarDetalleModal();
            onClose();
          }}
          className={`${baseButtonClasses} bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700`}
        >
          <FaCartPlus className={iconClasses} />
          <span>Agregar Detalle a OC</span>
        </button>

        {/* Botón Ver Órdenes de Compra */}
        <button
          onClick={() => {
            openVerOrdenesModal();
            onClose();
          }}
          className={`${baseButtonClasses} bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 md:col-span-2`}
        >
          <FaFileInvoiceDollar className={iconClasses} />
          <span>Ver Órdenes de Compra</span>
        </button>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors duration-200 text-md font-medium shadow-md hover:shadow-lg"
        >
          Cerrar Menú
        </button>
      </div>
    </div>
  );
};

export default OrdenesDeCompraMenuModal;
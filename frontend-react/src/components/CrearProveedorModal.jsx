// src/components/CrearProveedorModal.jsx
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa'; // Importa el icono de flecha hacia atrás

const CrearProveedorModal = ({ onClose }) => {
  // Puedes manejar el estado del formulario aquí si quieres que los campos sean controlados
  // const [nombre, setNombre] = useState('');
  // const [contacto, setContacto] = useState('');
  // const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí manejarías la lógica para guardar el proveedor
    // Por ejemplo: enviar los datos a una API, validar, etc.
    console.log('Datos del proveedor enviados');
    // console.log('Nombre:', nombre, 'Contacto:', contacto, 'Email:', email);
    onClose(); // Cierra el modal después de guardar
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl max-w-md mx-auto relative">
      {/* Encabezado del modal con título y botón de regreso */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-extrabold text-gray-800">Crear Proveedor</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
          aria-label="Regresar al menú anterior"
        >
          <FaArrowLeft className="text-xl" />
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Nombre del proveedor"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"
            required
            // value={nombre} // Descomentar si usas estado controlado
            // onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="contacto" className="block text-sm font-semibold text-gray-700 mb-2">
            Contacto:
          </label>
          <input
            type="text"
            id="contacto"
            name="contacto"
            placeholder="Nombre del contacto"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"
            required
            // value={contacto} // Descomentar si usas estado controlado
            // onChange={(e) => setContacto(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Correo electrónico"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"
            required
            // value={email} // Descomentar si usas estado controlado
            // onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button" // Tipo 'button' para evitar que cierre el formulario automáticamente
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Regresar
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition duration-300 transform hover:-translate-y-0.5"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearProveedorModal;
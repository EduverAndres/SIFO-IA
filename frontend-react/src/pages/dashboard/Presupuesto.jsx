// src/pages/dashboard/Presupuesto.jsx (ejemplo de página en desarrollo)
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPiggyBank, 
  FaChartLine, 
  FaCog, 
  FaArrowLeft,
  FaRocket,
  FaLightbulb
} from 'react-icons/fa';

const Presupuesto = () => {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header con navegación de regreso */}
        <div className="flex items-center mb-6">
          <Link 
            to="/dashboard" 
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Volver al Dashboard</span>
          </Link>
        </div>

        {/* Contenido principal */}
        <div className="text-center py-12">
          {/* Icono principal */}
          <div className="mb-8">
            <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaPiggyBank className="text-4xl text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Módulo de Presupuesto</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Este módulo estará disponible pronto. Aquí podrás gestionar presupuestos, 
              realizar proyecciones financieras y monitorear el cumplimiento de metas.
            </p>
          </div>

          {/* Características próximamente */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              <FaRocket className="mr-2 text-blue-600" />
              Características que incluirá:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <FaChartLine className="text-3xl text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Análisis de Gastos</h3>
                <p className="text-sm text-gray-600">Seguimiento detallado de gastos por categoría</p>
              </div>
              <div className="text-center p-4">
                <FaPiggyBank className="text-3xl text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Planificación</h3>
                <p className="text-sm text-gray-600">Creación de presupuestos anuales y mensuales</p>
              </div>
              <div className="text-center p-4">
                <FaLightbulb className="text-3xl text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Alertas Inteligentes</h3>
                <p className="text-sm text-gray-600">Notificaciones cuando se excedan límites</p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">¿Tienes sugerencias?</h3>
            <p className="text-gray-600 mb-6">
              Tu opinión es importante para nosotros. Comparte tus ideas sobre qué características 
              te gustaría ver en este módulo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard/configuracion"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <FaCog className="mr-2" />
                Configurar Notificaciones
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                Explorar Otros Módulos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presupuesto;
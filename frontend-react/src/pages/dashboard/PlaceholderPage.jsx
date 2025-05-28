// src/pages/dashboard/PlaceholderPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowLeft,
  FaRocket,
  FaLightbulb,
  FaCog,
  FaChartLine,
  FaUsers,
  FaShieldAlt
} from 'react-icons/fa';

const PlaceholderPage = ({ title, icon, description }) => {
  // Descripción por defecto si no se proporciona
  const defaultDescription = `El módulo de ${title} estará disponible pronto. Aquí podrás gestionar todas las funcionalidades relacionadas con ${title.toLowerCase()}.`;

  // Características genéricas que se mostrarán
  const features = [
    {
      icon: FaChartLine,
      title: 'Análisis Detallado',
      description: `Obtén insights profundos sobre ${title.toLowerCase()}`
    },
    {
      icon: FaUsers,
      title: 'Colaboración',
      description: 'Trabaja en equipo de manera eficiente'
    },
    {
      icon: FaShieldAlt,
      title: 'Seguridad',
      description: 'Datos protegidos con los más altos estándares'
    }
  ];

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
              <span className="text-4xl">{icon}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description || defaultDescription}
            </p>
          </div>

          {/* Características próximamente */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              <FaRocket className="mr-2 text-blue-600" />
              Características que incluirá:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="text-center p-4">
                    <IconComponent className="text-3xl text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progreso de desarrollo */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center">
              <FaLightbulb className="mr-2 text-yellow-500" />
              Estado de Desarrollo
            </h3>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso</span>
                <span className="text-sm font-medium text-gray-700">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-1/4 transition-all duration-300"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Planificación completada. Iniciando desarrollo...
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="bg-white rounded-xl shadow-lg p-8">
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

export default PlaceholderPage;
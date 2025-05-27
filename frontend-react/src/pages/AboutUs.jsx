// src/pages/AboutUs.jsx (CON ANIMACIONES AÑADIDAS)
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaLightbulb,    // Usado para Visión/Ideas
  FaRocket,       // Usado para Misión/Impulso
  FaHandshake,    // Usado para Valores/Colaboración
  FaBrain,        // Usado para IA
  FaDatabase,     // Usado para Extracción de Información
  FaEye,          // Usado para el enlace "Explora nuestra Visión del Proyecto"
} from 'react-icons/fa'; // Importa iconos relevantes

// Si tienes una imagen para representar al equipo o la filosofía, puedes importarla aquí.
// import TeamImage from '../assets/team-illustration.svg';

const AboutUs = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans text-gray-900">
      {/* Header - Similar al HomePage para mantener consistencia */}
      <header className="bg-white shadow-lg px-4 md:px-8 h-20 flex items-center sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-full">
          <Link to="/" className="text-3xl font-extrabold text-blue-700 tracking-tight">
            <span className="text-indigo-600">SIFO</span>-IA
          </Link>
          <nav className="space-x-6 flex items-center h-full">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg"
            >
              Inicio
            </Link>
            <Link
              to="/aboutsifo"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg"
            >
              SIFO-IA
            </Link>

            <Link
              to="/nosotros"
              className="text-blue-600 font-semibold transition duration-300 ease-in-out text-lg border-b-2 border-blue-600 pb-1"
            >
              Nosotros
            </Link>
            <Link
              to="/vision"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg"
            >
              Visión del Proyecto
            </Link>

            <Link
              to="/login"
              className="ml-6 px-5 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido Principal sobre Nosotros */}
      <main className="container mx-auto py-16 px-4 md:px-8">
        <section className="text-center mb-16 animate-fade-in"> {/* Animación para el título principal */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
            Conoce la Visión Detrás de <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">SIFO-IA</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Somos un equipo apasionado por la innovación y la eficiencia, construyendo el futuro de la contabilidad.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {/* Misión */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-100"> {/* Animación con retraso */}
            <div className="text-center text-blue-600 mb-6">
              <FaRocket className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Nuestra Misión</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Democratizar el acceso a herramientas contables de alta tecnología, permitiendo a empresas de todos los tamaños optimizar sus operaciones financieras y enfocarse en el crecimiento.
            </p>
          </div>

          {/* Visión (la Visión general de la empresa, no la del proyecto específico) */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-200"> {/* Animación con retraso */}
            <div className="text-center text-indigo-600 mb-6">
              <FaLightbulb className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Nuestra Visión</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Ser el software contable líder a nivel global, reconocido por su innovación impulsada por la Inteligencia Artificial, su precisión en la extracción y análisis de información financiera, y su contribución al éxito de nuestros usuarios.
            </p>
            <Link
              to="/vision"
              className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
            >
              <FaEye className="mr-2" /> Explora nuestra Visión del Proyecto
            </Link>
          </div>

          {/* Valores */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-300"> {/* Animación con retraso */}
            <div className="text-center text-green-600 mb-6">
              <FaHandshake className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Nuestros Valores</h3>
            <ul className="text-gray-600 text-lg leading-relaxed list-disc list-inside text-left">
              <li>Innovación Constante</li>
              <li>Integridad y Transparencia</li>
              <li>Orientación al Cliente</li>
              <li>Excelencia y Precisión</li>
              <li>Colaboración y Crecimiento</li>
            </ul>
          </div>
        </section>

        {/* Sección sobre IA y Extracción de Información */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-10 rounded-xl shadow-lg animate-fade-in-up animate-delay-400 md:flex md:items-center md:justify-between mb-16"> {/* Animación con retraso */}
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-4xl font-bold mb-4">La IA en el Corazón de SIFO-IA</h2>
            <p className="text-xl mb-6">
              Nuestra plataforma va más allá de la contabilidad tradicional. Hemos integrado inteligencia artificial avanzada para transformar cómo gestionas tus finanzas.
            </p>
            <div className="flex items-start mb-4">
              <FaBrain className="text-5xl mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-semibold mb-2">Análisis Predictivo</h3>
                <p className="text-lg">
                  La IA analiza tus datos históricos para identificar patrones, predecir flujos de caja y señalar posibles riesgos u oportunidades financieras antes de que ocurran.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FaDatabase className="text-5xl mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-semibold mb-2">Extracción Inteligente de Datos</h3>
                <p className="text-lg">
                  Automatizamos la extracción de información crucial de documentos (facturas, recibos, extractos) reduciendo errores manuales y ahorrándote horas de trabajo.
                </p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center mt-8 md:mt-0">
            {/* Puedes poner una imagen o ilustración aquí si tienes */}
          </div>
        </section>

        {/* Llamada a la acción final */}
        <section className="text-center bg-gray-100 p-10 rounded-xl shadow-md animate-fade-in-up animate-delay-500"> {/* Animación con retraso */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4">¿Quieres saber más?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Contacta con nuestro equipo o explora nuestras soluciones.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/contact"
              className="inline-block bg-blue-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:-translate-y-1"
            >
              Contáctanos
            </Link>
            <Link
              to="/aboutsifo"
              className="inline-block bg-transparent border-2 border-blue-600 text-blue-600 font-bold py-3.5 px-8 rounded-full shadow-lg hover:bg-blue-50 transition duration-300 transform hover:-translate-y-1"
            >
              Nuestras Soluciones
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm mt-12">
        &copy; {new Date().getFullYear()} SIFO-IA. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default AboutUs;
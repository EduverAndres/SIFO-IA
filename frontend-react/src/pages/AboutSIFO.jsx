// src/pages/AboutSIFO.jsx (CON ANIMACIONES AÑADIDAS)
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBrain,        // Icono para IA
  FaCalculator,   // Icono para Contabilidad
  FaChartLine,    // Icono para Análisis/Tendencias
  FaLightbulb,    // Icono para Innovación
  FaShieldAlt,    // Icono para Seguridad/Confianza
  FaLaptopCode,   // Icono para Software
} from 'react-icons/fa'; // Importa iconos relevantes

// Puedes crear o usar una imagen existente para esta sección, o dejarla sin imagen por ahora.
// import SIFOAIImage from '../assets/sifo-ai-illustration.svg'; // Si tienes una ilustración específica

const AboutSIFO = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans text-gray-900">
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
              to="/aboutsifo" // Resaltar este enlace cuando estemos en esta página
              className="text-blue-600 font-semibold transition duration-300 ease-in-out text-lg border-b-2 border-blue-600 pb-1"
            >
              SIFO-IA
            </Link>

            <Link
              to="/nosotros"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg"
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

      {/* Contenido Principal sobre SIFO-IA */}
      <main className="container mx-auto py-16 px-4 md:px-8">
        <section className="text-center mb-16 animate-fade-in"> {/* APLICADA ANIMACIÓN */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
            Descubre el Poder de <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">SIFO-IA</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            SIFO-IA es un software de contabilidad de vanguardia, potenciado por la inteligencia artificial, diseñado para revolucionar la gestión financiera de tu negocio.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {/* Característica 1: Contabilidad Inteligente */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-100"> {/* APLICADA ANIMACIÓN CON RETRASO */}
            <div className="text-center text-blue-600 mb-6">
              <FaCalculator className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Contabilidad Automatizada</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Simplifica tus registros contables con automatización inteligente. Desde la categorización de transacciones hasta la generación de informes, SIFO-IA se encarga de las tareas repetitivas.
            </p>
          </div>

          {/* Característica 2: Análisis Predictivo con IA */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-200"> {/* APLICADA ANIMACIÓN CON RETRASO */}
            <div className="text-center text-indigo-600 mb-6">
              <FaBrain className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Inteligencia Financiera Avanzada</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Nuestra IA analiza tus datos financieros para predecir tendencias, identificar anomalías y ofrecerte insights valiosos que te ayudan a tomar decisiones estratégicas proactivas.
            </p>
          </div>

          {/* Característica 3: Informes Dinámicos */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-300"> {/* APLICADA ANIMACIÓN CON RETRASO */}
            <div className="text-center text-green-600 mb-6">
              <FaChartLine className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Reportes Personalizados</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Genera informes financieros claros y concisos en tiempo real. Personaliza tus dashboards para visualizar solo la información que necesitas, cuándo la necesitas.
            </p>
          </div>

          {/* Característica 4: Seguridad y Cumplimiento */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-400"> {/* APLICADA ANIMACIÓN CON RETRASO */}
            <div className="text-center text-red-600 mb-6">
              <FaShieldAlt className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Máxima Seguridad</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Protege tus datos financieros con los más altos estándares de seguridad y garantiza el cumplimiento normativo con un sistema que se adapta a las regulaciones cambiantes.
            </p>
          </div>

          {/* Característica 5: Interfaz Intuitiva */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-500"> {/* APLICADA ANIMACIÓN CON RETRASO */}
            <div className="text-center text-purple-600 mb-6">
              <FaLaptopCode className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Experiencia de Usuario Superior</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Diseñado pensando en ti. SIFO-IA ofrece una interfaz limpia, intuitiva y fácil de usar, permitiéndote gestionar tus finanzas sin complicaciones.
            </p>
          </div>

          {/* Característica 6: Soporte Continuo */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-600"> {/* APLICADA ANIMACIÓN CON RETRASO */}
            <div className="text-center text-yellow-600 mb-6">
              <FaLightbulb className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Innovación Constante</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Estamos comprometidos con la mejora continua. Recibe actualizaciones regulares y nuevas funcionalidades que mantendrán tu sistema a la vanguardia tecnológica.
            </p>
          </div>
        </section>

        {/* Llamada a la acción final */}
        <section className="text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in-up animate-delay-700"> {/* APLICADA ANIMACIÓN CON RETRASO */}
          <h2 className="text-4xl font-bold mb-4">¿Listo para transformar tu contabilidad?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a la nueva era de la gestión financiera con SIFO-IA.
          </p>
          <Link
            to="/login" // O a una página de registro/contacto si la tienes
            className="inline-block bg-white text-blue-600 font-bold py-3.5 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Comienza Ahora
          </Link>
        </section>
      </main>

      {/* Footer - Similar al HomePage */}
      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm mt-12">
        &copy; {new Date().getFullYear()} SIFO-IA. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default AboutSIFO;
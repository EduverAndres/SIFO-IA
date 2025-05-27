// src/pages/ProjectVision.jsx (CON ANIMACIONES AÑADIDAS)
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaEye,            // Usado para Visión
  FaGlobe,          // Usado para Alcance Global
  FaLightbulb,      // Usado para Innovación/Futuro
  FaUsersCog,       // Usado para Colaboración/Ecosistema
  FaHandshake,      // Usado para Impacto
  FaDatabase,       // Asegurado de que esté IMPORTADO AQUI
} from 'react-icons/fa'; // Importa iconos relevantes

const ProjectVision = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans text-gray-900">
      {/* Header - Similar a otros componentes para mantener consistencia */}
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
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg"
            >
              Nosotros
            </Link>
            <Link
              to="/vision" // Resaltar este enlace cuando estemos en esta página
              className="text-blue-600 font-semibold transition duration-300 ease-in-out text-lg border-b-2 border-blue-600 pb-1"
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

      {/* Contenido Principal de la Visión del Proyecto */}
      <main className="container mx-auto py-16 px-4 md:px-8">
        <section className="text-center mb-16 animate-fade-in"> {/* Animación para el título principal */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
            Nuestra <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Visión a Futuro</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            En SIFO-IA, miramos hacia el futuro con una visión clara de cómo transformaremos la gestión contable y financiera.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {/* Pilar 1: Liderazgo en Contabilidad IA */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-100"> {/* Animación con retraso */}
            <div className="text-center text-blue-600 mb-6">
              <FaEye className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Software Contable Líder con IA</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Consolidar SIFO-IA como la plataforma contable de referencia a nivel global, reconocida por su robustez, su capacidad de adaptación a las necesidades de cada mercado y su integración superior de inteligencia artificial.
            </p>
          </div>

          {/* Pilar 2: Excelencia en Extracción de Información */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-200"> {/* Animación con retraso */}
            <div className="text-center text-indigo-600 mb-6">
              <FaDatabase className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Procesos de Extracción de Información sin Fallos</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Perfeccionar nuestros algoritmos de IA para ofrecer una precisión del 100% en la extracción, clasificación y análisis de datos financieros de cualquier formato, eliminando completamente la entrada manual de datos y sus errores asociados.
            </p>
          </div>

          {/* Pilar 3: Ecosistema Financiero Conectado */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-300"> {/* Animación con retraso */}
            <div className="text-center text-green-600 mb-6">
              <FaGlobe className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Creación de un Ecosistema Financiero Global</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Desarrollar una red interconectada de servicios y aplicaciones financieras, donde SIFO-IA sea el hub central, facilitando la colaboración entre empresas, contadores y entidades bancarias a nivel mundial.
            </p>
          </div>

          {/* Pilar 4: Personalización y Adaptabilidad */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-400"> {/* Animación con retraso */}
            <div className="text-center text-red-600 mb-6">
              <FaUsersCog className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Experiencia Totalmente Personalizable</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Ofrecer una plataforma que se adapte de forma inteligente y dinámica a las necesidades únicas de cada usuario y empresa, desde la configuración de reportes hasta la automatización de flujos de trabajo específicos.
            </p>
          </div>

          {/* Pilar 5: Impacto en la Toma de Decisiones */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-500"> {/* Animación con retraso */}
            <div className="text-center text-purple-600 mb-6">
              <FaHandshake className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Impulsor de Decisiones Estratégicas</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Transformar los datos contables en inteligencia accionable, permitiendo a nuestros usuarios tomar decisiones financieras más informadas, rápidas y estratégicas que impulsen su crecimiento y sostenibilidad a largo plazo.
            </p>
          </div>

          {/* Pilar 6: Innovación Continua y Liderazgo Tecnológico */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in-up animate-delay-600"> {/* Animación con retraso */}
            <div className="text-center text-yellow-600 mb-6">
              <FaLightbulb className="text-6xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Vanguardia Tecnológica Constante</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Mantenernos a la vanguardia de las tecnologías emergentes (IA, Blockchain, Big Data), integrándolas para asegurar que SIFO-IA siempre ofrezca las soluciones más avanzadas y eficientes del mercado.
            </p>
          </div>
        </section>

        {/* Llamada a la acción final */}
        <section className="text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in-up animate-delay-700"> {/* Animación con retraso */}
          <h2 className="text-4xl font-bold mb-4">Únete a nuestra visión del futuro financiero</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Descubre cómo SIFO-IA está redefiniendo la contabilidad con inteligencia artificial.
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-blue-600 font-bold py-3.5 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Comienza con SIFO-IA
          </Link>
        </section>
      </main>

      {/* Footer - Similar a otros componentes */}
      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm mt-12">
        &copy; {new Date().getFullYear()} SIFO-IA. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default ProjectVision;
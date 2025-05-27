// src/pages/HomePage.jsx (VERSIÓN CORREGIDA y ESTILOS DE ALTURA APLICADOS)
import React from 'react';
import { Link } from 'react-router-dom';
import Illustration from '../assets/hero-illustration.svg';
// No necesitas importar Fa icons aquí si solo los usas en otras secciones del Dashboard,
// pero si tienes planes de añadirlos en otras secciones de la HomePage en el futuro, mantenlos.
// Por ahora, para esta sección solo se necesita el Link y Illustration.

const HomePage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans text-gray-900">
      {/* Header - Con enlace a la nueva página de Login y Dashboard */}
      {/* Se agregan clases para definir la altura y centrar verticalmente */}
      <header className="bg-white shadow-lg px-4 md:px-8 h-20 flex items-center sticky top-0 z-50"> {/* Agregado h-20 y flex items-center */}
        <div className="container mx-auto flex items-center justify-between h-full"> {/* Agregado h-full */}
          <Link to="/" className="text-3xl font-extrabold text-blue-700 tracking-tight">
            <span className="text-indigo-600">SIFO</span>-IA
          </Link>
          <nav className="space-x-6 flex items-center h-full"> {/* Agregado h-full */}
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg"
            >
              Inicio
            </Link>
            <Link
              to="/vision"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg"
            >
              Visión del Proyecto
            </Link>
            <Link
              to="/nosotros"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg"
            >
              Nosotros
            </Link>

            {/* ¡NUEVO ENLACE DE DASHBOARD! */}
            {/* Si quieres un enlace directo al Dashboard en la barra de navegación de HomePage */}

            {/* Enlace de Login */}
            <Link
              to="/login"
              className="ml-6 px-5 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Se mantiene igual */}
      <section className="container mx-auto py-24 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:w-1/2 text-center md:text-left animate-fade-in-left">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            Bienvenido a <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">SIFO-IA</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
            Tu sistema de información favorito para una gestión más eficiente.
            Simplificamos tus procesos, optimizamos tu tiempo y te ayudamos a tomar
            decisiones con mayor confianza.
          </p>
          <Link
            to="/aboutsifo" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Explorar Ahora
          </Link>
        </div>
        <div className="md:w-1/2 flex justify-center animate-fade-in-right">
          <img
            src={Illustration}
            alt="Ilustración de la página principal"
            className="w-full max-w-lg lg:max-w-xl h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </section>

      {/* Footer - Se mantiene igual */}
      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm mt-12">
        &copy; {new Date().getFullYear()} SIFO-IA. Todos los derechos reservados.
      </footer>

      {/* <DashboardModal isOpen={isDashboardModalOpen} onClose={closeDashboardModal} /> */}
      {/* <<-- ¡ELIMINAR ESTA LÍNEA COMPLETA! -->> */}
    </div>
  );
};

export default HomePage;
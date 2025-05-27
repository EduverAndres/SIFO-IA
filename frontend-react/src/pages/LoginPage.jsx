import React from 'react';
import Login from '../components/Login'; // Importa tu componente Login aquí
import { Link } from 'react-router-dom'; // Para el enlace de "volver al inicio"

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-3xl p-8 md:p-10 border border-gray-100 transform transition-all duration-500 hover:scale-[1.01] animate-fade-in-up">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center leading-tight">
          Bienvenido de nuevo
        </h2>
        <p className="text-lg text-gray-600 mb-8 text-center">Inicia sesión para acceder a tu cuenta.</p>
        <Login />
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/" className="text-blue-600 hover:underline transition duration-300">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'; // ¡NUEVO! Importa la página de Login
import RegisterPage from './pages/RegisterPage'; // ¡NUEVO! Importa la página de Registro
import Dashboard from './components/Dashboard'; // Ruta para el dashboard
import AboutSIFO from './pages/AboutSIFO'; // <--- IMPORTA LA NUEVA PÁGINA
import AboutUs from './pages/AboutUs'; // <--- IMPORTA LA NUEVA PÁGINA
import ProjectVision from './pages/ProjectVision'; // <--- IMPORTA LA NUEVA PÁGINA




function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans antialiased">
        {/*
          Aquí puedes mantener o quitar la barra de navegación.
          Si la mantienes, asegúrate de que los enlaces sean consistentes con HomePage.jsx
          En este caso, la barra de navegación ya está en HomePage.jsx,
          así que este <nav> global podría ser redundante si quieres que la navegación
          solo aparezca en HomePage. Si quieres que aparezca en todas las páginas,
          déjala, pero adapta los enlaces.
        */}
        {/* <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 shadow-lg">
          <ul className="flex justify-center space-x-8 text-white text-lg font-semibold">
            <li><Link to="/" className="hover:text-blue-200 transition duration-300">Inicio</Link></li>
            <li><Link to="/ordenes/crear" className="hover:text-blue-200 transition duration-300">Crear Orden</Link></li>
            <li><Link to="/login" className="hover:text-blue-200 transition duration-300">Login</Link></li>
            <li><Link to="/register" className="hover:text-blue-200 transition duration-300">Registro</Link></li>
          </ul>
        </nav> */}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />       {/* ¡NUEVA RUTA! */}
          <Route path="/register" element={<RegisterPage />} /> {/* ¡NUEVA RUTA! */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Ruta para el dashboard */}
          <Route path="/aboutsifo" element={<AboutSIFO />} /> {/* <--- AÑADE ESTA NUEVA RUTA */}
          <Route path="/nosotros" element={<AboutUs />} /> {/* <--- AÑADE ESTA NUEVA RUTA */}
          <Route path="/vision" element={<ProjectVision />} /> {/* <--- AÑADE ESTA NUEVA RUTA */}




          {/* Aquí puedes añadir más rutas para otras páginas de tu aplicación */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
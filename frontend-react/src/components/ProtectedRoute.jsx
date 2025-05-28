// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    // Si no hay token o usuario, redirigir al login
    return <Navigate to="/login" replace />;
  }

  try {
    // Verificar que el user data sea válido
    JSON.parse(user);
  } catch (error) {
    // Si hay error al parsear, limpiar localStorage y redirigir
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Si todo está bien, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;
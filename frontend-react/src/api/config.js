// frontend-react/src/api/config.js
import axios from 'axios';

// Configuración base de la API
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

console.log('🔧 API Configuration:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  baseURL: baseURL,
  NODE_ENV: process.env.NODE_ENV
});

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de request - para agregar token de autenticación si es necesario
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log de request en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        fullURL: config.baseURL + config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response - para manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    // Log de response en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Manejo de errores comunes
    if (error.response) {
      // Error del servidor (4xx, 5xx)
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Error 401: No autorizado');
          break;
        case 403:
          console.error('Error 403: Acceso denegado');
          break;
        case 404:
          console.error('Error 404: Recurso no encontrado');
          console.error('URL intentada:', error.config?.url);
          console.error('Base URL:', error.config?.baseURL);
          break;
        case 500:
          console.error('Error 500: Error interno del servidor');
          break;
        default:
          console.error(`Error ${status}:`, data?.message || 'Error desconocido');
      }
      
      // Retornar error estructurado
      return Promise.reject({
        status,
        message: data?.message || `Error ${status}`,
        data: data?.data || null,
        errors: data?.errors || [],
      });
    } else if (error.request) {
      // Error de red
      console.error('Error de red:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        data: null,
        errors: [],
      });
    } else {
      // Error de configuración
      console.error('Error de configuración:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message,
        data: null,
        errors: [],
      });
    }
  }
);

export default api;
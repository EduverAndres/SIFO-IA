// frontend-react/src/api/config.js - CONECTADO CON TU BACKEND
import axios from 'axios';

// Configuración base de la API para conectar con tu backend NestJS
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1', // Tu estructura de backend
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Manejo de errores
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`❌ API Error ${status}:`, {
        url: error.config?.url,
        message: data?.message,
        errors: data?.errors
      });
      
      // Crear error estructurado compatible con tu backend
      const structuredError = {
        status,
        message: data?.message || `Error ${status}`,
        data: data?.data || null,
        errors: data?.errors || [],
      };
      
      return Promise.reject(structuredError);
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Error de conexión. Verifica tu conexión a internet y que el servidor esté ejecutándose.',
        data: null,
        errors: [],
      });
    } else {
      console.error('❌ Request Setup Error:', error.message);
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

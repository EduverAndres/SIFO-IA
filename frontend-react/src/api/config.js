// frontend-react/src/api/config.js - COMPLETAMENTE LIMPIO
import axios from 'axios';

// 🎯 URL ABSOLUTAMENTE HARDCODEADA (SIN VARIABLES)
const baseURL = 'https://sifo-ia-main.onrender.com/api/v1';

console.log('🔧 [CONFIG] Base URL hardcodeada:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 [CONFIG] API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: baseURL + config.url,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ [CONFIG] Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    console.log('📥 [CONFIG] API Response:', {
      status: response.status,
      url: response.config.url,
      fullURL: baseURL + response.config.url,
    });
    
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`❌ [CONFIG] API Error ${status}:`, {
        url: error.config?.url,
        fullURL: baseURL + error.config?.url,
        status,
        data
      });
      
      return Promise.reject({
        status,
        message: data?.message || `Error ${status}`,
        data: data?.data || null,
        errors: data?.errors || [],
      });
    } else if (error.request) {
      console.error('❌ [CONFIG] Network Error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        data: null,
        errors: [],
      });
    } else {
      console.error('❌ [CONFIG] Configuration Error:', error.message);
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
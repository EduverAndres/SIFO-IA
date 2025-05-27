// frontend-react/src/api/ordenesApi.js

// Ajusta esta URL para que apunte a donde tu backend NestJS está realmente corriendo
// Según tu error, NestJS está en 3001 y React en 3000.
const API_BASE_URL = 'http://localhost:3001';

// --- Funciones existentes para órdenes de compra ---

export const getProveedores = async () => {
  const response = await fetch(`${API_BASE_URL}/proveedores`);
  if (!response.ok) {
    const errorData = await response.json(); // Intenta leer el mensaje de error del backend
    throw new Error(errorData.message || 'Error al cargar proveedores');
  }
  return response.json();
};

export const getProductos = async () => {
  const response = await fetch(`${API_BASE_URL}/productos`);
  if (!response.ok) {
    const errorData = await response.json(); // Intenta leer el mensaje de error del backend
    throw new Error(errorData.message || 'Error al cargar productos');
  }
  return response.json();
};

export const crearOrdenCompra = async (ordenData) => {
  const response = await fetch(`${API_BASE_URL}/ordenes-compra`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ordenData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Si la respuesta no es OK (ej. 4xx, 5xx), lanzar un error con el mensaje del backend
    throw new Error(data.message || 'Error al crear la orden de compra');
  }
  return data;
};

// --- NUEVAS FUNCIONES PARA AUTENTICACIÓN (LOGIN Y REGISTRO) ---

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials), // Aquí se envían email y password
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión.');
  }
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, { // <<-- Endpoint de registro
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Si la respuesta no es OK, el backend debería enviar un JSON con un mensaje de error
    throw new Error(data.message || 'Error al registrar usuario.');
  }
  return data; // Esto puede contener los datos del usuario registrado
};

// ¡Importante!: Modifica las importaciones en Login.jsx y Register.jsx
// para que apunten a este archivo:
// import { loginUser } from '../api/ordenesApi';
// import { registerUser } from '../api/ordenesApi';
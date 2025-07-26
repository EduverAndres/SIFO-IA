// frontend-react/src/api/ordenesApi.js - COMPLETAMENTE LIMPIO

// 🎯 URL ABSOLUTA HARDCODEADA (SIN VARIABLES)
const API_BASE_URL = 'https://sifo-ia-main.onrender.com/api/v1';

console.log('🔧 [API] URL Base:', API_BASE_URL);

// --- FUNCIONES DE AUTENTICACIÓN ---

export const loginUser = async (credentials) => {
  try {
    // 🎯 URL ABSOLUTAMENTE HARDCODEADA
    const loginUrl = 'https://sifo-ia-main.onrender.com/api/v1/auth/login';
    
    console.log('🔥 [API] URL de login:', loginUrl);
    console.log('📄 [API] Credentials:', credentials);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('📡 [API] Response status:', response.status);
    console.log('📡 [API] Response URL:', response.url);

    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    console.log('📡 [API] Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ [API] Respuesta no es JSON:', textResponse.substring(0, 500));
      throw new Error(`Servidor devolvió HTML en lugar de JSON. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 [API] Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    // Guardar token si existe
    if (data.success && data.data && data.data.access_token) {
      localStorage.setItem('token', data.data.access_token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      console.log('✅ [API] Token guardado exitosamente');
    }

    return data;
  } catch (error) {
    console.error('💥 [API] Error en loginUser:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    // 🎯 URL ABSOLUTAMENTE HARDCODEADA
    const registerUrl = 'https://sifo-ia-main.onrender.com/api/v1/auth/register';
    
    console.log('🔥 [API] URL de registro:', registerUrl);
    console.log('📄 [API] UserData:', userData);

    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('📡 [API] Response status:', response.status);

    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ [API] Respuesta no es JSON:', textResponse.substring(0, 500));
      throw new Error(`Servidor devolvió HTML en lugar de JSON. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 [API] Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('💥 [API] Error en registerUser:', error);
    throw error;
  }
};

// --- FUNCIONES PARA ÓRDENES DE COMPRA ---

export const getProveedores = async () => {
  const response = await fetch(`${API_BASE_URL}/proveedores`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar proveedores');
  }
  return response.json();
};

export const getProductos = async () => {
  const response = await fetch(`${API_BASE_URL}/productos`);
  if (!response.ok) {
    const errorData = await response.json();
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
    throw new Error(data.message || 'Error al crear la orden de compra');
  }
  return data;
};
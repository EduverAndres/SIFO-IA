// frontend-react/src/api/ordenesApi.js

// ✅ DEBUGGING: Verificar configuración
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sifo-ia-main.onrender.com/api/v1';

// 🐛 DEBUG: Log para verificar la URL
console.log('🔧 [DEBUG] API_BASE_URL configurada:', API_BASE_URL);
console.log('🔧 [DEBUG] process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// 🐛 DEBUG: Función para verificar la URL final
const logFinalUrl = (endpoint, method = 'GET') => {
  const finalUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`🔧 [DEBUG] ${method} ${finalUrl}`);
  return finalUrl;
};

// --- FUNCIONES DE AUTENTICACIÓN CON DEBUG ---

export const loginUser = async (credentials) => {
  try {
    const endpoint = '/auth/login';
    const finalUrl = logFinalUrl(endpoint, 'POST');
    
    console.log('🔥 [API] Enviando login a:', finalUrl);
    console.log('📄 [API] Credentials:', credentials);

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('📡 [API] Response status:', response.status);
    console.log('📡 [API] Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📦 [API] Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    if (data.data && data.data.access_token) {
      localStorage.setItem('token', data.data.access_token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      console.log('✅ [API] Token guardado exitosamente');
    }

    return data;
  } catch (error) {
    console.error('💥 [API] Error en loginUser:', error);
    console.error('💥 [API] Error stack:', error.stack);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const endpoint = '/auth/register';
    const finalUrl = logFinalUrl(endpoint, 'POST');
    
    console.log('🔥 [API] Enviando registro a:', finalUrl);
    console.log('📄 [API] UserData:', userData);

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('📡 [API] Response status:', response.status);

    const data = await response.json();
    console.log('📦 [API] Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    console.log('✅ [API] Usuario registrado exitosamente');
    return data;
  } catch (error) {
    console.error('💥 [API] Error en registerUser:', error);
    throw error;
  }
};

// --- FUNCIÓN DE PRUEBA PARA VERIFICAR CONECTIVIDAD ---

export const testBackendConnection = async () => {
  try {
    console.log('🧪 [TEST] Probando conectividad del backend...');
    
    // Probar health check
    const healthUrl = 'https://sifo-ia-main.onrender.com/';
    console.log('🧪 [TEST] Probando health check:', healthUrl);
    
    const healthResponse = await fetch(healthUrl);
    const healthData = await healthResponse.json();
    
    console.log('🧪 [TEST] Health check result:', healthData);
    
    // Probar endpoint de PUC test
    const pucTestUrl = `${API_BASE_URL}/puc/test`;
    console.log('🧪 [TEST] Probando PUC test:', pucTestUrl);
    
    const pucResponse = await fetch(pucTestUrl);
    const pucData = await pucResponse.json();
    
    console.log('🧪 [TEST] PUC test result:', pucData);
    
    return {
      health: healthData,
      pucTest: pucData,
      apiBaseUrl: API_BASE_URL
    };
  } catch (error) {
    console.error('🧪 [TEST] Error en prueba de conectividad:', error);
    throw error;
  }
};

// --- FUNCIONES EXISTENTES (sin cambios) ---

export const getProveedores = async () => {
  const finalUrl = logFinalUrl('/proveedores', 'GET');
  const response = await fetch(finalUrl);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar proveedores');
  }
  return response.json();
};

export const getProductos = async () => {
  const finalUrl = logFinalUrl('/productos', 'GET');
  const response = await fetch(finalUrl);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar productos');
  }
  return response.json();
};

export const crearOrdenCompra = async (ordenData) => {
  const finalUrl = logFinalUrl('/ordenes-compra', 'POST');
  const response = await fetch(finalUrl, {
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

// --- FUNCIONES DEL PUC ---

export const getPucCuentas = async (filtros = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
    if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
    if (filtros.naturaleza) queryParams.append('naturaleza', filtros.naturaleza);
    if (filtros.estado) queryParams.append('estado', filtros.estado);
    if (filtros.codigo_padre) queryParams.append('codigo_padre', filtros.codigo_padre);
    if (filtros.solo_movimiento) queryParams.append('solo_movimiento', filtros.solo_movimiento);
    if (filtros.pagina) queryParams.append('pagina', filtros.pagina);
    if (filtros.limite) queryParams.append('limite', filtros.limite);

    const endpoint = `/puc/cuentas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const finalUrl = logFinalUrl(endpoint, 'GET');
    
    const response = await fetch(finalUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al cargar las cuentas PUC');
    }

    console.log('✅ [PUC] Cuentas obtenidas:', data);
    return data;
  } catch (error) {
    console.error('💥 [PUC] Error al cargar cuentas:', error);
    throw error;
  }
};

export const getPucArbol = async (codigoPadre = null) => {
  try {
    const endpoint = codigoPadre 
      ? `/puc/arbol?codigo_padre=${codigoPadre}`
      : `/puc/arbol`;
    
    const finalUrl = logFinalUrl(endpoint, 'GET');

    const response = await fetch(finalUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al cargar el árbol PUC');
    }

    console.log('✅ [PUC] Árbol obtenido:', data);
    return data;
  } catch (error) {
    console.error('💥 [PUC] Error al cargar árbol:', error);
    throw error;
  }
};

export const getPucEstadisticas = async () => {
  try {
    const endpoint = `/puc/estadisticas`;
    const finalUrl = logFinalUrl(endpoint, 'GET');

    const response = await fetch(finalUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al cargar estadísticas PUC');
    }

    console.log('✅ [PUC] Estadísticas obtenidas:', data);
    return data;
  } catch (error) {
    console.error('💥 [PUC] Error al cargar estadísticas:', error);
    throw error;
  }
};

// --- FUNCIONES AUXILIARES ---

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('🚪 [API] Usuario deslogueado');
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  const token = getStoredToken();
  return !!token;
};

// Exportar función de prueba
window.testBackendConnection = testBackendConnection;
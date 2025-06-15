// frontend-react/src/api/ordenesApi.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sifo-ia-main.onrender.com/api/v1';

// --- Funciones existentes para órdenes de compra ---

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

// --- FUNCIONES DE AUTENTICACIÓN ---

export const loginUser = async (credentials) => {
  try {
    console.log('🔥 [API] Enviando login a:', `${API_BASE_URL}/auth/login`);
    console.log('📄 [API] Credentials:', credentials);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('📡 [API] Response status:', response.status);

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
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('🔥 [API] Enviando registro a:', `${API_BASE_URL}/auth/register`);
    console.log('📄 [API] UserData:', userData);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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

// --- FUNCIONES DEL PUC (PLAN ÚNICO DE CUENTAS) ---

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

    const url = `${API_BASE_URL}/puc/cuentas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log('🏛️ [PUC] Obteniendo cuentas:', url);

    const response = await fetch(url, {
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
    const url = codigoPadre 
      ? `${API_BASE_URL}/puc/arbol?codigo_padre=${codigoPadre}`
      : `${API_BASE_URL}/puc/arbol`;
    
    console.log('🌳 [PUC] Obteniendo árbol:', url);

    const response = await fetch(url, {
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
    const url = `${API_BASE_URL}/puc/estadisticas`;
    
    console.log('📊 [PUC] Obteniendo estadísticas:', url);

    const response = await fetch(url, {
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

export const getPucCuentaPorCodigo = async (codigo) => {
  try {
    const url = `${API_BASE_URL}/puc/cuentas/codigo/${codigo}`;
    
    console.log('🔍 [PUC] Buscando cuenta por código:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al buscar la cuenta PUC');
    }

    console.log('✅ [PUC] Cuenta encontrada:', data);
    return data;
  } catch (error) {
    console.error('💥 [PUC] Error al buscar cuenta:', error);
    throw error;
  }
};

export const crearCuentaPuc = async (cuentaData) => {
  try {
    console.log('🆕 [PUC] Creando cuenta:', cuentaData);

    const response = await fetch(`${API_BASE_URL}/puc/cuentas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cuentaData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear la cuenta PUC');
    }

    console.log('✅ [PUC] Cuenta creada:', data);
    return data;
  } catch (error) {
    console.error('💥 [PUC] Error al crear cuenta:', error);
    throw error;
  }
};

export const validarCodigoPuc = async (codigo) => {
  try {
    const url = `${API_BASE_URL}/puc/validar/${codigo}`;
    
    console.log('✔️ [PUC] Validando código:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al validar código PUC');
    }

    console.log('✅ [PUC] Código validado:', data);
    return data;
  } catch (error) {
    console.error('💥 [PUC] Error al validar código:', error);
    throw error;
  }
};

// --- FUNCIONES AUXILIARES DE AUTENTICACIÓN ---

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

// ✅ ELIMINAR CUENTA PUC - FUNCIÓN CORREGIDA
export const eliminarCuentaPuc = async (id) => {
  try {
    console.log('🗑️ [PUC] Eliminando cuenta ID:', id);

    const response = await authenticatedFetch(`/puc/cuentas/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      let data = null;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }
      
      console.log('✅ [PUC] Cuenta eliminada:', data);
      return {
        success: true,
        message: 'Cuenta eliminada exitosamente',
        data: data
      };
    } else {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.log('No se pudo parsear error response como JSON');
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('💥 [PUC] Error al eliminar cuenta:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// --- FUNCIÓN PARA REQUESTS AUTENTICADOS ---

export const authenticatedFetch = async (url, options = {}) => {
  const token = getStoredToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logoutUser();
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }

  return response;
};
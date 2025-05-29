// frontend-react/src/api/produccionApi.js

const API_BASE_URL = 'http://localhost:3001';

// Función helper para manejar errores de respuesta
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Función helper para obtener headers con token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ==================== PROVEEDORES ====================

export const getProveedores = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/proveedores`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

export const getProveedor = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    throw error;
  }
};

export const crearProveedor = async (proveedorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proveedores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(proveedorData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    throw error;
  }
};

export const actualizarProveedor = async (id, proveedorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(proveedorData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    throw error;
  }
};

export const eliminarProveedor = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    throw error;
  }
};

// ==================== PRODUCTOS ====================

export const getProductos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

export const getProducto = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

export const crearProducto = async (productoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productoData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

export const actualizarProducto = async (id, productoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productoData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

export const eliminarProducto = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

export const getAlertasStock = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/stock/alertas`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener alertas de stock:', error);
    throw error;
  }
};

// ==================== ÓRDENES DE COMPRA ====================

export const getOrdenesCompra = async (filtros = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar filtros como query parameters
    if (filtros.estado) queryParams.append('estado', filtros.estado);
    if (filtros.proveedor) queryParams.append('proveedor', filtros.proveedor);
    if (filtros.fecha_desde) queryParams.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) queryParams.append('fecha_hasta', filtros.fecha_hasta);

    const url = `${API_BASE_URL}/ordenes-compra${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener órdenes de compra:', error);
    throw error;
  }
};

export const getOrdenCompra = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener orden de compra:', error);
    throw error;
  }
};

export const crearOrdenCompra = async (ordenData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ordenes-compra`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ordenData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear orden de compra:', error);
    throw error;
  }
};

export const actualizarEstadoOrden = async (id, nuevoEstado, observaciones = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/estado`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        estado: nuevoEstado,
        ...(observaciones && { observaciones })
      })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);
    throw error;
  }
};

export const eliminarOrdenCompra = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar orden de compra:', error);
    throw error;
  }
};

// ==================== SUBIDA DE ARCHIVOS ====================

export const subirArchivo = async (archivo) => {
  try {
    const formData = new FormData();
    formData.append('archivo_adjunto', archivo);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/ordenes-compra/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // No agregar Content-Type aquí, el browser lo hace automáticamente para FormData
      },
      body: formData
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};

// ==================== ESTADÍSTICAS ====================

export const getEstadisticasProduccion = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ordenes-compra/estadisticas`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

export const getEstadisticasProductos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/estadisticas`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener estadísticas de productos:', error);
    throw error;
  }
};

// ==================== FUNCIONES DE UTILIDAD ====================

// Función para formatear fechas
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Función para formatear moneda
export const formatearMoneda = (cantidad) => {
  if (cantidad === null || cantidad === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cantidad);
};

// Función para validar datos antes de enviar
export const validarDatosOrden = (ordenData) => {
  const errores = [];

  if (!ordenData.id_proveedor) {
    errores.push('Debe seleccionar un proveedor');
  }

  if (!ordenData.fecha_entrega) {
    errores.push('Debe especificar una fecha de entrega');
  }

  if (!ordenData.detalles || ordenData.detalles.length === 0) {
    errores.push('Debe agregar al menos un producto');
  }

  // Validar cada detalle
  if (ordenData.detalles) {
    ordenData.detalles.forEach((detalle, index) => {
      if (!detalle.id_producto) {
        errores.push(`Detalle ${index + 1}: Debe seleccionar un producto`);
      }
      if (!detalle.cantidad || detalle.cantidad <= 0) {
        errores.push(`Detalle ${index + 1}: La cantidad debe ser mayor a 0`);
      }
      if (!detalle.precio_unitario || detalle.precio_unitario <= 0) {
        errores.push(`Detalle ${index + 1}: El precio unitario debe ser mayor a 0`);
      }
    });
  }

  return errores;
};

// Estados disponibles para órdenes de compra
export const ESTADOS_ORDEN = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada'
};

// Función para obtener el color del estado
export const obtenerColorEstado = (estado) => {
  switch (estado) {
    case ESTADOS_ORDEN.COMPLETADA:
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
    case ESTADOS_ORDEN.PENDIENTE:
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
    case ESTADOS_ORDEN.APROBADA:
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
    case ESTADOS_ORDEN.CANCELADA:
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  }
};

// Función para verificar si se puede cambiar el estado
export const puedeCombitarEstado = (estadoActual, nuevoEstado) => {
  const transicionesValidas = {
    [ESTADOS_ORDEN.PENDIENTE]: [ESTADOS_ORDEN.APROBADA, ESTADOS_ORDEN.CANCELADA],
    [ESTADOS_ORDEN.APROBADA]: [ESTADOS_ORDEN.COMPLETADA, ESTADOS_ORDEN.CANCELADA],
    [ESTADOS_ORDEN.COMPLETADA]: [], // No se puede cambiar
    [ESTADOS_ORDEN.CANCELADA]: []   // No se puede cambiar
  };

  return transicionesValidas[estadoActual]?.includes(nuevoEstado) || false;
};

// Exportar todo como default también para flexibilidad
export default {
  // Proveedores
  getProveedores,
  getProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  
  // Productos
  getProductos,
  getProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  getAlertasStock,
  
  // Órdenes de compra
  getOrdenesCompra,
  getOrdenCompra,
  crearOrdenCompra,
  actualizarEstadoOrden,
  eliminarOrdenCompra,
  
  // Archivos
  subirArchivo,
  
  // Estadísticas
  getEstadisticasProduccion,
  getEstadisticasProductos,
  
  // Utilidades
  formatearFecha,
  formatearMoneda,
  validarDatosOrden,
  obtenerColorEstado,
  puedeCombitarEstado,
  ESTADOS_ORDEN
};
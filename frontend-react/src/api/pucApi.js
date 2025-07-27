// ===============================================
// 🔧 pucApi.js - CORREGIDO CON MÉTODO validarArchivoExcel
// ===============================================

// Configuración base de la API
const API_BASE_URL = 'https://sifo-ia-main.onrender.com/api/v1';


// ===============================================
// 🛠️ UTILIDADES DE CONFIGURACIÓN
// ===============================================

// Configuración de logging detallado
const LOG_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  logRequests: true,
  logResponses: true,
  logErrors: true
};

// Función de logging condicional
const apiLog = (level, message, data = null) => {
  if (!LOG_CONFIG.enabled) return;
  
  const logMessage = `[PUC-API] ${message}`;
  switch (level) {
    case 'info':
      console.log(`📥 ${logMessage}`, data || '');
      break;
    case 'success':
      console.log(`✅ ${logMessage}`, data || '');
      break;
    case 'warning':
      console.warn(`⚠️ ${logMessage}`, data || '');
      break;
    case 'error':
      console.error(`❌ ${logMessage}`, data || '');
      break;
    default:
      console.log(logMessage, data || '');
  }
};

// ===============================================
// 🔧 CONFIGURACIÓN DE FETCH MEJORADA
// ===============================================

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Función helper para obtener headers para FormData (sin Content-Type)
const getFormDataHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Función helper mejorada para manejar respuestas
const handleResponse = async (response, endpoint = 'unknown') => {
  const startTime = Date.now();
  
  // Log de la respuesta
  if (LOG_CONFIG.logResponses) {
    apiLog('info', `API Response: {status: ${response.status}, url: '${endpoint}', fullURL: '${response.url}'}`);
  }

  // Verificar si la respuesta es OK
  if (!response.ok) {
    let errorData;
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Incluir errores de validación si existen
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage += '\n\nDetalles:\n' + errorData.errors.join('\n');
        } else if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += '\n\nDetalles:\n' + errorData.details.join('\n');
        }
      } else {
        // Si no es JSON, intentar obtener texto
        const textResponse = await response.text();
        if (textResponse) {
          errorMessage += `\n\nRespuesta: ${textResponse}`;
        }
      }
    } catch (parseError) {
      apiLog('warning', `No se pudo parsear error de respuesta para ${endpoint}`, parseError);
    }

    apiLog('error', `Error en ${endpoint}`, { 
      status: response.status, 
      message: errorMessage,
      errorData 
    });

    throw new Error(errorMessage);
  }

  // Intentar parsear respuesta JSON
  try {
    const data = await response.json();
    
    const endTime = Date.now();
    if (LOG_CONFIG.logResponses) {
      apiLog('success', `Respuesta procesada en ${endTime - startTime}ms`, {
        endpoint,
        dataType: Array.isArray(data) ? 'Array' : typeof data,
        dataLength: data?.length || (data?.data?.length || 'N/A')
      });
    }

    return data;
  } catch (jsonError) {
    apiLog('error', `Error parseando JSON para ${endpoint}`, jsonError);
    throw new Error(`Error parseando respuesta JSON: ${jsonError.message}`);
  }
};

// Función helper para hacer requests con retry automático
const makeRequest = async (url, options = {}, retries = 2) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const endpoint = url.startsWith('http') ? url : url;
  
  // Configuración por defecto
  const defaultOptions = {
    headers: options.headers || getAuthHeaders(),
    timeout: 30000, // 30 segundos
    ...options
  };

  if (LOG_CONFIG.logRequests) {
    apiLog('info', `Request: ${options.method || 'GET'} ${endpoint}`, {
      url: fullUrl,
      headers: defaultOptions.headers,
      body: options.body
    });
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), defaultOptions.timeout);

      const response = await fetch(fullUrl, {
        ...defaultOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return await handleResponse(response, endpoint);

    } catch (error) {
      const isLastAttempt = attempt === retries;
      
      if (error.name === 'AbortError') {
        apiLog('error', `Timeout en ${endpoint} (intento ${attempt + 1}/${retries + 1})`);
        if (isLastAttempt) throw new Error(`Timeout: La petición a ${endpoint} tardó más de ${defaultOptions.timeout/1000} segundos`);
      } else if (error.message.includes('fetch')) {
        apiLog('error', `Error de red en ${endpoint} (intento ${attempt + 1}/${retries + 1})`, error);
        if (isLastAttempt) throw new Error(`Error de conexión: No se pudo conectar con el servidor`);
      } else {
        // Si no es un error de red, no reintentar
        throw error;
      }

      // Esperar antes del siguiente intento (backoff exponencial)
      if (!isLastAttempt) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        apiLog('warning', `Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

// ===============================================
// 🏛️ OBJETO PRINCIPAL DE LA API
// ===============================================

export const pucApi = {
  // ===============================================
  // 🔍 MÉTODOS DE CONSULTA
  // ===============================================

  // Obtener lista de cuentas con filtros
  async obtenerCuentas(filtros = {}) {
    try {
      // Construir query parameters
      const params = new URLSearchParams();
      
      // Añadir filtros válidos
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const endpoint = `/puc/cuentas${queryString ? `?${queryString}` : ''}`;
      
      apiLog('info', `Obteniendo cuentas con filtros:`, filtros);
      
      const response = await makeRequest(endpoint);
      
      // ✅ VALIDACIÓN Y NORMALIZACIÓN DE RESPUESTA
      let processedResponse = response;
      
      // Verificar estructura de respuesta
      if (response && typeof response === 'object') {
        if (response.success !== undefined) {
          // Formato: { success: true, data: [...] }
          processedResponse = response;
        } else if (Array.isArray(response)) {
          // Formato directo: [...]
          processedResponse = {
            success: true,
            data: response
          };
        } else if (response.data) {
          // Formato: { data: [...] }
          processedResponse = {
            success: true,
            data: response.data
          };
        }
      }

      // Asegurar que data sea un array
      if (processedResponse.data && !Array.isArray(processedResponse.data)) {
        apiLog('warning', 'data no es un array, convirtiendo...', processedResponse.data);
        processedResponse.data = [];
      }

      apiLog('success', `${processedResponse.data?.length || 0} cuentas obtenidas`);
      return processedResponse;

    } catch (error) {
      apiLog('error', 'Error obteniendo cuentas', error);
      // Retornar estructura consistente en caso de error
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    try {
      apiLog('info', 'Obteniendo estadísticas PUC');
      const response = await makeRequest('/puc/estadisticas');
      
      const processedResponse = response.success !== undefined ? response : {
        success: true,
        data: response
      };

      apiLog('success', 'Estadísticas obtenidas');
      return processedResponse;
    } catch (error) {
      apiLog('error', 'Error obteniendo estadísticas', error);
      return { success: false, data: {}, error: error.message };
    }
  },

  // ===============================================
  // 📥📤 MÉTODOS DE IMPORTACIÓN/EXPORTACIÓN
  // ===============================================

  // ✅ MÉTODO AGREGADO: Validar archivo Excel antes de importar
  async validarArchivoExcel(archivo, opciones = {}) {
    try {
      apiLog('info', 'Validando archivo Excel', { 
        archivo: archivo.name, 
        size: archivo.size,
        type: archivo.type,
        opciones 
      });

      // Validaciones del lado del cliente primero
      const clientValidation = this.validarArchivoCliente(archivo);
      if (!clientValidation.es_valido) {
        return {
          success: false,
          data: clientValidation
        };
      }

      // Preparar FormData para envío
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('accion', 'validar');
      
      // Añadir opciones de validación
      Object.entries(opciones).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Hacer petición al servidor para validación completa
      const response = await makeRequest('/puc/validar/excel', {
        method: 'POST',
        body: formData,
        headers: getFormDataHeaders()
      });

      apiLog('success', 'Validación completada', response);
      return response;

    } catch (error) {
      apiLog('error', 'Error validando archivo Excel', error);
      
      // Retornar formato consistente en caso de error
      return {
        success: false,
        data: {
          es_valido: false,
          errores: [error.message || 'Error desconocido al validar archivo'],
          advertencias: [],
          total_filas: 0
        }
      };
    }
  },

  // ✅ MÉTODO HELPER: Validaciones del lado del cliente
  validarArchivoCliente(archivo) {
    const errores = [];
    const advertencias = [];

    // Validar que existe el archivo
    if (!archivo) {
      errores.push('No se ha seleccionado ningún archivo');
      return { es_valido: false, errores, advertencias, total_filas: 0 };
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const fileExtension = archivo.name.toLowerCase();
    const isValidType = allowedTypes.includes(archivo.type) || 
                       fileExtension.endsWith('.xlsx') || 
                       fileExtension.endsWith('.xls');

    if (!isValidType) {
      errores.push('El archivo debe ser un Excel válido (.xlsx o .xls)');
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (archivo.size > maxSize) {
      errores.push(`El archivo es demasiado grande. Máximo permitido: ${maxSize / 1024 / 1024}MB`);
    }

    // Validar tamaño mínimo (al menos 1KB)
    if (archivo.size < 1024) {
      errores.push('El archivo parece estar vacío o corrupto');
    }

    // Advertencias sobre el nombre del archivo
    if (!fileExtension.includes('puc')) {
      advertencias.push('Se recomienda que el nombre del archivo contenga "PUC" para facilitar identificación');
    }

    return {
      es_valido: errores.length === 0,
      errores,
      advertencias,
      total_filas: 0 // Solo el servidor puede determinar esto
    };
  },

  // Importar desde Excel
  async importarDesdeExcel(archivo, opciones = {}) {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      
      // Añadir opciones de importación
      Object.entries(opciones).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      apiLog('info', 'Importando archivo Excel', { 
        archivo: archivo.name, 
        size: archivo.size,
        opciones 
      });

      const response = await makeRequest('/puc/importar/excel', {
        method: 'POST',
        body: formData,
        headers: getFormDataHeaders()
      });

      apiLog('success', 'Importación completada', response);
      return response;
    } catch (error) {
      apiLog('error', 'Error en importación', error);
      throw error;
    }
  },

  // Exportar a Excel
  async exportarAExcel(opciones = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(opciones).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const queryString = params.toString();
      const endpoint = `/puc/exportar/excel${queryString ? `?${queryString}` : ''}`;

      apiLog('info', 'Exportando a Excel', opciones);

      // Para exportación, necesitamos manejar blob
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear nombre del archivo
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'puc_export.xlsx';
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      apiLog('success', 'Archivo exportado exitosamente', { fileName });
      
      return { 
        success: true, 
        message: 'Archivo exportado exitosamente',
        fileName: fileName
      };
    } catch (error) {
      apiLog('error', 'Error exportando a Excel', error);
      throw error;
    }
  },

  // Descargar template de importación
  async descargarTemplate(conEjemplos = false) {
    try {
      const params = conEjemplos ? '?con_ejemplos=true' : '';
      const endpoint = `/puc/exportar/template${params}`;

      apiLog('info', 'Descargando template', { conEjemplos });

      const fullUrl = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileName = `template_puc_${conEjemplos ? 'con_ejemplos' : 'vacio'}.xlsx`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      apiLog('success', 'Template descargado', { fileName });

      return { 
        success: true, 
        message: 'Template descargado exitosamente',
        fileName: fileName
      };
    } catch (error) {
      apiLog('error', 'Error descargando template', error);
      throw error;
    }
  },

  // ===============================================
  // ✏️ MÉTODOS DE MODIFICACIÓN
  // ===============================================

  // Crear nueva cuenta
  async crearCuenta(datosCuenta) {
    try {
      apiLog('info', 'Creando nueva cuenta', datosCuenta);
      
      const response = await makeRequest('/puc/cuentas', {
        method: 'POST',
        body: JSON.stringify(datosCuenta)
      });

      apiLog('success', 'Cuenta creada exitosamente');
      return response;
    } catch (error) {
      apiLog('error', 'Error creando cuenta', error);
      throw error;
    }
  },

  // Actualizar cuenta existente
  async actualizarCuenta(id, datosCuenta) {
    try {
      apiLog('info', `Actualizando cuenta ${id}`, datosCuenta);
      
      const response = await makeRequest(`/puc/cuentas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(datosCuenta)
      });

      apiLog('success', 'Cuenta actualizada exitosamente');
      return response;
    } catch (error) {
      apiLog('error', `Error actualizando cuenta ${id}`, error);
      throw error;
    }
  },

  // Eliminar cuenta
  async eliminarCuenta(id) {
    try {
      apiLog('info', `Eliminando cuenta ${id}`);
      
      const response = await makeRequest(`/puc/cuentas/${id}`, {
        method: 'DELETE'
      });

      apiLog('success', 'Cuenta eliminada exitosamente');
      return response;
    } catch (error) {
      apiLog('error', `Error eliminando cuenta ${id}`, error);
      throw error;
    }
  },

  // ===============================================
  // 🎯 MÉTODOS DE UTILIDAD
  // ===============================================

  // Test de conectividad
  async test() {
    try {
      apiLog('info', 'Probando conectividad PUC API');
      const response = await makeRequest('/puc/test');
      apiLog('success', 'Test de conectividad exitoso');
      return response;
    } catch (error) {
      apiLog('error', 'Error en test de conectividad', error);
      throw error;
    }
  },

  // Obtener información de la API
  async obtenerInfo() {
    try {
      apiLog('info', 'Obteniendo información de la API');
      const response = await makeRequest('/puc');
      apiLog('success', 'Información obtenida');
      return response;
    } catch (error) {
      apiLog('error', 'Error obteniendo información', error);
      throw error;
    }
  }
};

// ===============================================
// 🛠️ UTILIDADES PARA EL FRONTEND
// ===============================================

export const pucUtils = {
  // Determinar nivel de cuenta por longitud del código
  determinarNivel(codigo) {
    if (!codigo) return 0;
    const longitud = codigo.length;
    if (longitud === 1) return 1; // Clase
    if (longitud === 2) return 2; // Grupo
    if (longitud === 4) return 3; // Cuenta
    if (longitud === 6) return 4; // Subcuenta
    if (longitud >= 8) return 5; // Detalle
    return 0;
  },

  // Determinar naturaleza por clase
  determinarNaturaleza(codigo) {
    if (!codigo) return 'DEBITO';
    const clase = codigo.charAt(0);
    // Clases 1, 5, 6, 7, 8 son DEBITO
    // Clases 2, 3, 4, 9 son CREDITO
    return ['1', '5', '6', '7', '8'].includes(clase) ? 'DEBITO' : 'CREDITO';
  },

  

  // Validar formato de código PUC
  validarCodigo(codigo) {
    if (!codigo) return { valido: false, error: 'Código requerido' };
    
    // Solo números
    if (!/^\d+$/.test(codigo)) {
      return { valido: false, error: 'El código debe contener solo números' };
    }
    
    // Longitudes válidas
    const longitudesValidas = [1, 2, 4, 6, 8];
    if (!longitudesValidas.includes(codigo.length)) {
      return { 
        valido: false, 
        error: `Longitud inválida. Debe ser: ${longitudesValidas.join(', ')} dígitos` 
      };
    }
    
    return { valido: true };
  },

  // Formatear código para mostrar
  formatearCodigo(codigo) {
    if (!codigo) return '';
    
    // Agregar puntos para mejor legibilidad según nivel
    const longitud = codigo.length;
    switch (longitud) {
      case 4: // 1234 -> 12.34
        return `${codigo.substring(0, 2)}.${codigo.substring(2)}`;
      case 6: // 123456 -> 12.34.56
        return `${codigo.substring(0, 2)}.${codigo.substring(2, 4)}.${codigo.substring(4)}`;
      case 8: // 12345678 -> 12.34.56.78
        return `${codigo.substring(0, 2)}.${codigo.substring(2, 4)}.${codigo.substring(4, 6)}.${codigo.substring(6)}`;
      default:
        return codigo;
    }
  },
  async validarArchivoExcel(archivo, opciones = {}) {
    try {
      console.log('📥 [PUC-API] Validando archivo Excel', { 
        archivo: archivo.name, 
        size: archivo.size,
        type: archivo.type,
        opciones 
      });

      // Validaciones del lado del cliente primero
      const clientValidation = this.validarArchivoCliente(archivo);
      if (!clientValidation.es_valido) {
        return {
          success: false,
          data: clientValidation
        };
      }

      // Preparar FormData para envío al servidor
      const formData = new FormData();
      formData.append('file', archivo); // ⚠️ IMPORTANTE: usar 'file', no 'archivo'
      
      // Añadir opciones de validación
      Object.entries(opciones).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Headers para FormData (sin Content-Type)
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Hacer petición al endpoint correcto
      const response = await fetch(`${API_BASE_URL}/puc/validar/excel`, {
        method: 'POST',
        body: formData,
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [PUC-API] Validación completada', result);
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('❌ [PUC-API] Error validando archivo Excel', error);
      
      // Retornar formato consistente en caso de error
      return {
        success: false,
        data: {
          es_valido: false,
          errores: [error.message || 'Error desconocido al validar archivo'],
          advertencias: [],
          total_filas: 0
        }
      };
    }
  },

  // ✅ MÉTODO HELPER: Validaciones del lado del cliente
  validarArchivoCliente(archivo) {
    const errores = [];
    const advertencias = [];

    // Validar que existe el archivo
    if (!archivo) {
      errores.push('No se ha seleccionado ningún archivo');
      return { es_valido: false, errores, advertencias, total_filas: 0 };
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const fileExtension = archivo.name.toLowerCase();
    const isValidType = allowedTypes.includes(archivo.type) || 
                       fileExtension.endsWith('.xlsx') || 
                       fileExtension.endsWith('.xls');

    if (!isValidType) {
      errores.push('El archivo debe ser un Excel válido (.xlsx o .xls)');
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (archivo.size > maxSize) {
      errores.push(`El archivo es demasiado grande. Máximo permitido: ${maxSize / 1024 / 1024}MB`);
    }

    // Validar tamaño mínimo (al menos 1KB)
    if (archivo.size < 1024) {
      errores.push('El archivo parece estar vacío o corrupto');
    }

    return {
      es_valido: errores.length === 0,
      errores,
      advertencias,
      total_filas: 0 // Solo el servidor puede determinar esto
    };
  }
};

// Export por defecto
export default pucApi;
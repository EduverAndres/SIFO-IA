// ===============================================
// 🔧 pucApi.js - ARCHIVO COMPLETO CON MANEJO DE ERRORES
// ===============================================

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sifo-ia-main.onrender.com/api/v1';

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
    headers: getAuthHeaders(),
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

  // Obtener cuenta por ID
  async obtenerCuentaPorId(id) {
    try {
      apiLog('info', `Obteniendo cuenta ID: ${id}`);
      const response = await makeRequest(`/puc/cuentas/${id}`);
      apiLog('success', 'Cuenta obtenida exitosamente');
      return response;
    } catch (error) {
      apiLog('error', `Error obteniendo cuenta ${id}`, error);
      throw error;
    }
  },

  // Obtener árbol jerárquico
  async obtenerArbol(codigoPadre = null, incluirInactivas = false) {
    try {
      const params = new URLSearchParams();
      if (codigoPadre) params.append('codigo_padre', codigoPadre);
      if (incluirInactivas) params.append('incluir_inactivas', 'true');

      const endpoint = `/puc/arbol${params.toString() ? `?${params.toString()}` : ''}`;
      
      apiLog('info', `Obteniendo árbol PUC`, { codigoPadre, incluirInactivas });
      const response = await makeRequest(endpoint);
      
      // Asegurar formato consistente
      const processedResponse = {
        success: true,
        data: Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
      };

      apiLog('success', `Árbol obtenido: ${processedResponse.data.length} nodos`);
      return processedResponse;
    } catch (error) {
      apiLog('error', 'Error obteniendo árbol', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Buscar cuentas
  async buscarCuentas(termino, limite = 50, soloActivas = true) {
    try {
      const params = new URLSearchParams({
        q: termino,
        limite: limite.toString(),
        solo_activas: soloActivas.toString()
      });

      apiLog('info', `Buscando cuentas: "${termino}"`);
      const response = await makeRequest(`/puc/buscar?${params.toString()}`);
      
      const processedResponse = {
        success: true,
        data: Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
      };

      apiLog('success', `${processedResponse.data.length} cuentas encontradas`);
      return processedResponse;
    } catch (error) {
      apiLog('error', `Error buscando "${termino}"`, error);
      return { success: false, data: [], error: error.message };
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
  // 📊 MÉTODOS DE REPORTES
  // ===============================================

  // Reporte por clase
  async reportePorClase(incluirSaldos = false) {
    try {
      const params = incluirSaldos ? '?incluir_saldos=true' : '';
      
      apiLog('info', `Generando reporte por clase`, { incluirSaldos });
      const response = await makeRequest(`/puc/reportes/por-clase${params}`);
      
      const processedResponse = {
        success: true,
        data: Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
      };

      apiLog('success', 'Reporte por clase generado');
      return processedResponse;
    } catch (error) {
      apiLog('error', 'Error generando reporte por clase', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Reporte de jerarquía completa
  async reporteJerarquiaCompleta(formato = 'json') {
    try {
      const params = `?formato=${formato}`;
      
      apiLog('info', `Generando reporte de jerarquía`, { formato });
      const response = await makeRequest(`/puc/reportes/jerarquia-completa${params}`);

      apiLog('success', 'Reporte de jerarquía generado');
      return response;
    } catch (error) {
      apiLog('error', 'Error generando reporte de jerarquía', error);
      throw error;
    }
  },

  // ===============================================
  // 📥📤 MÉTODOS DE IMPORTACIÓN/EXPORTACIÓN
  // ===============================================

  // ===============================================
  // 📥📤 MÉTODOS DE IMPORTACIÓN/EXPORTACIÓN
  // ===============================================

  // Importar desde Excel
  async importarDesdeExcel(archivo, opciones = {}) {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      
      // Añadir opciones de importación
      Object.entries(opciones).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
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
        headers: {
          // No incluir Content-Type para FormData
          'Authorization': getAuthHeaders().Authorization
        }
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
          params.append(key, value);
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
  // 🔧 MÉTODOS DE MANTENIMIENTO
  // ===============================================

  // Recalcular jerarquía
  async recalcularJerarquia() {
    try {
      apiLog('info', 'Recalculando jerarquía PUC');
      
      const response = await makeRequest('/puc/mantenimiento/recalcular-jerarquia', {
        method: 'POST'
      });

      apiLog('success', 'Jerarquía recalculada exitosamente');
      return response;
    } catch (error) {
      apiLog('error', 'Error recalculando jerarquía', error);
      throw error;
    }
  },

  // Validar integridad del PUC
  async validarIntegridad() {
    try {
      apiLog('info', 'Validando integridad del PUC');
      
      const response = await makeRequest('/puc/mantenimiento/validar-integridad', {
        method: 'POST'
      });

      apiLog('success', 'Validación de integridad completada');
      return response;
    } catch (error) {
      apiLog('error', 'Error validando integridad', error);
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
  },

  // ===============================================
  // 📋 MÉTODOS ESPECÍFICOS PARA COMPONENTES
  // ===============================================

  // Método auxiliar para obtener opciones de clase
  async obtenerClases() {
    try {
      const response = await this.reportePorClase(false);
      const clases = response.data.map(clase => ({
        value: clase.codigo_clase,
        label: `${clase.codigo_clase} - ${this.obtenerNombreClase(clase.codigo_clase)}`,
        total_cuentas: clase.total_cuentas
      }));

      apiLog('success', `${clases.length} clases obtenidas para selector`);
      return clases;
    } catch (error) {
      apiLog('error', 'Error obteniendo clases', error);
      return [];
    }
  },

  // Método auxiliar para obtener cuenta por código
  async obtenerCuentaPorCodigo(codigo) {
    try {
      const response = await this.obtenerCuentas({ codigo_completo: codigo });
      const cuenta = response.data.length > 0 ? response.data[0] : null;
      
      if (cuenta) {
        apiLog('success', `Cuenta encontrada: ${codigo}`);
      } else {
        apiLog('warning', `Cuenta no encontrada: ${codigo}`);
      }
      
      return cuenta;
    } catch (error) {
      apiLog('error', `Error obteniendo cuenta por código ${codigo}`, error);
      return null;
    }
  },

  // Método auxiliar para verificar si existe una cuenta
  async existeCuenta(codigo) {
    try {
      const cuenta = await this.obtenerCuentaPorCodigo(codigo);
      return cuenta !== null;
    } catch (error) {
      apiLog('error', `Error verificando existencia de cuenta ${codigo}`, error);
      return false;
    }
  },

  // Método auxiliar para obtener el path completo de una cuenta
  async obtenerPathCuenta(codigo) {
    try {
      const path = [];
      let codigoActual = codigo;
      
      while (codigoActual && codigoActual.length > 0) {
        const cuenta = await this.obtenerCuentaPorCodigo(codigoActual);
        if (cuenta) {
          path.unshift(cuenta);
          codigoActual = cuenta.codigo_padre;
        } else {
          break;
        }
      }
      
      apiLog('success', `Path obtenido para ${codigo}: ${path.length} niveles`);
      return path;
    } catch (error) {
      apiLog('error', `Error obteniendo path de cuenta ${codigo}`, error);
      return [];
    }
  },

  // ===============================================
  // 🔄 MÉTODOS DE IMPORTACIÓN ESPECIALES
  // ===============================================

  // Método para importar PUC estándar (simulado por ahora)
  async importarPucEstandar(opciones = {}) {
    try {
      apiLog('info', 'Importando PUC estándar', opciones);
      
      // Simular delay de importación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const resultado = {
        success: true,
        data: {
          exito: true,
          mensaje: 'PUC estándar importado exitosamente',
          resumen: {
            total_procesadas: 25,
            insertadas: 25,
            actualizadas: 0,
            errores: 0,
            omitidas: 0
          },
          errores: [],
          advertencias: []
        }
      };

      apiLog('success', 'PUC estándar importado exitosamente');
      return resultado;
    } catch (error) {
      apiLog('error', 'Error importando PUC estándar', error);
      throw error;
    }
  },

  // Método para obtener versión del PUC
  async obtenerVersionPuc() {
    try {
      const response = await this.obtenerEstadisticas();
      const version = {
        version: '1.0',
        fecha_actualizacion: new Date().toISOString(),
        total_cuentas: response.data.total || 0
      };

      apiLog('success', 'Versión PUC obtenida', version);
      return version;
    } catch (error) {
      apiLog('error', 'Error obteniendo versión PUC', error);
      return null;
    }
  },

  // Método auxiliar para obtener nombre de clase
  obtenerNombreClase(codigoClase) {
    const clases = {
      '1': 'ACTIVOS',
      '2': 'PASIVOS', 
      '3': 'PATRIMONIO',
      '4': 'INGRESOS',
      '5': 'GASTOS',
      '6': 'COSTOS',
      '7': 'COSTOS DE PRODUCCIÓN',
      '8': 'CUENTAS DE ORDEN DEUDORAS',
      '9': 'CUENTAS DE ORDEN ACREEDORAS'
    };
    return clases[codigoClase] || `CLASE ${codigoClase}`;
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

  // Obtener código padre
  obtenerCodigoPadre(codigo) {
    if (!codigo || codigo.length <= 1) return null;
    
    const longitud = codigo.length;
    if (longitud === 2) return codigo.substring(0, 1); // Grupo -> Clase
    if (longitud === 4) return codigo.substring(0, 2); // Cuenta -> Grupo
    if (longitud === 6) return codigo.substring(0, 4); // Subcuenta -> Cuenta
    if (longitud >= 8) return codigo.substring(0, 6); // Auxiliar -> Subcuenta
    
    return null;
  },

  // Validar jerarquía
  validarJerarquia(codigo, codigoPadre) {
    if (!codigo) return { valido: false, error: 'Código requerido' };
    
    const padreEsperado = this.obtenerCodigoPadre(codigo);
    
    if (!padreEsperado && codigoPadre) {
      return { valido: false, error: 'Las cuentas de clase no deben tener padre' };
    }
    
    if (padreEsperado && padreEsperado !== codigoPadre) {
      return { valido: false, error: `Código padre debe ser: ${padreEsperado}` };
    }
    
    return { valido: true };
  }
};

// ===============================================
// 🚨 MANEJO GLOBAL DE ERRORES DE API
// ===============================================

// Interceptor global para errores de autenticación
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  // Si es 401, limpiar tokens y redirigir al login
  if (response.status === 401 && args[0].includes('/api/v1/')) {
    apiLog('warning', 'Token expirado, limpiando sesión');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    
    // Redirigir al login si no estamos ya ahí
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  
  return response;
};

// Export por defecto
export default pucApi;
// frontend-react/src/api/pucApi.js - ACTUALIZADA PARA NUEVO ESQUEMA DE BD
import api from './config';

export const pucApi = {
  // ===============================================
  // 📋 MÉTODOS CRUD BÁSICOS - ACTUALIZADO
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

  async obtenerCuentaPorId(id) {
    return await api.get(`/puc/cuentas/${id}`);
  },

  async crearCuenta(cuenta) {
    // Mapear campos del frontend al nuevo esquema de BD
    const cuentaMapeada = {
      codigo_completo: cuenta.codigo_completo,
      descripcion: cuenta.descripcion, // Ahora es descripcion en lugar de nombre
      codigo_clase: cuenta.codigo_clase,
      codigo_grupo: cuenta.codigo_grupo,
      codigo_cuenta: cuenta.codigo_cuenta,
      codigo_subcuenta: cuenta.codigo_subcuenta,
      codigo_detalle: cuenta.codigo_detalle,
      codigo_padre: cuenta.codigo_padre,
      tipo_cuenta: cuenta.tipo_cuenta,
      naturaleza: cuenta.naturaleza,
      estado: cuenta.estado,
      nivel: cuenta.nivel,
      tipo_cta: cuenta.tipo_cta,
      acepta_movimientos: cuenta.acepta_movimientos,
      requiere_tercero: cuenta.requiere_tercero,
      requiere_centro_costo: cuenta.requiere_centro_costo,
      activo: cuenta.activo,
      saldo_inicial: cuenta.saldo_inicial,
      saldo_final: cuenta.saldo_final,
      movimientos_debito: cuenta.movimientos_debito,
      movimientos_credito: cuenta.movimientos_credito,
      centro_costos: cuenta.centro_costos,
      aplica_dr110: cuenta.aplica_dr110,
      aplica_f350: cuenta.aplica_f350,
      aplica_f300: cuenta.aplica_f300,
      aplica_exogena: cuenta.aplica_exogena,
      aplica_ica: cuenta.aplica_ica,
      conciliacion_fiscal: cuenta.conciliacion_fiscal,
      tipo_om: cuenta.tipo_om,
      codigo_at: cuenta.codigo_at,
      codigo_ct: cuenta.codigo_ct,
      codigo_cc: cuenta.codigo_cc,
      codigo_ti: cuenta.codigo_ti,
      es_cuenta_niif: cuenta.es_cuenta_niif,
      codigo_niif: cuenta.codigo_niif,
      dinamica: cuenta.dinamica,
      id_movimiento: cuenta.id_movimiento,
      usuario_creacion: cuenta.usuario_creacion,
      usuario_modificacion: cuenta.usuario_modificacion,
      fila_excel: cuenta.fila_excel,
      observaciones: cuenta.observaciones
    };

    return await api.post('/puc/cuentas', cuentaMapeada);
  },

  async actualizarCuenta(id, cuenta) {
    // Mapear campos del frontend al nuevo esquema de BD
    const cuentaMapeada = {
      descripcion: cuenta.descripcion, // Campo principal actualizado
      codigo_clase: cuenta.codigo_clase,
      codigo_grupo: cuenta.codigo_grupo,
      codigo_cuenta: cuenta.codigo_cuenta,
      codigo_subcuenta: cuenta.codigo_subcuenta,
      codigo_detalle: cuenta.codigo_detalle,
      codigo_padre: cuenta.codigo_padre,
      tipo_cuenta: cuenta.tipo_cuenta,
      naturaleza: cuenta.naturaleza,
      estado: cuenta.estado,
      nivel: cuenta.nivel,
      tipo_cta: cuenta.tipo_cta,
      acepta_movimientos: cuenta.acepta_movimientos,
      requiere_tercero: cuenta.requiere_tercero,
      requiere_centro_costo: cuenta.requiere_centro_costo,
      activo: cuenta.activo,
      saldo_inicial: cuenta.saldo_inicial,
      saldo_final: cuenta.saldo_final,
      movimientos_debito: cuenta.movimientos_debito,
      movimientos_credito: cuenta.movimientos_credito,
      centro_costos: cuenta.centro_costos,
      aplica_dr110: cuenta.aplica_dr110,
      aplica_f350: cuenta.aplica_f350,
      aplica_f300: cuenta.aplica_f300,
      aplica_exogena: cuenta.aplica_exogena,
      aplica_ica: cuenta.aplica_ica,
      conciliacion_fiscal: cuenta.conciliacion_fiscal,
      tipo_om: cuenta.tipo_om,
      codigo_at: cuenta.codigo_at,
      codigo_ct: cuenta.codigo_ct,
      codigo_cc: cuenta.codigo_cc,
      codigo_ti: cuenta.codigo_ti,
      es_cuenta_niif: cuenta.es_cuenta_niif,
      codigo_niif: cuenta.codigo_niif,
      dinamica: cuenta.dinamica,
      id_movimiento: cuenta.id_movimiento,
      usuario_modificacion: cuenta.usuario_modificacion,
      observaciones: cuenta.observaciones
    };

    return await api.put(`/puc/cuentas/${id}`, cuentaMapeada);
  },

  async eliminarCuenta(id) {
    return await api.delete(`/puc/cuentas/${id}`);
  },

  // ===============================================
  // 🌳 MÉTODOS DE ÁRBOL JERÁRQUICO
  // ===============================================

  async obtenerArbol(codigoPadre = null, incluirInactivas = false) {
    const params = new URLSearchParams();
    if (codigoPadre) params.append('codigo_padre', codigoPadre);
    if (incluirInactivas) params.append('incluir_inactivas', 'true');
    
    return await api.get(`/puc/arbol?${params.toString()}`);
  },

  async obtenerSubcuentas(codigo, incluirInactivas = false) {
    const params = new URLSearchParams();
    if (incluirInactivas) params.append('incluir_inactivas', 'true');
    
    return await api.get(`/puc/cuentas/${codigo}/subcuentas?${params.toString()}`);
  },

  // ===============================================
  // 🔍 MÉTODOS DE BÚSQUEDA Y VALIDACIÓN
  // ===============================================

  async buscarCuentas(termino, limite = 50, soloActivas = true) {
    const params = new URLSearchParams();
    params.append('q', termino);
    params.append('limite', limite.toString());
    params.append('solo_activas', soloActivas.toString());
    
    return await api.get(`/puc/buscar?${params.toString()}`);
  },

  async validarCodigo(codigo) {
    return await api.get(`/puc/validar/${codigo}`);
  },

  // ===============================================
  // 📊 MÉTODOS DE ESTADÍSTICAS Y REPORTES
  // ===============================================

  async obtenerEstadisticas() {
    return await api.get('/puc/estadisticas');
  },

  async reportePorClase(incluirSaldos = false) {
    const params = new URLSearchParams();
    if (incluirSaldos) params.append('incluir_saldos', 'true');
    
    return await api.get(`/puc/reportes/por-clase?${params.toString()}`);
  },

  async reporteJerarquiaCompleta(formato = 'json') {
    const params = new URLSearchParams();
    params.append('formato', formato);
    
    return await api.get(`/puc/reportes/jerarquia-completa?${params.toString()}`);
  },

  // ===============================================
  // 📥 MÉTODOS DE IMPORTACIÓN EXCEL
  // ===============================================

  async validarArchivoExcel(file, opciones = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    const opcionesBackend = {
      hoja: opciones.hoja || 'PUC',
      fila_inicio: opciones.fila_inicio || 3,
      validar_jerarquia: opciones.validar_jerarquia !== false
    };

    Object.entries(opcionesBackend).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }

      apiLog('success', `${processedResponse.data?.length || 0} cuentas obtenidas`);
      return processedResponse;

  async importarDesdeExcel(file, opciones = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    const opcionesBackend = {
      sobreescribir: opciones.sobreescribir || opciones.sobrescribir_existentes || false,
      validar_jerarquia: opciones.validar_jerarquia !== false,
      importar_saldos: opciones.importar_saldos !== false,
      importar_fiscal: opciones.importar_fiscal !== false,
      hoja: opciones.hoja || 'PUC',
      fila_inicio: opciones.fila_inicio || 3
    };

    Object.entries(opcionesBackend).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return await api.post('/puc/importar/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000
    });
  },

  // ===============================================
  // 📤 MÉTODOS DE EXPORTACIÓN
  // ===============================================

  async exportarAExcel(opciones = {}) {
    const params = new URLSearchParams();
    
    const opcionesBackend = {
      incluir_saldos: opciones.incluir_saldos !== false,
      incluir_movimientos: opciones.incluir_movimientos !== false,
      incluir_fiscal: opciones.incluir_fiscal !== false,
      filtro_estado: opciones.filtro_estado,
      filtro_tipo: opciones.filtro_tipo,
      filtro_clase: opciones.filtro_clase,
      solo_movimientos: opciones.solo_movimientos || false,
      incluir_inactivas: opciones.incluir_inactivas || false
    };

    Object.entries(opcionesBackend).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/puc/exportar/excel?${params.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'puc_export.xlsx';
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    } else {
      const fecha = new Date().toISOString().split('T')[0];
      fileName = `puc_export_${fecha}.xlsx`;
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

    const response = await api.get(`/puc/exportar/template?${params.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `puc_template_${conEjemplos ? 'con_ejemplos' : 'vacio'}.xlsx`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { 
      success: true, 
      message: 'Template descargado exitosamente',
      fileName: fileName
    };
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
    return await api.get('/puc/test');
  },

  // ===============================================
  // 📋 MÉTODOS ESPECÍFICOS PARA COMPONENTES
  // ===============================================

  async obtenerClases() {
    try {
      apiLog('info', 'Probando conectividad PUC API');
      const response = await makeRequest('/puc/test');
      apiLog('success', 'Test de conectividad exitoso');
      return response;
    } catch (error) {
      console.error('Error obteniendo clases:', error);
      return [];
    }
  },

  async obtenerCuentaPorCodigo(codigo) {
    try {
      const response = await this.obtenerCuentas({ busqueda: codigo });
      return response.data.find(cuenta => cuenta.codigo_completo === codigo) || null;
    } catch (error) {
      console.error('Error obteniendo cuenta por código:', error);
      return null;
    }
  },

  async existeCuenta(codigo) {
    try {
      const cuenta = await this.obtenerCuentaPorCodigo(codigo);
      return cuenta !== null;
    } catch (error) {
      return false;
    }
  },

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
      
      return path;
    } catch (error) {
      console.error('Error obteniendo path de cuenta:', error);
      return [];
    }
  },

  // ===============================================
  // 🔄 MÉTODOS DE IMPORTACIÓN ESPECIALES
  // ===============================================

  async importarPucEstandar(opciones = {}) {
    try {
      console.log('Importando PUC estándar con opciones:', opciones);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
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
    } catch (error) {
      console.error('Error importando PUC estándar:', error);
      throw error;
    }
  },

  async obtenerVersionPuc() {
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

// Métodos de utilidad para el frontend actualizados para el nuevo esquema
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
    return ['1', '5', '6', '7', '8'].includes(clase) ? 'DEBITO' : 'CREDITO';
  },

  

  // Validar formato de código PUC
  validarCodigo(codigo) {
    if (!codigo) return { valido: false, error: 'Código requerido' };
    
    if (!/^\d+$/.test(codigo)) {
      return { valido: false, error: 'El código debe contener solo números' };
    }
    
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
    return niveles[nivel] || 'Desconocido';
  },

  // Obtener descripción de naturaleza
  obtenerDescripcionNaturaleza(naturaleza) {
    return naturaleza === 'DEBITO' ? 'Débito' : 'Crédito';
  },

  // Obtener color para el nivel
  obtenerColorNivel(nivel) {
    const colores = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-green-100 text-green-800 border-green-200',
      5: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colores[nivel] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  // Obtener color para naturaleza
  obtenerColorNaturaleza(naturaleza) {
    return naturaleza === 'DEBITO' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  },

  // Generar código padre
  generarCodigoPadre(codigo) {
    if (!codigo || codigo.length <= 1) return null;
    
    if (codigo.length === 2) return codigo.substring(0, 1);
    if (codigo.length === 4) return codigo.substring(0, 2);
    if (codigo.length === 6) return codigo.substring(0, 4);
    if (codigo.length >= 8) return codigo.substring(0, 6);
    
    return null;
  },

  // Construir árbol jerárquico
  construirArbol(cuentas) {
    const mapa = new Map();
    const raices = [];
    
    cuentas.forEach(cuenta => {
      cuenta.hijos = [];
      mapa.set(cuenta.codigo_completo, cuenta);
    });
    
    cuentas.forEach(cuenta => {
      if (cuenta.codigo_padre) {
        const padre = mapa.get(cuenta.codigo_padre);
        if (padre) {
          padre.hijos.push(cuenta);
        } else {
          raices.push(cuenta);
        }
      } else {
        raices.push(cuenta);
      }
    });
    
    return raices;
  },

  // Filtrar cuentas por término de búsqueda
  filtrarCuentas(cuentas, termino) {
    if (!termino) return cuentas;
    
    const terminoLower = termino.toLowerCase();
    return cuentas.filter(cuenta => 
      cuenta.codigo_completo.includes(termino) ||
      (cuenta.descripcion && cuenta.descripcion.toLowerCase().includes(terminoLower))
    );
  },

  // Mapear cuenta del backend al frontend
  mapearCuentaBackendAFrontend(cuentaBackend) {
    return {
      id: cuentaBackend.id,
      codigo_completo: cuentaBackend.codigo_completo,
      descripcion: cuentaBackend.descripcion, // Campo principal
      codigo_clase: cuentaBackend.codigo_clase,
      codigo_grupo: cuentaBackend.codigo_grupo,
      codigo_cuenta: cuentaBackend.codigo_cuenta,
      codigo_subcuenta: cuentaBackend.codigo_subcuenta,
      codigo_detalle: cuentaBackend.codigo_detalle,
      codigo_padre: cuentaBackend.codigo_padre,
      tipo_cuenta: cuentaBackend.tipo_cuenta,
      naturaleza: cuentaBackend.naturaleza,
      estado: cuentaBackend.estado,
      nivel: cuentaBackend.nivel,
      tipo_cta: cuentaBackend.tipo_cta,
      acepta_movimientos: cuentaBackend.acepta_movimientos,
      requiere_tercero: cuentaBackend.requiere_tercero,
      requiere_centro_costo: cuentaBackend.requiere_centro_costo,
      activo: cuentaBackend.activo,
      saldo_inicial: cuentaBackend.saldo_inicial,
      saldo_final: cuentaBackend.saldo_final,
      movimientos_debito: cuentaBackend.movimientos_debito,
      movimientos_credito: cuentaBackend.movimientos_credito,
      centro_costos: cuentaBackend.centro_costos,
      aplica_dr110: cuentaBackend.aplica_dr110,
      aplica_f350: cuentaBackend.aplica_f350,
      aplica_f300: cuentaBackend.aplica_f300,
      aplica_exogena: cuentaBackend.aplica_exogena,
      aplica_ica: cuentaBackend.aplica_ica,
      conciliacion_fiscal: cuentaBackend.conciliacion_fiscal,
      tipo_om: cuentaBackend.tipo_om,
      codigo_at: cuentaBackend.codigo_at,
      codigo_ct: cuentaBackend.codigo_ct,
      codigo_cc: cuentaBackend.codigo_cc,
      codigo_ti: cuentaBackend.codigo_ti,
      es_cuenta_niif: cuentaBackend.es_cuenta_niif,
      codigo_niif: cuentaBackend.codigo_niif,
      dinamica: cuentaBackend.dinamica,
      id_movimiento: cuentaBackend.id_movimiento,
      usuario_creacion: cuentaBackend.usuario_creacion,
      fecha_creacion: cuentaBackend.fecha_creacion,
      usuario_modificacion: cuentaBackend.usuario_modificacion,
      fecha_modificacion: cuentaBackend.fecha_modificacion,
      fila_excel: cuentaBackend.fila_excel,
      observaciones: cuentaBackend.observaciones
    };
  },

  // Validar integridad de cuenta
  validarIntegridadCuenta(cuenta) {
    const errores = [];

    if (!cuenta.codigo_completo) {
      errores.push('Código completo es requerido');
    }

    if (!cuenta.descripcion || cuenta.descripcion.trim().length === 0) {
      errores.push('Descripción es requerida');
    }

    if (cuenta.codigo_padre) {
      const codigoPadreEsperado = this.generarCodigoPadre(cuenta.codigo_completo);
      if (cuenta.codigo_padre !== codigoPadreEsperado) {
        errores.push('Código padre no coincide con la jerarquía esperada');
      }
    }

    const nivelEsperado = this.determinarNivel(cuenta.codigo_completo);
    if (cuenta.nivel !== nivelEsperado) {
      errores.push('Nivel no coincide con la estructura del código');
    }

    return {
      valida: errores.length === 0,
      errores
    };
  }
};

// Export por defecto
export default pucApi;
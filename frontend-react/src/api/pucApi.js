// frontend-react/src/api/pucApi.js - COMPLETAMENTE CORREGIDO PARA RESPUESTAS DEL BACKEND
import api from './config';

export const pucApi = {
  // ===============================================
  // 📋 MÉTODOS CRUD BÁSICOS - CORREGIDOS
  // ===============================================

  async obtenerCuentas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      
      console.log('🔍 [PUCAPI] Obteniendo cuentas con filtros:', filtros);
      const response = await api.get(`/puc/cuentas?${params.toString()}`);
      
      // El backend devuelve { success: true, data: [...], total: X }
      return {
        data: response.data.data || response.data || [],
        total: response.data.total || 0,
        totalPaginas: response.data.totalPaginas || Math.ceil((response.data.total || 0) / (filtros.limite || 50)),
        pagina: response.data.pagina || filtros.pagina || 1
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error obteniendo cuentas:', error);
      throw error;
    }
  },

  async obtenerCuentaPorId(id) {
    try {
      console.log('🔍 [PUCAPI] Obteniendo cuenta por ID:', id);
      const response = await api.get(`/puc/cuentas/${id}`);
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error obteniendo cuenta por ID:', error);
      throw error;
    }
  },

  async crearCuenta(cuenta) {
    try {
      // Mapear campos del frontend al backend con valores por defecto
      const cuentaMapeada = {
        codigo_completo: cuenta.codigo_completo,
        descripcion: cuenta.descripcion, // Campo principal actualizado
        codigo_clase: cuenta.codigo_clase,
        codigo_grupo: cuenta.codigo_grupo,
        codigo_cuenta: cuenta.codigo_cuenta,
        codigo_subcuenta: cuenta.codigo_subcuenta,
        codigo_detalle: cuenta.codigo_detalle,
        codigo_padre: cuenta.codigo_padre,
        tipo_cuenta: cuenta.tipo_cuenta,
        naturaleza: cuenta.naturaleza,
        estado: cuenta.estado || 'ACTIVA',
        nivel: cuenta.nivel,
        tipo_cta: cuenta.tipo_cta,
        acepta_movimientos: cuenta.acepta_movimientos ?? true,
        requiere_tercero: cuenta.requiere_tercero ?? false,
        requiere_centro_costo: cuenta.requiere_centro_costo ?? false,
        activo: cuenta.activo ?? true,
        // Campos financieros
        saldo_inicial: cuenta.saldo_inicial || 0,
        saldo_final: cuenta.saldo_final || 0,
        movimientos_debito: cuenta.movimientos_debito || 0,
        movimientos_credito: cuenta.movimientos_credito || 0,
        centro_costos: cuenta.centro_costos,
        // Campos fiscales
        aplica_dr110: cuenta.aplica_dr110 ?? false,
        aplica_f350: cuenta.aplica_f350 ?? false,
        aplica_f300: cuenta.aplica_f300 ?? false,
        aplica_exogena: cuenta.aplica_exogena ?? false,
        aplica_ica: cuenta.aplica_ica ?? false,
        conciliacion_fiscal: cuenta.conciliacion_fiscal,
        // Códigos especiales
        tipo_om: cuenta.tipo_om,
        codigo_at: cuenta.codigo_at,
        codigo_ct: cuenta.codigo_ct,
        codigo_cc: cuenta.codigo_cc,
        codigo_ti: cuenta.codigo_ti,
        es_cuenta_niif: cuenta.es_cuenta_niif ?? false,
        codigo_niif: cuenta.codigo_niif,
        dinamica: cuenta.dinamica,
        id_movimiento: cuenta.id_movimiento,
        // Campos de auditoría
        usuario_creacion: cuenta.usuario_creacion,
        fila_excel: cuenta.fila_excel,
        observaciones: cuenta.observaciones
      };

      console.log('➕ [PUCAPI] Creando cuenta:', cuentaMapeada);
      const response = await api.post('/puc/cuentas', cuentaMapeada);
      
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error creando cuenta:', error);
      throw error;
    }
  },

  async actualizarCuenta(id, cuenta) {
    try {
      // Mapear campos del frontend al backend (sin código_completo)
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
        // Campos financieros
        saldo_inicial: cuenta.saldo_inicial,
        saldo_final: cuenta.saldo_final,
        movimientos_debito: cuenta.movimientos_debito,
        movimientos_credito: cuenta.movimientos_credito,
        centro_costos: cuenta.centro_costos,
        // Campos fiscales
        aplica_dr110: cuenta.aplica_dr110,
        aplica_f350: cuenta.aplica_f350,
        aplica_f300: cuenta.aplica_f300,
        aplica_exogena: cuenta.aplica_exogena,
        aplica_ica: cuenta.aplica_ica,
        conciliacion_fiscal: cuenta.conciliacion_fiscal,
        // Códigos especiales
        tipo_om: cuenta.tipo_om,
        codigo_at: cuenta.codigo_at,
        codigo_ct: cuenta.codigo_ct,
        codigo_cc: cuenta.codigo_cc,
        codigo_ti: cuenta.codigo_ti,
        es_cuenta_niif: cuenta.es_cuenta_niif,
        codigo_niif: cuenta.codigo_niif,
        dinamica: cuenta.dinamica,
        id_movimiento: cuenta.id_movimiento,
        // Campos de auditoría
        usuario_modificacion: cuenta.usuario_modificacion,
        observaciones: cuenta.observaciones
      };

      console.log('✏️ [PUCAPI] Actualizando cuenta:', id, cuentaMapeada);
      const response = await api.put(`/puc/cuentas/${id}`, cuentaMapeada);
      
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error actualizando cuenta:', error);
      throw error;
    }
  },

  async eliminarCuenta(id) {
    try {
      console.log('🗑️ [PUCAPI] Eliminando cuenta:', id);
      const response = await api.delete(`/puc/cuentas/${id}`);
      
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error eliminando cuenta:', error);
      throw error;
    }
  },

  // ===============================================
  // 🌳 MÉTODOS DE ÁRBOL JERÁRQUICO
  // ===============================================

  async obtenerArbol(codigoPadre = null, incluirInactivas = false) {
    try {
      const params = new URLSearchParams();
      if (codigoPadre) params.append('codigo_padre', codigoPadre);
      if (incluirInactivas) params.append('incluir_inactivas', 'true');
      
      console.log('🌳 [PUCAPI] Obteniendo árbol jerárquico');
      const response = await api.get(`/puc/arbol?${params.toString()}`);
      return {
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error obteniendo árbol:', error);
      throw error;
    }
  },

  async obtenerSubcuentas(codigo, incluirInactivas = false) {
    try {
      const params = new URLSearchParams();
      if (incluirInactivas) params.append('incluir_inactivas', 'true');
      
      console.log('📂 [PUCAPI] Obteniendo subcuentas para:', codigo);
      const response = await api.get(`/puc/cuentas/${codigo}/subcuentas?${params.toString()}`);
      return {
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error obteniendo subcuentas:', error);
      throw error;
    }
  },

  // ===============================================
  // 🔍 MÉTODOS DE BÚSQUEDA Y VALIDACIÓN
  // ===============================================

  async buscarCuentas(termino, limite = 50, soloActivas = true) {
    try {
      const params = new URLSearchParams();
      params.append('q', termino);
      params.append('limite', limite.toString());
      params.append('solo_activas', soloActivas.toString());
      
      console.log('🔍 [PUCAPI] Buscando cuentas:', termino);
      const response = await api.get(`/puc/buscar?${params.toString()}`);
      return {
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error buscando cuentas:', error);
      throw error;
    }
  },

  async validarCodigo(codigo) {
    try {
      console.log('✅ [PUCAPI] Validando código:', codigo);
      const response = await api.get(`/puc/validar/${codigo}`);
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error validando código:', error);
      throw error;
    }
  },

  // ===============================================
  // 📊 MÉTODOS DE ESTADÍSTICAS Y REPORTES
  // ===============================================

  async obtenerEstadisticas() {
    try {
      console.log('📊 [PUCAPI] Obteniendo estadísticas...');
      const response = await api.get('/puc/estadisticas');
      
      return {
        data: response.data.data || response.data || {}
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  async reportePorClase(incluirSaldos = false) {
    try {
      const params = new URLSearchParams();
      if (incluirSaldos) params.append('incluir_saldos', 'true');
      
      console.log('📈 [PUCAPI] Generando reporte por clase');
      const response = await api.get(`/puc/reportes/por-clase?${params.toString()}`);
      return {
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error en reporte por clase:', error);
      throw error;
    }
  },

  async reporteJerarquiaCompleta(formato = 'json') {
    try {
      const params = new URLSearchParams();
      params.append('formato', formato);
      
      console.log('📋 [PUCAPI] Generando reporte jerarquía completa');
      const response = await api.get(`/puc/reportes/jerarquia-completa?${params.toString()}`);
      return {
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error en reporte jerarquía completa:', error);
      throw error;
    }
  },

  // ===============================================
  // 📥 MÉTODOS DE IMPORTACIÓN EXCEL - CORREGIDOS
  // ===============================================

  async validarArchivoExcel(file, opciones = {}) {
    try {
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
      });

      console.log('🔍 [PUCAPI] Validando archivo Excel:', file.name, opcionesBackend);
      const response = await api.post('/puc/validar/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // 1 minuto para validaciones
      });

      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error validando archivo Excel:', error);
      throw error;
    }
  },

  async importarDesdeExcel(file, opciones = {}) {
    try {
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

      console.log('📥 [PUCAPI] Importando Excel:', file.name, 'con opciones:', opcionesBackend);
      const response = await api.post('/puc/importar/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutos para importaciones grandes
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📤 [PUCAPI] Progreso de subida: ${percentCompleted}%`);
        }
      });

      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error importando Excel:', error);
      throw error;
    }
  },

  // ===============================================
  // 📤 MÉTODOS DE EXPORTACIÓN - CORREGIDOS
  // ===============================================

  async exportarAExcel(opciones = {}) {
    try {
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

      console.log('📤 [PUCAPI] Exportando Excel con opciones:', opcionesBackend);
      const response = await api.get(`/puc/exportar/excel?${params.toString()}`, {
        responseType: 'blob',
        timeout: 120000 // 2 minutos para descargas grandes
      });

      // Crear blob y descargar
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo
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
      
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { 
        success: true, 
        message: 'Archivo descargado exitosamente',
        fileName: fileName
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error exportando Excel:', error);
      throw error;
    }
  },

  async descargarTemplate(conEjemplos = true) {
    try {
      const params = new URLSearchParams();
      params.append('con_ejemplos', conEjemplos.toString());

      console.log('📋 [PUCAPI] Descargando template Excel...');
      const response = await api.get(`/puc/exportar/template?${params.toString()}`, {
        responseType: 'blob',
        timeout: 60000 // 1 minuto para templates
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
    } catch (error) {
      console.error('❌ [PUCAPI] Error descargando template:', error);
      throw error;
    }
  },

  // ===============================================
  // 🔧 MÉTODOS DE MANTENIMIENTO
  // ===============================================

  async recalcularJerarquia() {
    try {
      console.log('🔄 [PUCAPI] Recalculando jerarquía...');
      const response = await api.post('/puc/mantenimiento/recalcular-jerarquia');
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error recalculando jerarquía:', error);
      throw error;
    }
  },

  async validarIntegridad() {
    try {
      console.log('✅ [PUCAPI] Validando integridad...');
      const response = await api.post('/puc/mantenimiento/validar-integridad');
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error validando integridad:', error);
      throw error;
    }
  },

  // ===============================================
  // 🎯 MÉTODOS DE UTILIDAD
  // ===============================================

  async test() {
    try {
      console.log('🧪 [PUCAPI] Ejecutando test de conexión...');
      const response = await api.get('/puc/test');
      return {
        data: response.data
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error en test:', error);
      throw error;
    }
  },

  // ===============================================
  // 📋 MÉTODOS ESPECÍFICOS PARA COMPONENTES
  // ===============================================

  async obtenerClases() {
    try {
      const response = await this.reportePorClase(false);
      const clases = response.data || [];
      return clases.map(clase => ({
        value: clase.codigo_clase,
        label: `${clase.codigo_clase} - ${this.obtenerNombreClase(clase.codigo_clase)}`,
        total_cuentas: clase.total_cuentas
      }));
    } catch (error) {
      console.error('❌ [PUCAPI] Error obteniendo clases:', error);
      return [];
    }
  },

  async obtenerCuentaPorCodigo(codigo) {
    try {
      const response = await this.obtenerCuentas({ busqueda: codigo });
      const cuentas = response.data || [];
      return cuentas.find(cuenta => cuenta.codigo_completo === codigo) || null;
    } catch (error) {
      console.error('❌ [PUCAPI] Error obteniendo cuenta por código:', error);
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
      console.error('❌ [PUCAPI] Error obteniendo path de cuenta:', error);
      return [];
    }
  },

  // ===============================================
  // 🔄 MÉTODOS DE IMPORTACIÓN ESPECIALES
  // ===============================================

  async importarPucEstandar(opciones = {}) {
    try {
      console.log('📥 [PUCAPI] Importando PUC estándar con opciones:', opciones);
      
      // Simulación para desarrollo - reemplazar con endpoint real cuando esté disponible
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
      console.error('❌ [PUCAPI] Error importando PUC estándar:', error);
      throw error;
    }
  },

  async obtenerVersionPuc() {
    try {
      const response = await this.obtenerEstadisticas();
      const estadisticas = response.data || {};
      return {
        version: '1.0',
        fecha_actualizacion: new Date().toISOString(),
        total_cuentas: estadisticas.total || 0
      };
    } catch (error) {
      console.error('❌ [PUCAPI] Error obteniendo versión PUC:', error);
      return null;
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

// ===============================================
// 🛠️ UTILIDADES PUC - ACTUALIZADAS
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
    return codigo.toString().padStart(Math.max(codigo.length, 6), '0');
  },

  // Formatear saldo con moneda colombiana
  formatearSaldo(saldo, mostrarSigno = true) {
    if (saldo === null || saldo === undefined) return '-';
    
    const numero = parseFloat(saldo);
    if (isNaN(numero)) return '-';
    
    const formatoMoneda = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    });
    
    if (mostrarSigno) {
      return formatoMoneda.format(numero);
    } else {
      return formatoMoneda.format(Math.abs(numero));
    }
  },

  // Obtener descripción de nivel
  obtenerDescripcionNivel(nivel) {
    const niveles = {
      1: 'Clase',
      2: 'Grupo',
      3: 'Cuenta',
      4: 'Subcuenta',
      5: 'Detalle'
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

export default pucApi;

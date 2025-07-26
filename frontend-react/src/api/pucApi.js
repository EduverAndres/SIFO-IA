// frontend-react/src/api/pucApi.js - VERSIÓN COMPLETA CORREGIDA
import axios from 'axios';

// ⚠️ CORRECCIÓN: Cambiar puerto por defecto a 3001
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Configurar axios
const api = axios.create({
  baseURL: `${API_URL}/puc`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para logs de desarrollo
api.interceptors.request.use((config) => {
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor para manejo de errores mejorado
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status || 'NETWORK'} ${error.config?.url}`, error.response?.data);
    
    // Mensajes de error más específicos
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose.');
    }
    
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Error desconocido';
    
    if (status === 404) {
      throw new Error(`Endpoint no encontrado: ${error.config?.url}\nVerifica que el backend esté corriendo en el puerto correcto.`);
    }
    
    throw new Error(message);
  }
);

export const pucApi = {
  // ===============================================
  // 📋 MÉTODOS BÁSICOS CRUD
  // ===============================================

  async obtenerCuentas(filtros = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return await api.get(`/cuentas?${params.toString()}`);
  },

  async obtenerCuentaPorId(id) {
    return await api.get(`/cuentas/${id}`);
  },

  async obtenerCuentaPorCodigo(codigo) {
    return await api.get(`/cuentas/codigo/${codigo}`);
  },

  async crearCuenta(cuenta) {
    return await api.post('/cuentas', cuenta);
  },

  async actualizarCuenta(id, cuenta) {
    return await api.put(`/cuentas/${id}`, cuenta);
  },

  async eliminarCuenta(id) {
    return await api.delete(`/cuentas/${id}`);
  },

  // ===============================================
  // 📊 MÉTODOS DE CONSULTA Y ESTADÍSTICAS
  // ===============================================

  async obtenerEstadisticas() {
    return await api.get('/estadisticas');
  },

  async obtenerArbol(codigoPadre = null) {
    const params = codigoPadre ? `?codigo_padre=${codigoPadre}` : '';
    return await api.get(`/arbol${params}`);
  },

  async obtenerSubcuentas(codigo) {
    return await api.get(`/cuentas/${codigo}/subcuentas`);
  },

  async validarCodigo(codigo) {
    return await api.get(`/validar/${codigo}`);
  },

  // ===============================================
  // 📥 MÉTODOS DE IMPORTACIÓN EXCEL
  // ===============================================

  async validarArchivoExcel(file, hoja = 'PUC') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hoja', hoja);

    return await api.post('/validar/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async importarDesdeExcel(file, opciones = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Agregar opciones como campos del formulario
    Object.entries(opciones).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    return await api.post('/importar/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // ===============================================
  // 📤 MÉTODOS DE EXPORTACIÓN
  // ===============================================

  async exportarAExcel(opciones = {}) {
    const params = new URLSearchParams();
    
    Object.entries(opciones).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    const response = await api.get(`/exportar/excel?${params.toString()}`, {
      responseType: 'blob',
    });

    // Crear y descargar el archivo
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `puc_export_${fecha}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Archivo descargado exitosamente' };
  },

  async descargarTemplate(conEjemplos = true) {
    const params = conEjemplos ? '?con_ejemplos=true' : '?con_ejemplos=false';
    
    const response = await api.get(`/exportar/template${params}`, {
      responseType: 'blob',
    });

    // Crear y descargar el archivo
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'puc_template.xlsx';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Template descargado exitosamente' };
  },

  // ===============================================
  // 🔧 MÉTODOS AUXILIARES Y UTILIDADES
  // ===============================================

  async limpiarPuc() {
    return await api.delete('/limpiar');
  },

  async importarPucEstandar() {
    return await api.post('/importar/estandar');
  },

  async generarReporteSaldos(opciones = {}) {
    const params = new URLSearchParams();
    
    Object.entries(opciones).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return await api.get(`/reportes/saldos?${params.toString()}`);
  },

  async obtenerResumenFinanciero() {
    return await api.get('/reportes/resumen-financiero');
  },

  async validarIntegridadPuc() {
    return await api.get('/reportes/integridad');
  },

  // ===============================================
  // 🔧 MÉTODOS DE VALIDACIÓN Y UTILIDADES
  // ===============================================

  validarEstructuraCodigo(codigo) {
    if (!codigo || typeof codigo !== 'string') {
      return {
        valido: false,
        errores: ['El código es requerido'],
        sugerencias: []
      };
    }

    const errores = [];
    const sugerencias = [];

    // Validar que solo contenga números
    if (!/^\d+$/.test(codigo)) {
      errores.push('El código debe contener solo números');
    }

    // Validar longitud según tipo de cuenta
    const longitud = codigo.length;
    const longitudesValidas = [1, 2, 4, 6, 8];
    
    if (!longitudesValidas.includes(longitud)) {
      errores.push(`Longitud inválida. Debe ser: ${longitudesValidas.join(', ')} dígitos`);
    }

    // Sugerir tipo de cuenta según longitud
    if (longitud === 1) sugerencias.push('Código de CLASE');
    else if (longitud === 2) sugerencias.push('Código de GRUPO');
    else if (longitud === 4) sugerencias.push('Código de CUENTA');
    else if (longitud === 6) sugerencias.push('Código de SUBCUENTA');
    else if (longitud >= 8) sugerencias.push('Código de DETALLE');

    // Sugerir naturaleza según el primer dígito
    const primerDigito = codigo.charAt(0);
    if (['1', '5', '6', '7'].includes(primerDigito)) {
      sugerencias.push('Naturaleza sugerida: DÉBITO');
    } else if (['2', '3', '4', '8', '9'].includes(primerDigito)) {
      sugerencias.push('Naturaleza sugerida: CRÉDITO');
    }

    return {
      valido: errores.length === 0,
      errores,
      sugerencias,
      tipo_cuenta: this.determinarTipoCuentaPorCodigo(codigo),
      naturaleza_sugerida: this.determinarNaturalezaPorCodigo(codigo)
    };
  },

  determinarTipoCuentaPorCodigo(codigo) {
    const longitud = codigo.length;
    
    if (longitud === 1) return 'CLASE';
    if (longitud === 2) return 'GRUPO';
    if (longitud === 4) return 'CUENTA';
    if (longitud === 6) return 'SUBCUENTA';
    return 'DETALLE';
  },

  determinarNaturalezaPorCodigo(codigo) {
    const primerDigito = codigo.charAt(0);
    
    switch (primerDigito) {
      case '1': // Activos
      case '5': // Gastos
      case '6': // Costos
      case '7': // Costos de producción
        return 'DEBITO';
      case '2': // Pasivos
      case '3': // Patrimonio
      case '4': // Ingresos
      case '8': // Cuentas de orden deudoras
      case '9': // Cuentas de orden acreedoras
        return 'CREDITO';
      default:
        return 'DEBITO';
    }
  },

  calcularCodigoPadre(codigo) {
    if (!codigo || codigo.length <= 1) return null;
    
    if (codigo.length === 2) return codigo.substring(0, 1);
    if (codigo.length === 4) return codigo.substring(0, 2);
    if (codigo.length === 6) return codigo.substring(0, 4);
    return codigo.substring(0, 6);
  },

  // ===============================================
  // 🎨 MÉTODOS DE FORMATEO Y PRESENTACIÓN
  // ===============================================

  formatearSaldo(saldo, decimales = 0) {
    if (saldo === null || saldo === undefined) return '$0';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(saldo);
  },

  formatearPorcentaje(valor, decimales = 2) {
    if (valor === null || valor === undefined) return '0%';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'percent',
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(valor / 100);
  },

  obtenerColorTipoCuenta(tipo) {
    const colores = {
      'CLASE': 'bg-purple-100 text-purple-800',
      'GRUPO': 'bg-blue-100 text-blue-800',
      'CUENTA': 'bg-green-100 text-green-800',
      'SUBCUENTA': 'bg-yellow-100 text-yellow-800',
      'DETALLE': 'bg-gray-100 text-gray-800',
      'AUXILIAR': 'bg-indigo-100 text-indigo-800'
    };
    
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  },

  obtenerColorNaturaleza(naturaleza) {
    return naturaleza === 'DEBITO' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  },

  obtenerColorEstado(estado) {
    return estado === 'ACTIVA' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  },

  // ===============================================
  // 📊 MÉTODOS DE ANÁLISIS Y REPORTES
  // ===============================================

  async exportarReporte(tipoReporte, opciones = {}) {
    const reportes = {
      'saldos': '/reportes/saldos',
      'movimientos': '/reportes/movimientos',
      'balance': '/reportes/balance',
      'estado-resultados': '/reportes/estado-resultados'
    };

    const endpoint = reportes[tipoReporte];
    if (!endpoint) {
      throw new Error(`Tipo de reporte no válido: ${tipoReporte}`);
    }

    const params = new URLSearchParams();
    Object.entries(opciones).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return await api.get(`${endpoint}?${params.toString()}`);
  },

  // ===============================================
  // 🔄 MÉTODOS DE SINCRONIZACIÓN Y RESPALDO
  // ===============================================

  async crearRespaldo() {
    return await api.post('/respaldo/crear');
  },

  async restaurarRespaldo(archivoRespaldo) {
    const formData = new FormData();
    formData.append('respaldo', archivoRespaldo);

    return await api.post('/respaldo/restaurar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async sincronizarConERP(sistemaERP, credenciales) {
    return await api.post('/sincronizacion/erp', {
      sistema: sistemaERP,
      credenciales
    });
  },

  // ===============================================
  // 🧪 MÉTODOS DE PRUEBA Y DESARROLLO
  // ===============================================

  async test() {
    return await api.get('/test');
  },

  // Verificar conectividad con el backend
  async verificarConexion() {
    try {
      const response = await this.test();
      return {
        conectado: true,
        mensaje: 'Conexión establecida exitosamente',
        datos: response
      };
    } catch (error) {
      return {
        conectado: false,
        mensaje: error.message,
        error: error
      };
    }
  }
};

export default pucApi;
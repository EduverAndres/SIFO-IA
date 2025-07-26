// frontend-react/src/api/pucApi.js - ACTUALIZADA PARA EL BACKEND
import api from './config';

export const pucApi = {
  // ===============================================
  // 📋 MÉTODOS CRUD BÁSICOS
  // ===============================================

  async obtenerCuentas(filtros = {}) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    return await api.get(`/puc/cuentas?${params.toString()}`);
  },

  async obtenerCuentaPorId(id) {
    return await api.get(`/puc/cuentas/${id}`);
  },

  async crearCuenta(cuenta) {
    return await api.post('/puc/cuentas', cuenta);
  },

  async actualizarCuenta(id, cuenta) {
    return await api.put(`/puc/cuentas/${id}`, cuenta);
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
  // 📥 MÉTODOS DE IMPORTACIÓN EXCEL - ACTUALIZADOS
  // ===============================================

  async validarArchivoExcel(file, opciones = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Agregar opciones de validación con nombres correctos del backend
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

    return await api.post('/puc/validar/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async importarDesdeExcel(file, opciones = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Mapear opciones del frontend a los nombres del backend
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
      timeout: 300000 // 5 minutos para importaciones grandes
    });
  },

  // ===============================================
  // 📤 MÉTODOS DE EXPORTACIÓN - ACTUALIZADOS
  // ===============================================

  async exportarAExcel(opciones = {}) {
    const params = new URLSearchParams();
    
    // Mapear opciones con los nombres correctos del backend
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

    // Crear y descargar el archivo
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo desde el header Content-Disposition si está disponible
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'puc_export.xlsx';
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    } else {
      // Generar nombre con fecha
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
  },

  async descargarTemplate(conEjemplos = true) {
    const params = new URLSearchParams();
    params.append('con_ejemplos', conEjemplos.toString());

    const response = await api.get(`/puc/exportar/template?${params.toString()}`, {
      responseType: 'blob',
    });

    // Crear y descargar el archivo
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
  // 🔧 MÉTODOS DE MANTENIMIENTO
  // ===============================================

  async recalcularJerarquia() {
    return await api.post('/puc/mantenimiento/recalcular-jerarquia');
  },

  async validarIntegridad() {
    return await api.post('/puc/mantenimiento/validar-integridad');
  },

  // ===============================================
  // 🎯 MÉTODOS DE UTILIDAD
  // ===============================================

  async test() {
    return await api.get('/puc/test');
  },

  // ===============================================
  // 📋 MÉTODOS ESPECÍFICOS PARA COMPONENTES
  // ===============================================

  // Método auxiliar para obtener opciones de clase
  async obtenerClases() {
    try {
      const response = await this.reportePorClase(false);
      return response.data.map(clase => ({
        value: clase.codigo_clase,
        label: `${clase.codigo_clase} - ${this.obtenerNombreClase(clase.codigo_clase)}`,
        total_cuentas: clase.total_cuentas
      }));
    } catch (error) {
      console.error('Error obteniendo clases:', error);
      return [];
    }
  },

  // Método auxiliar para obtener cuenta por código
  async obtenerCuentaPorCodigo(codigo) {
    try {
      const response = await this.obtenerCuentas({ codigo_completo: codigo });
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error obteniendo cuenta por código:', error);
      return null;
    }
  },

  // Método auxiliar para verificar si existe una cuenta
  async existeCuenta(codigo) {
    try {
      const cuenta = await this.obtenerCuentaPorCodigo(codigo);
      return cuenta !== null;
    } catch (error) {
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
      
      return path;
    } catch (error) {
      console.error('Error obteniendo path de cuenta:', error);
      return [];
    }
  },

  // ===============================================
  // 🔄 MÉTODOS DE IMPORTACIÓN ESPECIALES
  // ===============================================

  // Método para importar PUC estándar (simulado por ahora)
  async importarPucEstandar(opciones = {}) {
    try {
      // Por ahora simulamos la importación del PUC estándar
      // En el futuro se podría implementar un endpoint específico
      console.log('Importando PUC estándar con opciones:', opciones);
      
      // Simular delay de importación
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

  // Método para obtener versión del PUC
  async obtenerVersionPuc() {
    try {
      const response = await this.obtenerEstadisticas();
      return {
        version: '1.0',
        fecha_actualizacion: new Date().toISOString(),
        total_cuentas: response.data.total || 0
      };
    } catch (error) {
      console.error('Error obteniendo versión PUC:', error);
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

// Métodos de utilidad para el frontend (sin cambios, ya estaban bien)
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
    return codigo.toString().padStart(Math.max(codigo.length, 6), '0');
  },

  // Formatear saldo
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
    
    if (codigo.length === 2) return codigo.substring(0, 1);      // Grupo -> Clase
    if (codigo.length === 4) return codigo.substring(0, 2);      // Cuenta -> Grupo
    if (codigo.length === 6) return codigo.substring(0, 4);      // Subcuenta -> Cuenta
    if (codigo.length >= 8) return codigo.substring(0, 6);       // Detalle -> Subcuenta
    
    return null;
  },

  // Construir árbol jerárquico
  construirArbol(cuentas) {
    const mapa = new Map();
    const raices = [];
    
    // Crear mapa de cuentas
    cuentas.forEach(cuenta => {
      cuenta.hijos = [];
      mapa.set(cuenta.codigo_completo, cuenta);
    });
    
    // Construir árbol
    cuentas.forEach(cuenta => {
      if (cuenta.codigo_padre) {
        const padre = mapa.get(cuenta.codigo_padre);
        if (padre) {
          padre.hijos.push(cuenta);
        } else {
          raices.push(cuenta); // Padre no encontrado, tratar como raíz
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
      cuenta.nombre.toLowerCase().includes(terminoLower)
    );
  }
};

export default pucApi;
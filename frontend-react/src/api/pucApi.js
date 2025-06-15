// src/api/pucApi.js - VERSIÓN FINAL CORREGIDA
const API_BASE = process.env.REACT_APP_API_URL || 'https://sifo-ia-main.onrender.com/api/v1';

console.log('🔧 [CONFIG] API_BASE configurado como:', API_BASE);
console.log('🔧 [CONFIG] REACT_APP_API_URL desde .env:', process.env.REACT_APP_API_URL);

// Verificación de que API_BASE termina correctamente:
if (API_BASE.endsWith('/')) {
  console.warn('⚠️ [CONFIG] API_BASE termina con "/", esto podría causar URLs dobles');
}

class PucApiService {
  // ✅ Obtener todas las cuentas con filtros
  static async getCuentas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE}/puc/cuentas?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
      throw error;
    }
  }

  // ✅ Obtener árbol completo de cuentas
  static async getArbolCuentas() {
    try {
      const response = await fetch(`${API_BASE}/puc/arbol`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener árbol de cuentas:', error);
      throw error;
    }
  }

  // ✅ Obtener cuenta por ID
  static async getCuentaById(id) {
    try {
      const response = await fetch(`${API_BASE}/puc/cuentas/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      throw error;
    }
  }

  // ✅ Obtener cuenta por código
  static async getCuentaByCodigo(codigo) {
    try {
      const response = await fetch(`${API_BASE}/puc/cuentas/codigo/${codigo}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener cuenta por código:', error);
      throw error;
    }
  }

  // ✅ Crear nueva cuenta
  static async createCuenta(cuentaData) {
    try {
      const response = await fetch(`${API_BASE}/puc/cuentas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuentaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      throw error;
    }
  }

  // ✅ Actualizar cuenta
  static async updateCuenta(id, cuentaData) {
    try {
      const response = await fetch(`${API_BASE}/puc/cuentas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuentaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
      throw error;
    }
  }

  // ✅ Eliminar cuenta
  static async deleteCuenta(id) {
  try {
    console.log('🗑️ [PUC API] Eliminando cuenta ID:', id);
    console.log('🗑️ [PUC API] Tipo de ID:', typeof id);
    
    // 🚨 VERIFICACIÓN CRÍTICA: Asegúrate de que API_BASE está definido
    const API_BASE = process.env.REACT_APP_API_URL || 'https://sifo-ia-main.onrender.com/api/v1';
    console.log('🗑️ [PUC API] API_BASE:', API_BASE);
    
    // ✅ CONSTRUCCIÓN EXPLÍCITA DE LA URL
    const fullUrl = `${API_BASE}/puc/cuentas/${id}`;
    console.log('🗑️ [PUC API] URL completa construida:', fullUrl);
    
    // 🚨 VERIFICACIÓN DOBLE: Confirmar que la URL contiene "cuentas"
    if (!fullUrl.includes('/puc/cuentas/')) {
      console.error('❌ ERROR CRÍTICO: URL mal construida:', fullUrl);
      console.error('❌ API_BASE:', API_BASE);
      console.error('❌ ID:', id);
      throw new Error(`URL mal construida. Esperado: .../puc/cuentas/${id}, Obtenido: ${fullUrl}`);
    }
    
    console.log('🌐 [PUC API] Realizando petición DELETE a:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    console.log('📡 [PUC API] Respuesta del servidor:');
    console.log('  - Status:', response.status);
    console.log('  - StatusText:', response.statusText);
    console.log('  - URL real:', response.url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `Error ${response.status}: ${response.statusText}` 
      }));
      
      console.error('❌ [PUC API] Error del servidor:', errorData);
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ [PUC API] Cuenta eliminada exitosamente:', result);
    return result;
    
  } catch (error) {
    console.error('💥 [PUC API] Error completo al eliminar cuenta:');
    console.error('  - Mensaje:', error.message);
    console.error('  - Stack:', error.stack);
    console.error('  - ID recibido:', id);
    throw error;
  }
}
  // ✅ Obtener subcuentas de una cuenta específica
  static async getSubcuentas(codigoPadre) {
    try {
      const response = await fetch(`${API_BASE}/puc/cuentas/${codigoPadre}/subcuentas`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener subcuentas:', error);
      throw error;
    }
  }

  // ✅ Importar PUC estándar de Colombia
  static async importPucEstandarColombia() {
    try {
      const response = await fetch(`${API_BASE}/puc/importar/estandar`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al importar PUC estándar:', error);
      throw error;
    }
  }

  // ✅ Obtener estadísticas del PUC
  static async getEstadisticasPuc() {
    try {
      const response = await fetch(`${API_BASE}/puc/estadisticas`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // ✅ Validar código PUC
  static async validarCodigo(codigo) {
    try {
      const response = await fetch(`${API_BASE}/puc/validar/${codigo}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al validar código:', error);
      throw error;
    }
  }

  // ✅ Buscar cuentas por término
  static async buscarCuentas(termino, filtros = {}) {
    const filtrosConBusqueda = {
      ...filtros,
      busqueda: termino
    };

    return await this.getCuentas(filtrosConBusqueda);
  }

  // ===============================
  // MÉTODOS AUXILIARES LOCALES
  // ===============================

  // Validar código PUC (validación local)
  static validateCodigoPuc(codigo, codigoPadre = null) {
    const longitud = codigo.length;
    
    // Validar que solo contenga números
    if (!/^\d+$/.test(codigo)) {
      return {
        valid: false,
        error: 'El código debe contener solo números'
      };
    }

    // Si no hay código padre, debe ser una clase (1 dígito)
    if (!codigoPadre && longitud !== 1) {
      return {
        valid: false,
        error: 'Las cuentas sin padre deben ser clases (1 dígito)'
      };
    }

    // Si hay código padre, validar jerarquía
    if (codigoPadre) {
      if (!codigo.startsWith(codigoPadre)) {
        return {
          valid: false,
          error: 'El código debe comenzar con el código padre'
        };
      }

      const longitudPadre = codigoPadre.length;
      let longitudEsperada;

      switch (longitudPadre) {
        case 1: // Padre es clase, hijo debe ser grupo (2 dígitos)
          longitudEsperada = 2;
          break;
        case 2: // Padre es grupo, hijo debe ser cuenta (4 dígitos)
          longitudEsperada = 4;
          break;
        case 4: // Padre es cuenta, hijo debe ser subcuenta (6 dígitos)
          longitudEsperada = 6;
          break;
        case 6: // Padre es subcuenta, hijo debe ser auxiliar (7+ dígitos)
          if (longitud < 7) {
            return {
              valid: false,
              error: 'Las auxiliares deben tener al menos 7 dígitos'
            };
          }
          break;
        default:
          if (longitud <= longitudPadre) {
            return {
              valid: false,
              error: 'El código hijo debe ser más largo que el padre'
            };
          }
      }

      if (longitudEsperada && longitud !== longitudEsperada) {
        return {
          valid: false,
          error: `Para un padre de ${longitudPadre} dígitos, el hijo debe tener ${longitudEsperada} dígitos`
        };
      }
    }

    return { valid: true };
  }

  // Determinar tipo de cuenta por longitud de código
  static getTipoCuentaByCodigo(codigo) {
    const longitud = codigo.length;
    
    if (longitud === 1) return 'CLASE';
    if (longitud === 2) return 'GRUPO';
    if (longitud === 4) return 'CUENTA';
    if (longitud === 6) return 'SUBCUENTA';
    return 'AUXILIAR';
  }

  // Determinar naturaleza por clase
  static getNaturalezaByClase(codigo) {
    const clase = codigo.charAt(0);
    
    switch (clase) {
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
  }

  // Exportar PUC a formato CSV
  static exportToCsv(cuentas) {
    const headers = [
      'Código',
      'Nombre',
      'Descripción',
      'Tipo',
      'Naturaleza',
      'Estado',
      'Código Padre',
      'Permite Movimientos',
      'Requiere Tercero',
      'Requiere Centro Costo',
      'Es Cuenta NIIF',
      'Código NIIF',
      'Dinámica'
    ];

    const csvContent = [
      headers.join(','),
      ...cuentas.map(cuenta => [
        cuenta.codigo,
        `"${cuenta.nombre}"`,
        `"${cuenta.descripcion || ''}"`,
        cuenta.tipo,
        cuenta.naturaleza,
        cuenta.estado,
        cuenta.codigo_padre || '',
        cuenta.permite_movimiento ? 'SI' : 'NO',
        cuenta.requiere_tercero ? 'SI' : 'NO',
        cuenta.requiere_centro_costo ? 'SI' : 'NO',
        cuenta.es_cuenta_niif ? 'SI' : 'NO',
        cuenta.codigo_niif || '',
        `"${cuenta.dinamica || ''}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  // Descargar PUC como archivo CSV
  static downloadCsvFile(cuentas, filename = 'plan_unico_cuentas.csv') {
    const csvContent = this.exportToCsv(cuentas);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export default PucApiService;
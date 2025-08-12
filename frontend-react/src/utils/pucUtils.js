// utils/pucUtils.js
import { NATURE_TYPES, ACCOUNT_TYPES } from '../constants/pucConstants';

/**
 * Determina el tipo de cuenta basado en la longitud del código
 */
export const determinarTipoPorCodigo = (codigo) => {
  if (!codigo) return '';
  const longitud = codigo.length;
  switch(longitud) {
    case 1: return 'CLASE';
    case 2: return 'GRUPO'; 
    case 4: return 'CUENTA';
    case 6: return 'SUBCUENTA';
    default: return longitud > 6 ? 'DETALLE' : '';
  }
};

/**
 * Determina el nivel jerárquico basado en la longitud del código
 */
export const determinarNivelPorCodigo = (codigo) => {
  if (!codigo) return 0;
  const longitud = codigo.length;
  if (longitud === 1) return 1; // Clase
  if (longitud === 2) return 2; // Grupo
  if (longitud === 4) return 3; // Cuenta
  if (longitud === 6) return 4; // Subcuenta
  if (longitud >= 7) return 5; // Detalle
  return 0;
};

/**
 * Determina la naturaleza automáticamente por clase
 */
export const determinarNaturalezaPorClase = (codigo) => {
  if (!codigo) return 'DEBITO';
  const clase = codigo.charAt(0);
  return ['1', '5', '6', '7', '8'].includes(clase) ? 'DEBITO' : 'CREDITO';
};

/**
 * Valida que el código cumpla con las reglas jerárquicas
 */
export const validarCodigoJerarquia = (codigo, tipo, codigoPadre = '') => {
  const errores = [];
  
  if (!codigo) {
    errores.push('El código es requerido');
    return { valido: false, errores };
  }

  // Validar que solo contenga números
  if (!/^\d+$/.test(codigo)) {
    errores.push('El código debe contener solo números');
  }

  // Validar longitud según tipo
  const longitudEsperada = {
    'CLASE': 1,
    'GRUPO': 2,
    'CUENTA': 4,
    'SUBCUENTA': 6,
    'DETALLE': 7 // mínimo para detalle
  };

  const longitud = codigo.length;
  const longitudRequerida = longitudEsperada[tipo];

  if (tipo !== 'DETALLE' && longitud !== longitudRequerida) {
    errores.push(`${tipo} debe tener exactamente ${longitudRequerida} dígito(s). Actual: ${longitud}`);
  } else if (tipo === 'DETALLE' && longitud < longitudRequerida) {
    errores.push(`${tipo} debe tener al menos ${longitudRequerida} dígitos. Actual: ${longitud}`);
  }

  // Validar jerarquía con código padre
  if (codigoPadre) {
    if (!codigo.startsWith(codigoPadre)) {
      errores.push(`El código debe comenzar con el código padre: ${codigoPadre}`);
    }
    
    if (codigo.length <= codigoPadre.length) {
      errores.push(`El código hijo debe ser más largo que el código padre`);
    }
  } else if (tipo !== 'CLASE') {
    errores.push(`${tipo} requiere un código padre`);
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Encuentra el código padre sugerido para un código dado
 */
export const sugerirCodigoPadre = (codigo) => {
  if (!codigo || codigo.length <= 1) return '';
  
  const longitud = codigo.length;
  if (longitud === 2) return codigo.charAt(0); // Grupo -> Clase
  if (longitud === 4) return codigo.substring(0, 2); // Cuenta -> Grupo
  if (longitud === 6) return codigo.substring(0, 4); // Subcuenta -> Cuenta
  if (longitud > 6) return codigo.substring(0, 6); // Detalle -> Subcuenta
  
  return '';
};

/**
 * Extrae los códigos jerárquicos de un código completo
 */
export const extraerCodigosJerarquia = (codigo) => {
  if (!codigo) return {};
  
  return {
    codigo_clase: codigo.length >= 1 ? codigo.substring(0, 1) : '',
    codigo_grupo: codigo.length >= 2 ? codigo.substring(0, 2) : '',
    codigo_cuenta: codigo.length >= 4 ? codigo.substring(0, 4) : '',
    codigo_subcuenta: codigo.length >= 6 ? codigo.substring(0, 6) : '',
    codigo_detalle: codigo.length > 6 ? codigo : ''
  };
};

/**
 * Obtiene el icono para el tipo de cuenta
 */
export const obtenerIconoTipoCuenta = (tipo) => {
  const iconos = {
    'CLASE': '🏛️',
    'GRUPO': '📁',
    'CUENTA': '📋',
    'SUBCUENTA': '📄',
    'DETALLE': '🔸'
  };
  return iconos[tipo] || '📌';
};

/**
 * Construye el árbol jerárquico completo
 */
export const construirArbolJerarquico = (cuentas) => {
  if (!cuentas || cuentas.length === 0) return [];
  
  // Crear mapa de cuentas por código
  const cuentasMap = {};
  const cuentasEnriquecidas = cuentas.map(cuenta => ({
    ...cuenta,
    hijos: [],
    nivel_calculado: determinarNivelPorCodigo(cuenta.codigo_completo),
    tipo_calculado: determinarTipoPorCodigo(cuenta.codigo_completo),
    padre_calculado: sugerirCodigoPadre(cuenta.codigo_completo)
  }));

  // Poblar el mapa
  cuentasEnriquecidas.forEach(cuenta => {
    cuentasMap[cuenta.codigo_completo] = cuenta;
  });

  // Construir la jerarquía
  const raices = [];
  cuentasEnriquecidas.forEach(cuenta => {
    const codigoPadre = cuenta.codigo_padre || cuenta.padre_calculado;
    
    if (codigoPadre && cuentasMap[codigoPadre]) {
      // Tiene padre - agregarlo como hijo
      cuentasMap[codigoPadre].hijos.push(cuenta);
    } else {
      // Es raíz (generalmente clases)
      raices.push(cuenta);
    }
  });

  // Ordenar recursivamente todo el árbol
  const ordenarNodos = (nodos) => {
    return nodos
      .sort((a, b) => a.codigo_completo.localeCompare(b.codigo_completo))
      .map(nodo => ({
        ...nodo,
        hijos: ordenarNodos(nodo.hijos || [])
      }));
  };

  return ordenarNodos(raices);
};
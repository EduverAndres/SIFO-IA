// utils/formatters.js

/**
 * Formatea un valor monetario
 */
export const formatearSaldo = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '$0';
  
  const numero = parseFloat(valor);
  if (isNaN(numero)) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numero);
};

/**
 * Formatea movimientos contables
 */
export const formatearMovimientos = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '$0';
  
  const numero = parseFloat(valor);
  if (isNaN(numero)) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numero);
};

/**
 * Obtiene el color para el nivel jerárquico
 */
export const obtenerColorNivel = (nivel) => {
  const colores = {
    1: 'bg-purple-100 text-purple-800 border-purple-200',
    2: 'bg-blue-100 text-blue-800 border-blue-200',
    3: 'bg-green-100 text-green-800 border-green-200',
    4: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    5: 'bg-orange-100 text-orange-800 border-orange-200'
  };
  return colores[nivel] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Obtiene el color para la naturaleza
 */
export const obtenerColorNaturaleza = (naturaleza) => {
  const colores = {
    'DEBITO': 'bg-green-100 text-green-800 border-green-200',
    'CREDITO': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return colores[naturaleza] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Obtiene el color para el tipo de cuenta
 */
export const obtenerColorTipoCuenta = (tipoCuenta) => {
  const colores = {
    'CLASE': 'bg-purple-100 text-purple-800 border-purple-200',
    'GRUPO': 'bg-blue-100 text-blue-800 border-blue-200',
    'CUENTA': 'bg-green-100 text-green-800 border-green-200',
    'SUBCUENTA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'DETALLE': 'bg-orange-100 text-orange-800 border-orange-200'
  };
  return colores[tipoCuenta] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Formatea una fecha
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  
  try {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return '-';
  }
};

/**
 * Formatea un porcentaje
 */
export const formatearPorcentaje = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '0%';
  
  const numero = parseFloat(valor);
  if (isNaN(numero)) return '0%';
  
  return `${numero.toFixed(2)}%`;
};

/**
 * Trunca texto largo
 */
export const truncarTexto = (texto, longitud = 50) => {
  if (!texto) return '';
  if (texto.length <= longitud) return texto;
  return texto.substring(0, longitud) + '...';
};
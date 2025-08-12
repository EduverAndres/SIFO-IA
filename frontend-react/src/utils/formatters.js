// utils/formatters.js

/**
 * Formatea un valor monetario
 */
export const formatearSaldo = (saldo) => {
  if (!saldo && saldo !== 0) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(saldo);
};

/**
 * Formatea cantidad de movimientos
 */
export const formatearMovimientos = (cantidad) => {
  if (!cantidad && cantidad !== 0) return '0';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0
  }).format(cantidad);
};

/**
 * Obtiene el color para un nivel específico
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
 * Obtiene el color para una naturaleza específica
 */
export const obtenerColorNaturaleza = (naturaleza) => {
  return naturaleza === 'DEBITO' 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';
};

/**
 * Obtiene el color para un tipo de cuenta específico
 */
export const obtenerColorTipoCuenta = (tipo) => {
  const colores = {
    'CLASE': 'bg-purple-100 text-purple-800',
    'GRUPO': 'bg-blue-100 text-blue-800',
    'CUENTA': 'bg-green-100 text-green-800',
    'SUBCUENTA': 'bg-yellow-100 text-yellow-800',
    'DETALLE': 'bg-orange-100 text-orange-800'
  };
  return colores[tipo] || 'bg-gray-100 text-gray-800';
};
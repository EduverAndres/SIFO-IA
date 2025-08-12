// constants/pucConstants.js
export const PUC_CLASSES = [
  { codigo: '1', nombre: 'ACTIVOS', color: 'bg-green-100 text-green-800', naturaleza: 'DEBITO' },
  { codigo: '2', nombre: 'PASIVOS', color: 'bg-red-100 text-red-800', naturaleza: 'CREDITO' },
  { codigo: '3', nombre: 'PATRIMONIO', color: 'bg-blue-100 text-blue-800', naturaleza: 'CREDITO' },
  { codigo: '4', nombre: 'INGRESOS', color: 'bg-purple-100 text-purple-800', naturaleza: 'CREDITO' },
  { codigo: '5', nombre: 'GASTOS', color: 'bg-orange-100 text-orange-800', naturaleza: 'DEBITO' },
  { codigo: '6', nombre: 'COSTOS', color: 'bg-yellow-100 text-yellow-800', naturaleza: 'DEBITO' },
  { codigo: '7', nombre: 'COSTOS PROD.', color: 'bg-indigo-100 text-indigo-800', naturaleza: 'DEBITO' },
  { codigo: '8', nombre: 'CTA ORD. DEUD.', color: 'bg-pink-100 text-pink-800', naturaleza: 'DEBITO' },
  { codigo: '9', nombre: 'CTA ORD. ACRE.', color: 'bg-teal-100 text-teal-800', naturaleza: 'CREDITO' }
];

export const ACCOUNT_TYPES = [
  { value: 'CLASE', label: '🏛️ Clase (1 dígito)', length: 1, icon: '🏛️' },
  { value: 'GRUPO', label: '📁 Grupo (2 dígitos)', length: 2, icon: '📁' },
  { value: 'CUENTA', label: '📋 Cuenta (4 dígitos)', length: 4, icon: '📋' },
  { value: 'SUBCUENTA', label: '📄 Subcuenta (6 dígitos)', length: 6, icon: '📄' },
  { value: 'DETALLE', label: '🔸 Detalle (7+ dígitos)', length: 7, icon: '🔸' }
];

export const NATURE_TYPES = [
  { value: 'DEBITO', label: 'Débito (Clases 1,5,6,7,8)', classes: ['1', '5', '6', '7', '8'] },
  { value: 'CREDITO', label: 'Crédito (Clases 2,3,4,9)', classes: ['2', '3', '4', '9'] }
];

export const LEVEL_COLORS = {
  1: 'bg-purple-100 text-purple-800 border-purple-200',
  2: 'bg-blue-100 text-blue-800 border-blue-200',
  3: 'bg-green-100 text-green-800 border-green-200',
  4: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  5: 'bg-orange-100 text-orange-800 border-orange-200'
};

export const NATURE_COLORS = {
  'DEBITO': 'bg-green-100 text-green-800 border-green-200',
  'CREDITO': 'bg-blue-100 text-blue-800 border-blue-200'
};

export const DEFAULT_FILTERS = {
  busqueda: '',
  estado: 'ACTIVA',
  tipo: '',
  naturaleza: '',
  codigo_padre: '',
  limite: 50,
  pagina: 1,
  ordenar_por: 'codigo_completo',
  orden: 'ASC'
};

export const PAGINATION_OPTIONS = [
  { value: 25, label: '25 registros' },
  { value: 50, label: '50 registros' },
  { value: 100, label: '100 registros' },
  { value: 200, label: '200 registros' },
  { value: 500, label: '500 registros' },
  { value: 999999, label: 'Todos los registros' }
];

export const SORT_OPTIONS = [
  { value: 'codigo_completo', label: '🏗️ Código (Jerárquico)' },
  { value: 'descripcion', label: 'Descripción' },
  { value: 'nivel', label: 'Nivel' },
  { value: 'tipo_cuenta', label: 'Tipo Cuenta' },
  { value: 'saldo_inicial', label: 'Saldo Inicial' },
  { value: 'fecha_creacion', label: 'Fecha Creación' }
];

export const ORDER_OPTIONS = [
  { value: 'ASC', label: '↑ Ascendente (recomendado)' },
  { value: 'DESC', label: '↓ Descendente' }
];

export const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'INACTIVA', label: 'Inactiva' }
];
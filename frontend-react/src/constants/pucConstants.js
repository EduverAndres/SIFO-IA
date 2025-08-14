// constants/pucConstants.js
export const PUC_CLASSES = [
  { codigo: '1', nombre: 'ACTIVOS', color: 'bg-green-100 text-green-800 border-green-200', naturaleza: 'DEBITO' },
  { codigo: '2', nombre: 'PASIVOS', color: 'bg-red-100 text-red-800 border-red-200', naturaleza: 'CREDITO' },
  { codigo: '3', nombre: 'PATRIMONIO', color: 'bg-blue-100 text-blue-800 border-blue-200', naturaleza: 'CREDITO' },
  { codigo: '4', nombre: 'INGRESOS', color: 'bg-purple-100 text-purple-800 border-purple-200', naturaleza: 'CREDITO' },
  { codigo: '5', nombre: 'GASTOS', color: 'bg-orange-100 text-orange-800 border-orange-200', naturaleza: 'DEBITO' },
  { codigo: '6', nombre: 'COSTOS', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', naturaleza: 'DEBITO' },
  { codigo: '7', nombre: 'COSTOS PROD.', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', naturaleza: 'DEBITO' },
  { codigo: '8', nombre: 'CTA ORD. DEUD.', color: 'bg-pink-100 text-pink-800 border-pink-200', naturaleza: 'DEBITO' },
  { codigo: '9', nombre: 'CTA ORD. ACRE.', color: 'bg-teal-100 text-teal-800 border-teal-200', naturaleza: 'CREDITO' }
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

// ✅ FILTROS MEJORADOS - Límite aumentado por defecto
export const DEFAULT_FILTERS = {
  busqueda: '',
  busqueda_especifica: '',
  estado: 'ACTIVA',
  tipo: '',
  naturaleza: '',
  codigo_padre: '',
  codigo_clase: '',
  nivel: '',
  solo_movimiento: false,
  limite: 100, // ⭐ AUMENTADO de 50 a 100
  pagina: 1,
  ordenar_por: 'codigo_completo',
  orden: 'ASC'
};

// ✅ OPCIONES DE PAGINACIÓN MEJORADAS
export const PAGINATION_OPTIONS = [
  { value: 25, label: '25 registros' },
  { value: 50, label: '50 registros' },
  { value: 100, label: '100 registros' },
  { value: 200, label: '200 registros' },
  { value: 500, label: '500 registros' },
  { value: 1000, label: '1,000 registros' },
  { value: 2500, label: '2,500 registros' },
  { value: 5000, label: '5,000 registros' },
  { value: 10000, label: '10,000 registros' },
  { value: 25000, label: '25,000 registros' },
  { value: 99999, label: '🚀 TODAS las cuentas' } // ⭐ ETIQUETA MEJORADA
];

export const SORT_OPTIONS = [
  { value: 'codigo_completo', label: '🏗️ Código (Jerárquico)' },
  { value: 'descripcion', label: 'Descripción' },
  { value: 'nivel', label: 'Nivel' },
  { value: 'tipo_cuenta', label: 'Tipo Cuenta' },
  { value: 'saldo_inicial', label: 'Saldo Inicial' },
  { value: 'saldo_final', label: 'Saldo Final' },
  { value: 'movimientos_debitos', label: 'Movimientos Débitos' },
  { value: 'movimientos_creditos', label: 'Movimientos Créditos' },
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

// Configuración para búsqueda específica
export const BUSQUEDA_ESPECIFICA_CONFIG = {
  placeholder: 'Ej: 1105 (mostrará 1105, 110501, 110502, etc.)',
  descripcion: 'Busca una cuenta específica + todas sus subcuentas',
  ejemplos: [
    { codigo: '1', descripcion: 'Clase 1 + todos los activos' },
    { codigo: '11', descripcion: 'Grupo 11 + todas las cuentas del grupo' },
    { codigo: '1105', descripcion: 'Cuenta 1105 + todas sus subcuentas' },
    { codigo: '110505', descripcion: 'Subcuenta 110505 + sus detalles' }
  ]
};

// Configuración de vista
export const VISTA_CONFIG = {
  arbol: {
    autoExpandir: true,
    mostrarCoincidencias: true,
    resaltarExacta: true,
    colorCoincidenciaExacta: 'bg-green-100 border-l-4 border-green-500',
    colorSubcuenta: 'bg-green-25 border-l-2 border-green-300'
  },
  tabla: {
    mostrarIndicadores: true,
    resaltarFilas: true,
    mostrarInformacionBusqueda: true,
    iconoExacta: '🎯',
    iconoSubcuenta: '🌿'
  }
};

// Mensajes del sistema
export const MENSAJES_SISTEMA = {
  busquedaEspecifica: {
    activa: 'Búsqueda específica activa',
    coincidencias: 'coincidencias encontradas',
    cuentaExacta: 'Esta es la cuenta buscada',
    subcuenta: 'Subcuenta de la búsqueda',
    sinResultados: 'No se encontraron cuentas que empiecen con el código especificado',
    limpiar: 'Limpiar búsqueda específica'
  },
  filtros: {
    activos: 'Filtros activos',
    limpiarTodos: 'Limpiar todos los filtros',
    aplicar: 'Aplicar filtros',
    exportar: 'Exportar filtrados'
  },
  // ✅ NUEVOS MENSAJES PARA CARGA MASIVA
  cargaMasiva: {
    confirmar: '¿Cargar TODAS las cuentas del sistema?',
    descripcion: 'Esto puede tomar unos segundos y usar más memoria.',
    exito: 'Todas las cuentas cargadas exitosamente',
    error: 'Error cargando todas las cuentas',
    parcial: 'Solo tienes parte de las cuentas cargadas',
    completo: 'Todas las cuentas están cargadas'
  }
};

// Funciones utilitarias para filtros
export const FILTER_UTILS = {
  // Verificar si hay filtros activos (excluyendo valores por defecto)
  tieneActivosFiltros: (filtros) => {
    if (!filtros || typeof filtros !== 'object') return false;
    
    return Object.entries(filtros).some(([key, value]) => {
      // Ignorar valores por defecto
      if (key === 'limite' && (value === 100 || value === '100' || value === 50 || value === '50')) return false;
      if (key === 'pagina' && (value === 1 || value === '1')) return false;
      if (key === 'ordenar_por' && value === 'codigo_completo') return false;
      if (key === 'orden' && value === 'ASC') return false;
      if (key === 'estado' && value === 'ACTIVA') return false;
      
      // Verificar si tiene valor significativo
      return value && value !== '' && value !== 'todos' && value !== null && value !== undefined && value !== false;
    });
  },

  // Obtener filtros activos para mostrar
  obtenerFiltrosActivos: (filtros) => {
    const activos = [];
    
    if (filtros.busqueda_especifica) {
      activos.push({
        tipo: 'especifica',
        valor: filtros.busqueda_especifica,
        etiqueta: `🎯 Específica: ${filtros.busqueda_especifica}*`
      });
    }
    
    if (filtros.busqueda && !filtros.busqueda_especifica) {
      activos.push({
        tipo: 'general',
        valor: filtros.busqueda,
        etiqueta: `🔍 Búsqueda: ${filtros.busqueda}`
      });
    }
    
    if (filtros.codigo_clase && !filtros.busqueda_especifica) {
      const clase = PUC_CLASSES.find(c => c.codigo === filtros.codigo_clase);
      activos.push({
        tipo: 'clase',
        valor: filtros.codigo_clase,
        etiqueta: `🏛️ Clase: ${clase ? clase.nombre : filtros.codigo_clase}`
      });
    }
    
    if (filtros.tipo && !filtros.busqueda_especifica) {
      activos.push({
        tipo: 'tipo',
        valor: filtros.tipo,
        etiqueta: `📋 Tipo: ${filtros.tipo}`
      });
    }
    
    return activos;
  },

  // Limpiar filtros manteniendo configuración básica
  limpiarFiltros: () => ({
    ...DEFAULT_FILTERS,
    limite: 100, // ⭐ VALOR ACTUALIZADO
    pagina: 1,
    ordenar_por: 'codigo_completo',
    orden: 'ASC'
  }),

  // ✅ NUEVA FUNCIÓN: Verificar si se han cargado todas las cuentas
  todasLasCuentasCargadas: (cuentasEnMemoria, totalBD) => {
    if (!totalBD || totalBD === 0) return false;
    return cuentasEnMemoria >= totalBD;
  },

  // ✅ NUEVA FUNCIÓN: Calcular porcentaje de cobertura
  calcularCobertura: (cuentasEnMemoria, totalBD) => {
    if (!totalBD || totalBD === 0) return 0;
    return Math.round((cuentasEnMemoria / totalBD) * 100);
  }
};

export default {
  PUC_CLASSES,
  ACCOUNT_TYPES,
  NATURE_TYPES,
  LEVEL_COLORS,
  NATURE_COLORS,
  DEFAULT_FILTERS,
  PAGINATION_OPTIONS,
  SORT_OPTIONS,
  ORDER_OPTIONS,
  STATUS_OPTIONS,
  BUSQUEDA_ESPECIFICA_CONFIG,
  VISTA_CONFIG,
  MENSAJES_SISTEMA,
  FILTER_UTILS
};
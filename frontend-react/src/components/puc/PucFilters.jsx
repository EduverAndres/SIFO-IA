// components/puc/PucFilters.jsx
import React from 'react';
import { 
  FaFilter, 
  FaTimes, 
  FaTree, 
  FaList, 
  FaExpand, 
  FaCompress,
  FaSearch,
  FaLayerGroup,
  FaSortAmountDown,
  FaDownload,
  FaBullseye,
  FaCodeBranch
} from 'react-icons/fa';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { 
  PUC_CLASSES, 
  ACCOUNT_TYPES, 
  NATURE_TYPES, 
  STATUS_OPTIONS,
  PAGINATION_OPTIONS,
  SORT_OPTIONS,
  ORDER_OPTIONS 
} from '../../constants/pucConstants';

const PucFilters = ({
  filtros = {},
  setFiltros = () => {},
  vistaArbol = false,
  setVistaArbol = () => {},
  vistaExpandida = false,
  setVistaExpandida = () => {},
  onLimpiarFiltros = () => {},
  onAplicarFiltros = () => {},
  onExportar = () => {},
  onExpandirTodos = () => {},
  onContraerTodos = () => {},
  onExpandirSoloClases = () => {},
  aplicarFiltroInteligentePorTipo = () => {}
}) => {
  // Función segura para verificar filtros activos
  const tieneActivosFiltros = () => {
    if (!filtros || typeof filtros !== 'object') return false;
    
    return Object.entries(filtros).some(([key, value]) => {
      // Ignorar valores por defecto
      if (key === 'limite' && (value === 50 || value === '50')) return false;
      if (key === 'pagina' && (value === 1 || value === '1')) return false;
      if (key === 'ordenar_por' && value === 'codigo_completo') return false;
      if (key === 'orden' && value === 'ASC') return false;
      
      // Verificar si tiene valor significativo
      return value && value !== '' && value !== 'todos' && value !== null && value !== undefined;
    });
  };

  // Función para aplicar búsqueda inteligente por código específico
  const aplicarBusquedaPorCodigo = (codigo) => {
    if (!codigo.trim()) {
      setFiltros({...filtros, busqueda_codigo: '', pagina: 1});
      return;
    }

    setFiltros({
      ...filtros, 
      busqueda_codigo: codigo.trim(),
      tipo_busqueda: 'jerarquica', // Incluir cuenta + hijas
      pagina: 1
    });
  };

  // Función para búsqueda exacta (solo esa cuenta)
  const aplicarBusquedaExacta = (codigo) => {
    if (!codigo.trim()) {
      setFiltros({...filtros, busqueda_codigo: '', pagina: 1});
      return;
    }

    setFiltros({
      ...filtros, 
      busqueda_codigo: codigo.trim(),
      tipo_busqueda: 'exacta', // Solo esa cuenta específica
      pagina: 1
    });
  };

  // Función para filtrar por tipo específico con código
  const aplicarFiltroPorTipoYCodigo = (tipoCuenta) => {
    if (!tipoCuenta) {
      setFiltros({...filtros, filtro_tipo_especifico: '', pagina: 1});
      return;
    }

    // Determinar longitud esperada del código según el tipo
    const longitudEsperada = {
      'CLASE': 1,
      'GRUPO': 2, 
      'CUENTA': 4,
      'SUBCUENTA': 6,
      'DETALLE': 7 // o más
    };

    setFiltros({
      ...filtros,
      filtro_tipo_especifico: tipoCuenta,
      longitud_codigo: longitudEsperada[tipoCuenta],
      pagina: 1
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <FaFilter className="text-blue-600" />
          <span>Filtros Inteligentes PUC</span>
          {tieneActivosFiltros() && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              Filtros activos
            </span>
          )}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onLimpiarFiltros}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
            icon={FaTimes}
          >
            Limpiar Todos
          </Button>
          
          <Button
            onClick={() => setVistaArbol(!vistaArbol)}
            className={`px-3 py-1 text-sm transition-colors ${
              vistaArbol 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            icon={vistaArbol ? FaTree : FaList}
          >
            {vistaArbol ? 'Vista Árbol' : 'Vista Lista'}
          </Button>
          
          <Button
            onClick={() => setVistaExpandida(!vistaExpandida)}
            className={`px-3 py-1 text-sm transition-colors ${
              vistaExpandida 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            icon={vistaExpandida ? FaCompress : FaExpand}
          >
            {vistaExpandida ? 'Compacta' : 'Expandida'}
          </Button>
          
          {/* Controles de árbol */}
          {vistaArbol && (
            <>
              <Button
                onClick={onExpandirTodos}
                className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700"
                icon={FaExpand}
              >
                Expandir Todo
              </Button>
              <Button
                onClick={onContraerTodos}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700"
                icon={FaCompress}
              >
                Contraer Todo
              </Button>
              <Button
                onClick={onExpandirSoloClases}
                className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700"
                icon={FaLayerGroup}
              >
                Solo Clases
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Sección 1: Búsqueda Inteligente por Código */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
          <FaBullseye className="mr-2 text-blue-600" />
          Búsqueda Inteligente por Código
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <Input
              label="🎯 Código Específico"
              placeholder="Ej: 1105, 110505, 11050501..."
              value={filtros.busqueda_codigo || ''}
              onChange={(e) => aplicarBusquedaPorCodigo(e.target.value)}
              icon={FaBullseye}
            />
            <div className="text-xs text-blue-600 mt-1">
              💡 Muestra la cuenta + todas sus cuentas hijas
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Búsqueda</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setFiltros({...filtros, tipo_busqueda: 'jerarquica', pagina: 1})}
                className={`px-3 py-1 text-xs transition-colors ${
                  filtros.tipo_busqueda === 'jerarquica' || !filtros.tipo_busqueda
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                icon={FaCodeBranch}
              >
                Jerárquica
              </Button>
              <Button
                onClick={() => setFiltros({...filtros, tipo_busqueda: 'exacta', pagina: 1})}
                className={`px-3 py-1 text-xs transition-colors ${
                  filtros.tipo_busqueda === 'exacta'
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                icon={FaBullseye}
              >
                Exacta
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              {filtros.tipo_busqueda === 'exacta' 
                ? '🎯 Solo la cuenta específica' 
                : '🌳 Cuenta + todas sus subcuentas'}
            </div>
          </div>

          <div>
            <Select
              label="🏗️ Filtro por Tipo Específico"
              value={filtros.filtro_tipo_especifico || ''}
              onChange={(e) => aplicarFiltroPorTipoYCodigo(e.target.value)}
              options={[
                { value: '', label: 'Todos los tipos' },
                { value: 'CLASE', label: '🏛️ Solo Clases (1 dígito)' },
                { value: 'GRUPO', label: '📁 Solo Grupos (2 dígitos)' },
                { value: 'CUENTA', label: '📋 Solo Cuentas (4 dígitos)' },
                { value: 'SUBCUENTA', label: '📄 Solo Subcuentas (6 dígitos)' },
                { value: 'DETALLE', label: '🔸 Solo Detalles (7+ dígitos)' }
              ]}
            />
            <div className="text-xs text-green-600 mt-1">
              🔍 Filtra solo cuentas del tipo seleccionado
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Filtros básicos y jerarquía */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <FaSearch className="mr-2 text-blue-600" />
          Búsqueda General y Jerarquía PUC
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <Input
              label="Buscar (General)"
              placeholder="Descripción, código parcial..."
              value={filtros.busqueda || ''}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value, pagina: 1})}
              icon={FaSearch}
            />
            <div className="text-xs text-gray-500 mt-1">
              🔍 Busca en descripción y código
            </div>
          </div>
          
          <Select
            label="Tipo de Cuenta"
            value={filtros.tipo || ''}
            onChange={(e) => aplicarFiltroInteligentePorTipo(e.target.value)}
            options={[
              { value: '', label: 'Todos los tipos' },
              ...ACCOUNT_TYPES.map(type => ({
                value: type.value,
                label: type.label
              }))
            ]}
          />
          
          <Select
            label="Nivel Jerárquico"
            value={filtros.nivel || ''}
            onChange={(e) => setFiltros({...filtros, nivel: e.target.value, pagina: 1})}
            options={[
              { value: '', label: 'Todos los niveles' },
              { value: '1', label: 'Nivel 1 - Clase' },
              { value: '2', label: 'Nivel 2 - Grupo' },
              { value: '3', label: 'Nivel 3 - Cuenta' },
              { value: '4', label: 'Nivel 4 - Subcuenta' },
              { value: '5', label: 'Nivel 5 - Detalle' }
            ]}
          />
          
          <Select
            label="Naturaleza"
            value={filtros.naturaleza || ''}
            onChange={(e) => setFiltros({...filtros, naturaleza: e.target.value, pagina: 1})}
            options={[
              { value: '', label: 'Todas las naturalezas' },
              ...NATURE_TYPES.map(nature => ({
                value: nature.value,
                label: nature.label
              }))
            ]}
          />
          
          <Select
            label="Estado"
            value={filtros.estado || ''}
            onChange={(e) => setFiltros({...filtros, estado: e.target.value, pagina: 1})}
            options={STATUS_OPTIONS}
          />
          
          <Input
            label="Cuenta Padre"
            placeholder="Código padre..."
            value={filtros.codigo_padre || ''}
            onChange={(e) => setFiltros({...filtros, codigo_padre: e.target.value, pagina: 1})}
          />
        </div>
      </div>

      {/* Filtros rápidos por clase */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <FaLayerGroup className="mr-2 text-purple-600" />
          Filtros Rápidos por Clase PUC
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {PUC_CLASSES.map(clase => (
            <button
              key={clase.codigo}
              onClick={() => setFiltros({...filtros, codigo_clase: clase.codigo, pagina: 1})}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-80 border ${
                filtros.codigo_clase === clase.codigo 
                  ? `${clase.color} ring-2 ring-offset-1 ring-blue-500` 
                  : clase.color
              }`}
              title={`Filtrar por ${clase.nombre}`}
            >
              <div className="text-center">
                <div className="font-bold">{clase.codigo}</div>
                <div className="text-xs">{clase.nombre}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuración de Vista y Ordenamiento */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <FaSortAmountDown className="mr-2 text-blue-600" />
          Configuración de Vista
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Select
            label="Registros por página"
            value={filtros.limite || 50}
            onChange={(e) => setFiltros({...filtros, limite: parseInt(e.target.value), pagina: 1})}
            options={PAGINATION_OPTIONS}
          />
          
          <Select
            label="Ordenar por"
            value={filtros.ordenar_por || 'codigo_completo'}
            onChange={(e) => setFiltros({...filtros, ordenar_por: e.target.value, pagina: 1})}
            options={SORT_OPTIONS}
          />
          
          <Select
            label="Orden"
            value={filtros.orden || 'ASC'}
            onChange={(e) => setFiltros({...filtros, orden: e.target.value, pagina: 1})}
            options={ORDER_OPTIONS}
          />
          
          <div className="flex flex-col space-y-2 pt-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filtros.solo_movimiento || false}
                onChange={(e) => setFiltros({...filtros, solo_movimiento: e.target.checked, pagina: 1})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Solo con movimientos</span>
            </label>
          </div>
          
          <div className="flex flex-col justify-end">
            <Button
              onClick={onAplicarFiltros}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              icon={FaSearch}
            >
              Aplicar Filtros
            </Button>
          </div>
          
          <div className="flex flex-col justify-end">
            <Button
              onClick={onExportar}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm"
              icon={FaDownload}
            >
              Exportar Filtrados
            </Button>
          </div>
        </div>
      </div>

      {/* Información de filtros activos */}
      {tieneActivosFiltros() && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 Filtros Activos:</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {filtros.busqueda_codigo && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Código: {filtros.busqueda_codigo} ({filtros.tipo_busqueda || 'jerárquica'})
              </span>
            )}
            {filtros.filtro_tipo_especifico && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                Tipo: {filtros.filtro_tipo_especifico}
              </span>
            )}
            {filtros.busqueda && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                Búsqueda: {filtros.busqueda}
              </span>
            )}
            {filtros.codigo_clase && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                Clase: {filtros.codigo_clase}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PucFilters;
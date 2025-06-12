// src/components/puc/PucFilters.jsx
import React, { useState } from 'react';
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaTree,
  FaList,
  FaDownload,
  FaSync,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import Button from '../Button';

const PucFilters = ({
  searchTerm,
  setSearchTerm,
  filtros,
  setFiltros,
  onSearch,
  viewMode,
  setViewMode,
  onExport,
  loading = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      pagina: 1 // Reset página al cambiar filtros
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFiltros({
      tipo: '',
      naturaleza: '',
      estado: 'ACTIVA',
      codigo_padre: '',
      nivel: null,
      solo_movimiento: false,
      pagina: 1,
      limite: 50
    });
  };

  const hasActiveFilters = () => {
    return searchTerm || 
           filtros.tipo || 
           filtros.naturaleza || 
           filtros.estado !== 'ACTIVA' ||
           filtros.codigo_padre ||
           filtros.nivel ||
           filtros.solo_movimiento;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Barra de búsqueda principal */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Campo de búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Buscar por código o nombre de cuenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={onSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              icon={FaSearch}
              disabled={loading}
            >
              Buscar
            </Button>
            
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 ${showAdvanced ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              icon={showAdvanced ? FaChevronUp : FaChevronDown}
            >
              Filtros
            </Button>

            {hasActiveFilters() && (
              <Button
                onClick={clearFilters}
                className="bg-red-100 text-red-700 hover:bg-red-200 px-4"
                icon={FaTimes}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuenta
              </label>
              <select
                value={filtros.tipo || ''}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="CLASE">Clase</option>
                <option value="GRUPO">Grupo</option>
                <option value="CUENTA">Cuenta</option>
                <option value="SUBCUENTA">Subcuenta</option>
                <option value="AUXILIAR">Auxiliar</option>
              </select>
            </div>

            {/* Filtro por Naturaleza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naturaleza
              </label>
              <select
                value={filtros.naturaleza || ''}
                onChange={(e) => handleFilterChange('naturaleza', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las naturalezas</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtros.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>

            {/* Filtro por Nivel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel Jerárquico
              </label>
              <select
                value={filtros.nivel || ''}
                onChange={(e) => handleFilterChange('nivel', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los niveles</option>
                <option value="1">Nivel 1 - Clase</option>
                <option value="2">Nivel 2 - Grupo</option>
                <option value="3">Nivel 3 - Cuenta</option>
                <option value="4">Nivel 4 - Subcuenta</option>
                <option value="5">Nivel 5 - Auxiliar</option>
              </select>
            </div>

            {/* Código Padre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Padre
              </label>
              <input
                type="text"
                placeholder="Ej: 11, 1105..."
                value={filtros.codigo_padre || ''}
                onChange={(e) => handleFilterChange('codigo_padre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Solo cuentas de movimiento */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.solo_movimiento || false}
                  onChange={(e) => handleFilterChange('solo_movimiento', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo cuentas de movimiento
                </span>
              </label>
            </div>

            {/* Límite de resultados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultados por página
              </label>
              <select
                value={filtros.limite || 50}
                onChange={(e) => handleFilterChange('limite', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtros Rápidos
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  clearFilters();
                  handleFilterChange('tipo', 'CLASE');
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                Solo Clases
              </button>
              <button
                onClick={() => {
                  clearFilters();
                  handleFilterChange('solo_movimiento', true);
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
              >
                Solo Movimiento
              </button>
              <button
                onClick={() => {
                  clearFilters();
                  handleFilterChange('naturaleza', 'DEBITO');
                }}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
              >
                Solo Débito
              </button>
              <button
                onClick={() => {
                  clearFilters();
                  handleFilterChange('naturaleza', 'CREDITO');
                }}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
              >
                Solo Crédito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de vistas y acciones */}
      <div className="p-4 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Vista:</span>
          <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <FaList className="mr-2 inline" />
              Tabla
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <FaTree className="mr-2 inline" />
              Árbol
            </button>
          </div>
        </div>

        {/* Acciones adicionales */}
        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              onClick={onExport}
              className="bg-green-100 text-green-700 hover:bg-green-200 text-sm px-3 py-2"
              icon={FaDownload}
            >
              Exportar
            </Button>
          )}
          
          {hasActiveFilters() && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Filtros activos
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PucFilters;    
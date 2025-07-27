// ===============================================
// 🔧 PucManager.jsx - ARCHIVO COMPLETO CORREGIDO
// ===============================================

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PucTableView from './PucTableView';
import ExportPucModal from './ExportPucModal';
import { pucApi } from '../../api/pucApi';
import { 
  FaDownload, 
  FaFileExcel, 
  FaPlus, 
  FaUpload, 
  FaSearch,
  FaFilter,
  FaRefresh,
  FaCog,
  FaTree,
  FaList,
  FaChartBar
} from 'react-icons/fa';

const PucManager = () => {
  // ===============================================
  // 🎯 ESTADOS PRINCIPALES
  // ===============================================
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de modales
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Estados de vista
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'arbol', 'estadisticas'
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 50,
    busqueda: '',
    tipo: '',
    naturaleza: '',
    estado: 'ACTIVA',
    codigo_padre: '',
    solo_cuentas_movimiento: false,
    incluir_inactivas: false
  });

  // Estados de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ===============================================
  // 🚨 DEBUG Y LOGGING
  // ===============================================
  console.log('🎯 PucManager render:', {
    cuentasLength: cuentas.length,
    cuentasType: Array.isArray(cuentas) ? 'Array' : typeof cuentas,
    loading,
    error,
    filtros,
    vistaActual
  });

  // ===============================================
  // 🔄 EFECTOS
  // ===============================================
  
  // Cargar cuentas al montar el componente y cuando cambien los filtros
  useEffect(() => {
    cargarCuentas();
  }, [filtros]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filtros.busqueda) {
        setFiltros(prev => ({
          ...prev,
          busqueda: searchTerm,
          page: 1 // Reset página al buscar
        }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // ===============================================
  // 🔧 FUNCIONES PRINCIPALES
  // ===============================================

  // ✅ FUNCIÓN CORREGIDA PARA CARGAR CUENTAS
  const cargarCuentas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Cargando cuentas con filtros:', filtros);
      
      const response = await pucApi.obtenerCuentas(filtros);
      console.log('📊 Respuesta completa de API:', response);
      console.log('📊 Tipo de response:', typeof response);
      console.log('📊 response.data:', response.data);
      console.log('📊 Tipo de response.data:', Array.isArray(response.data) ? 'Array' : typeof response.data);
      
      // ✅ MANEJO DEFENSIVO DE LA RESPUESTA
      let cuentasData = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // Caso 1: response.data es directamente un array
          cuentasData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Caso 2: estructura anidada { data: { data: [...] } }
          cuentasData = response.data.data;
        } else if (response.data.cuentas && Array.isArray(response.data.cuentas)) {
          // Caso 3: { data: { cuentas: [...] } }
          cuentasData = response.data.cuentas;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // Caso 4: { data: { items: [...] } }
          cuentasData = response.data.items;
        } else {
          console.warn('⚠️ Estructura de datos inesperada:', response.data);
          cuentasData = [];
        }
      } else if (Array.isArray(response)) {
        // Caso 5: La respuesta directa es un array
        cuentasData = response;
      } else {
        console.warn('⚠️ Respuesta inesperada de la API:', response);
        cuentasData = [];
      }
      
      console.log('✅ Cuentas procesadas:', cuentasData.length, cuentasData);
      setCuentas(cuentasData);
      
      // Mostrar mensaje de éxito solo si hay datos
      if (cuentasData.length > 0) {
        toast.success(`${cuentasData.length} cuentas cargadas exitosamente`);
      }
      
    } catch (error) {
      console.error('❌ Error cargando cuentas:', error);
      setError(error.message || 'Error al cargar las cuentas del PUC');
      toast.error('Error al cargar las cuentas del PUC');
      setCuentas([]); // ✅ IMPORTANTE: Siempre fallback a array vacío
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar la lista
  const handleRefresh = () => {
    console.log('🔄 Refrescando lista...');
    setError(null);
    cargarCuentas();
    toast.info('Lista actualizada');
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      page: 1,
      limit: 50,
      busqueda: '',
      tipo: '',
      naturaleza: '',
      estado: 'ACTIVA',
      codigo_padre: '',
      solo_cuentas_movimiento: false,
      incluir_inactivas: false
    });
    setSearchTerm('');
    toast.info('Filtros limpiados');
  };

  // ===============================================
  // 🎛️ HANDLERS DE FILTROS
  // ===============================================

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      page: 1 // Reset página al cambiar filtros
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // ===============================================
  // 🎯 HANDLERS DE ACCIONES
  // ===============================================

  const handleCreateCuenta = () => {
    setShowCreateModal(true);
  };

  const handleImportCuentas = () => {
    setShowImportModal(true);
  };

  const handleExportCuentas = () => {
    setShowExportModal(true);
  };

  const handleEditCuenta = (cuenta) => {
    console.log('📝 Editar cuenta:', cuenta);
    // TODO: Implementar modal de edición
    toast.info(`Editando cuenta: ${cuenta.codigo} - ${cuenta.nombre}`);
  };

  const handleDeleteCuenta = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta cuenta?')) {
      return;
    }

    try {
      await pucApi.eliminarCuenta(id);
      toast.success('Cuenta eliminada exitosamente');
      cargarCuentas(); // Recargar lista
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      toast.error('Error al eliminar la cuenta');
    }
  };

  const handleCreateChild = (cuenta) => {
    console.log('👶 Crear subcuenta de:', cuenta);
    // TODO: Implementar modal de creación de subcuenta
    toast.info(`Creando subcuenta de: ${cuenta.codigo} - ${cuenta.nombre}`);
  };

  // ===============================================
  // 🎨 COMPONENTES DE UI
  // ===============================================

  // Barra de búsqueda y filtros
  const SearchAndFilters = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaFilter className="mr-2" />
            Filtros
          </button>

          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>

            {/* Filtro Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="CLASE">Clase</option>
                <option value="GRUPO">Grupo</option>
                <option value="CUENTA">Cuenta</option>
                <option value="SUBCUENTA">Subcuenta</option>
                <option value="AUXILIAR">Auxiliar</option>
              </select>
            </div>

            {/* Filtro Naturaleza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naturaleza
              </label>
              <select
                value={filtros.naturaleza}
                onChange={(e) => handleFiltroChange('naturaleza', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            {/* Filtro Límite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mostrar
              </label>
              <select
                value={filtros.limit}
                onChange={(e) => handleFiltroChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
                <option value={200}>200 por página</option>
              </select>
            </div>
          </div>

          {/* Checkboxes adicionales */}
          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filtros.solo_cuentas_movimiento}
                onChange={(e) => handleFiltroChange('solo_cuentas_movimiento', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Solo cuentas de movimiento</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filtros.incluir_inactivas}
                onChange={(e) => handleFiltroChange('incluir_inactivas', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Incluir cuentas inactivas</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );

  // Botones de acción principal
  const ActionButtons = () => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <FaRefresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
        Refrescar
      </button>

      <button
        onClick={handleCreateCuenta}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
      >
        <FaPlus className="mr-2" />
        Nueva Cuenta
      </button>

      <button
        onClick={handleImportCuentas}
        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
      >
        <FaUpload className="mr-2" />
        Importar
      </button>

      <button
        onClick={handleExportCuentas}
        className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
      >
        <FaDownload className="mr-2" />
        Exportar
      </button>
    </div>
  );

  // Selector de vista
  const ViewSelector = () => (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setVistaActual('lista')}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          vistaActual === 'lista'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FaList className="mr-2" />
        Lista
      </button>
      
      <button
        onClick={() => setVistaActual('arbol')}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          vistaActual === 'arbol'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FaTree className="mr-2" />
        Árbol
      </button>
      
      <button
        onClick={() => setVistaActual('estadisticas')}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          vistaActual === 'estadisticas'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FaChartBar className="mr-2" />
        Estadísticas
      </button>
    </div>
  );

  // ===============================================
  // 🎨 RENDER PRINCIPAL
  // ===============================================

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Único de Cuentas</h1>
          <p className="text-gray-600 mt-1">
            Gestión y administración del PUC empresarial
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <ViewSelector />
          <ActionButtons />
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <SearchAndFilters />

      {/* Mensaje de Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={handleRefresh}
                className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal según Vista */}
      {vistaActual === 'lista' && (
        <PucTableView 
          cuentas={Array.isArray(cuentas) ? cuentas : []} 
          filtros={filtros}
          setFiltros={setFiltros}
          loading={loading}
          onEdit={handleEditCuenta}
          onDelete={handleDeleteCuenta}
          onCreateChild={handleCreateChild}
        />
      )}

      {vistaActual === 'arbol' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vista de Árbol</h3>
          <p className="text-gray-500">Vista de árbol jerárquico en desarrollo...</p>
        </div>
      )}

      {vistaActual === 'estadisticas' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas del PUC</h3>
          <p className="text-gray-500">Panel de estadísticas en desarrollo...</p>
        </div>
      )}

      {/* Modales */}
      {showExportModal && (
        <ExportPucModal 
          visible={showExportModal}
          onCancel={() => setShowExportModal(false)}
        />
      )}

      {/* TODO: Agregar modales de creación e importación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nueva Cuenta</h3>
            <p className="text-gray-500 mb-4">Modal de creación en desarrollo...</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Importar Cuentas</h3>
            <p className="text-gray-500 mb-4">Modal de importación en desarrollo...</p>
            <button
              onClick={() => setShowImportModal(false)}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PucManager;
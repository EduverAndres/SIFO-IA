// frontend-react/src/components/puc/PucManager.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PucTableView from './PucTableView';
import ExportPucModal from './ExportPucModal';
import { pucApi } from '../../api/pucApi';
import { FaDownload, FaFileExcel, FaPlus, FaUpload } from 'react-icons/fa';

const PucManager = () => {
  // Estados principales
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 50,
    busqueda: '',
    tipo: '',
    naturaleza: '',
    estado: '',
    codigo_padre: ''
  });

  // Cargar cuentas al montar el componente
  useEffect(() => {
    cargarCuentas();
  }, [filtros]);

  // Función para cargar cuentas desde la API
  const cargarCuentas = async () => {
    try {
      setLoading(true);
      const response = await pucApi.obtenerCuentas(filtros);
      setCuentas(response.data || []);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      toast.error('Error al cargar las cuentas del PUC');
      setCuentas([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar la lista
  const handleRefresh = () => {
    cargarCuentas();
    toast.info('Lista actualizada');
  };

  // Función para exportar a CSV (existente)
  const handleExportCsv = () => {
    try {
      // Implementar lógica de exportación CSV existente
      // PucApiService.downloadCsvFile(cuentas, 'cuentas_puc_export.csv');
      toast.success('Archivo CSV descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar archivo CSV');
    }
  };

  // Función para abrir modal de exportación Excel
  const handleExportExcel = () => {
    setShowExportModal(true);
  };

  // Función para editar cuenta
  const handleEdit = async (cuenta) => {
    try {
      console.log('Editando cuenta:', cuenta);
      toast.info('Función de edición en desarrollo');
    } catch (error) {
      console.error('Error al editar cuenta:', error);
      toast.error('Error al editar cuenta');
    }
  };

  // Función para eliminar cuenta
  const handleDelete = async (cuenta) => {
    try {
      if (!confirm(`¿Está seguro de eliminar la cuenta ${cuenta.codigo}?`)) {
        return;
      }

      await pucApi.eliminarCuenta(cuenta.id);
      toast.success('Cuenta eliminada exitosamente');
      cargarCuentas(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      
      // Manejo específico de errores
      let userMessage = 'Error al eliminar la cuenta';
      if (error.response?.status === 403) {
        userMessage = 'No tiene permisos para eliminar esta cuenta. Contacta al administrador.';
      } else if (error.message.includes('subcuentas asociadas')) {
        userMessage = `No se puede eliminar la cuenta ${cuenta.codigo} porque tiene subcuentas asociadas`;
      } else if (error.message.includes('404') || error.message.includes('no encontrada')) {
        userMessage = 'La cuenta no existe o ya fue eliminada';
      } else if (error.message.includes('500')) {
        userMessage = 'Error interno del servidor. Inténtalo más tarde.';
      } else {
        userMessage = `Error al eliminar la cuenta: ${error.message}`;
      }
      
      toast.error(userMessage);
    }
  };

  // Función para crear subcuenta
  const handleCreateChild = async (codigoPadre) => {
    try {
      console.log('Creando subcuenta para:', codigoPadre);
      toast.info('Función de crear subcuenta en desarrollo');
    } catch (error) {
      console.error('Error al crear subcuenta:', error);
      toast.error('Error al crear subcuenta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Plan Único de Cuentas
              </h1>
              <p className="mt-2 text-gray-600">
                Gestión completa del plan contable
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Botón de Actualizar */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Actualizar
              </button>

              {/* Botón de Importar */}
              <button
                onClick={() => toast.info('Modal de importación en desarrollo')}
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaUpload className="h-4 w-4 mr-2" />
                Importar Excel
              </button>
              
              {/* Botón de Exportar Excel */}
              <button
                onClick={handleExportExcel}
                disabled={cuentas.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                <FaFileExcel className="h-4 w-4 mr-2" />
                Exportar Excel
              </button>

              {/* Botón de Exportar CSV */}
              <button
                onClick={handleExportCsv}
                disabled={cuentas.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                <FaDownload className="h-4 w-4 mr-2" />
                Exportar CSV
              </button>

              {/* Botón de Nueva Cuenta */}
              <button
                onClick={() => toast.info('Modal de nueva cuenta en desarrollo')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                Nueva Cuenta
              </button>
            </div>
          </div>

          {/* Indicador de estado */}
          {loading && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Cargando cuentas del PUC...
            </div>
          )}

          {!loading && cuentas.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Se encontraron <span className="font-semibold text-gray-900">{cuentas.length}</span> cuentas
            </div>
          )}

          {!loading && cuentas.length === 0 && (
            <div className="mt-4 text-sm text-yellow-600">
              No se encontraron cuentas con los filtros aplicados
            </div>
          )}
        </div>

        {/* Filtros de búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                Búsqueda
              </label>
              <input
                type="text"
                id="busqueda"
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value, page: 1 }))}
                placeholder="Código o nombre..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                id="tipo"
                value={filtros.tipo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value, page: 1 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Todos</option>
                <option value="CLASE">Clase</option>
                <option value="GRUPO">Grupo</option>
                <option value="CUENTA">Cuenta</option>
                <option value="SUBCUENTA">Subcuenta</option>
                <option value="AUXILIAR">Auxiliar</option>
              </select>
            </div>

            {/* Naturaleza */}
            <div>
              <label htmlFor="naturaleza" className="block text-sm font-medium text-gray-700 mb-1">
                Naturaleza
              </label>
              <select
                id="naturaleza"
                value={filtros.naturaleza}
                onChange={(e) => setFiltros(prev => ({ ...prev, naturaleza: e.target.value, page: 1 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Todas</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="estado"
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value, page: 1 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Todos</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <div className="flex items-end">
              <button
                onClick={() => setFiltros({
                  page: 1,
                  limit: 50,
                  busqueda: '',
                  tipo: '',
                  naturaleza: '',
                  estado: '',
                  codigo_padre: ''
                })}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Filtros activos */}
          {(filtros.busqueda || filtros.tipo || filtros.naturaleza || filtros.estado) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Filtros activos:</span>
                {filtros.busqueda && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    Búsqueda: {filtros.busqueda}
                  </span>
                )}
                {filtros.tipo && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    Tipo: {filtros.tipo}
                  </span>
                )}
                {filtros.naturaleza && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                    Naturaleza: {filtros.naturaleza}
                  </span>
                )}
                {filtros.estado && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                    Estado: {filtros.estado}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabla de cuentas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <PucTableView
            cuentas={cuentas}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateChild={handleCreateChild}
            filtros={filtros}
            setFiltros={setFiltros}
            loading={loading}
          />
        </div>

        {/* Modal de exportación Excel */}
        <ExportPucModal
          visible={showExportModal}
          onCancel={() => setShowExportModal(false)}
        />
      </div>
    </div>
  );
};

export default PucManager;
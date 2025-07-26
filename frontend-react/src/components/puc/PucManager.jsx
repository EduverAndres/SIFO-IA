// ===============================================
// 🔧 PUCMANAGER CON DEBUG COMPLETO
// ===============================================

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

  // 🚨 DEBUG: Log del estado del componente
  console.log('🎯 PucManager render:', {
    cuentasLength: cuentas.length,
    loading,
    showExportModal,
    filtros
  });

  // Cargar cuentas al montar el componente
  useEffect(() => {
    cargarCuentas();
  }, [filtros]);

  // Función para cargar cuentas desde la API
  const cargarCuentas = async () => {
    try {
      setLoading(true);
      console.log('📡 Cargando cuentas con filtros:', filtros);
      
      const response = await pucApi.obtenerCuentas(filtros);
      console.log('📊 Respuesta de API:', response);
      
      setCuentas(response.data || []);
      console.log('✅ Cuentas cargadas:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Error cargando cuentas:', error);
      toast.error('Error al cargar las cuentas del PUC');
      setCuentas([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar la lista
  const handleRefresh = () => {
    console.log('🔄 Refrescando lista...');
    cargarCuentas();
    toast.info('Lista actualizada');
  };

  // Función para exportar a CSV (existente)
  const handleExportCsv = () => {
    console.log('📄 Exportando CSV...');
    try {
      toast.success('Archivo CSV descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar archivo CSV');
    }
  };

  // 🚨 FUNCIÓN DE EXPORTACIÓN CON DEBUG COMPLETO
  const handleExportExcel = () => {
    console.log('🎯 handleExportExcel ejecutándose...');
    console.log('📊 Estado actual:', {
      cuentasLength: cuentas.length,
      loading,
      showExportModal
    });
    
    // Forzar apertura del modal
    setShowExportModal(true);
    console.log('✅ setShowExportModal(true) ejecutado');
    
    // Verificar que el estado se actualice
    setTimeout(() => {
      console.log('⏰ Estado después de 100ms:', {
        showExportModal: showExportModal
      });
    }, 100);
  };

  // Función para probar si los eventos funcionan
  const handleTestClick = () => {
    console.log('🧪 Test click funcionando!');
    alert('El evento onClick funciona correctamente');
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
      cargarCuentas();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      
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
        {/* 🚨 DEBUG: Panel de información */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-bold text-yellow-800">🔍 DEBUG INFO:</h4>
          <p>Cuentas cargadas: {cuentas.length}</p>
          <p>Loading: {loading ? 'SÍ' : 'NO'}</p>
          <p>Modal visible: {showExportModal ? 'SÍ' : 'NO'}</p>
          <p>Botón deshabilitado: {cuentas.length === 0 ? 'SÍ' : 'NO'}</p>
        </div>

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
              {/* 🧪 BOTÓN DE PRUEBA */}
              <button
                onClick={handleTestClick}
                className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                🧪 Test Click
              </button>

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
                onClick={() => {
                  console.log('🔵 Botón Importar clickeado');
                  toast.info('Modal de importación en desarrollo');
                }}
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaUpload className="h-4 w-4 mr-2" />
                Importar Excel
              </button>
              
              {/* 🚨 BOTÓN DE EXPORTAR EXCEL CON DEBUG */}
              <button
                onClick={(e) => {
                  console.log('🔴 Evento click capturado en botón Exportar Excel');
                  console.log('🔴 Event object:', e);
                  console.log('🔴 Button disabled?', e.target.disabled);
                  console.log('🔴 cuentas.length:', cuentas.length);
                  handleExportExcel();
                }}
                disabled={false} // 🚨 TEMPORALMENTE FORZADO A false PARA DEBUG
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                  cuentas.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                <FaFileExcel className="h-4 w-4 mr-2" />
                Exportar Excel {cuentas.length === 0 && '(Sin cuentas)'}
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
                onClick={() => {
                  console.log('🟢 Botón Nueva Cuenta clickeado');
                  toast.info('Modal de nueva cuenta en desarrollo');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                Nueva Cuenta
              </button>
            </div>
          </div>

          {/* Indicadores de estado */}
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
              ⚠️ No se encontraron cuentas con los filtros aplicados
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

        {/* 🚨 MODAL DE EXPORTACIÓN CON DEBUG */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">🎯 MODAL DE DEBUG</h3>
              <p>El modal está funcionando!</p>
              <button
                onClick={() => setShowExportModal(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal de exportación normal */}
        <ExportPucModal
          visible={showExportModal}
          onCancel={() => {
            console.log('🔴 Cerrando modal de exportación');
            setShowExportModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default PucManager;
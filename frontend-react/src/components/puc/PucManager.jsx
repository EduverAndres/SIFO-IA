// src/components/puc/PucManager.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PucTableView from './PucTableView';
import PucApiService from '../../api/pucApi';

const PucManager = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 50,
    busqueda: '',
    tipo: '',
    naturaleza: '',
    estado: '',
    codigo_padre: ''
  });

  // Cargar cuentas al inicializar el componente
  useEffect(() => {
    cargarCuentas();
  }, [filtros]);

  // Función para cargar cuentas
  const cargarCuentas = async () => {
    setLoading(true);
    try {
      const response = await PucApiService.getCuentas(filtros);
      
      if (response.success) {
        setCuentas(response.data || []);
      } else {
        toast.error('Error al cargar las cuentas');
        setCuentas([]);
      }
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      toast.error('Error al conectar con el servidor');
      setCuentas([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la edición de una cuenta
  const handleEdit = async (cuenta) => {
    try {
      // Aquí puedes abrir un modal de edición o navegar a una página de edición
      console.log('Editando cuenta:', cuenta);
      toast.info('Función de edición en desarrollo');
      
      // Ejemplo de cómo se implementaría la edición:
      /*
      const updatedData = {
        nombre: 'Nuevo nombre',
        descripcion: 'Nueva descripción',
        estado: 'ACTIVA'
      };
      
      const response = await PucApiService.updateCuenta(cuenta.id, updatedData);
      
      if (response.success) {
        toast.success('Cuenta actualizada exitosamente');
        cargarCuentas(); // Recargar la lista
      } else {
        toast.error(response.message || 'Error al actualizar la cuenta');
      }
      */
    } catch (error) {
      console.error('Error al editar cuenta:', error);
      toast.error('Error al editar la cuenta');
    }
  };

  // Función para manejar la eliminación de una cuenta
  const handleDelete = async (cuenta) => {
    try {
      console.log('🗑️ Iniciando eliminación de cuenta:', cuenta);
      
      // ✅ AQUÍ SE CONECTA: Pasamos solo el ID al endpoint
      const response = await PucApiService.deleteCuenta(cuenta.id);
      
      if (response.success) {
        toast.success(`Cuenta ${cuenta.codigo} - ${cuenta.nombre} eliminada exitosamente`);
        // Actualizar la lista local removiendo la cuenta eliminada
        setCuentas(prevCuentas => 
          prevCuentas.filter(c => c.id !== cuenta.id)
        );
      } else {
        toast.error(response.message || 'Error al eliminar la cuenta');
      }
    } catch (error) {
      console.error('❌ Error al eliminar cuenta:', error);
      
      // Mostrar mensaje de error específico basado en el tipo de error
      if (error.message.includes('subcuentas asociadas')) {
        toast.error(`No se puede eliminar la cuenta ${cuenta.codigo} porque tiene subcuentas asociadas`);
      } else if (error.message.includes('404') || error.message.includes('no encontrada')) {
        toast.error('La cuenta no existe o ya fue eliminada');
        // Remover de la lista local si ya no existe
        setCuentas(prevCuentas => 
          prevCuentas.filter(c => c.id !== cuenta.id)
        );
      } else if (error.message.includes('500')) {
        toast.error('Error interno del servidor. Inténtalo más tarde.');
      } else if (error.message.includes('403') || error.message.includes('401')) {
        toast.error('No tienes permisos para eliminar esta cuenta');
      } else {
        toast.error('Error al eliminar la cuenta: ' + (error.message || 'Error desconocido'));
      }
      
      // Re-lanzar el error para que el componente de tabla pueda manejarlo
      throw error;
    }
  };

  // Función para crear una subcuenta
  const handleCreateChild = async (codigoPadre) => {
    try {
      console.log('Creando subcuenta para:', codigoPadre);
      toast.info('Función de crear subcuenta en desarrollo');
      
      // Aquí puedes implementar la lógica para crear una subcuenta
      // Por ejemplo, abrir un modal con el código padre pre-completado
    } catch (error) {
      console.error('Error al crear subcuenta:', error);
      toast.error('Error al crear subcuenta');
    }
  };

  // Función para refrescar la lista
  const handleRefresh = () => {
    cargarCuentas();
    toast.info('Lista actualizada');
  };

  // Función para exportar a CSV
  const handleExportCsv = () => {
    try {
      PucApiService.downloadCsvFile(cuentas, 'cuentas_puc_export.csv');
      toast.success('Archivo CSV descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar archivo CSV');
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
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
              
              <button
                onClick={handleExportCsv}
                disabled={cuentas.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
            </div>
          </div>
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      </div>
    </div>
  );
};

export default PucManager;
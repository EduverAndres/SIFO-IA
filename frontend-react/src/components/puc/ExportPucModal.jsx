// frontend-react/src/components/puc/ExportPucModal.jsx
import React, { useState } from 'react';
import { 
  FaDownload, 
  FaFilter, 
  FaCog, 
  FaFileExcel, 
  FaTimes,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import Modal from '../Modal'; // ✅ Ruta corregida
import { pucApi } from '../../api/pucApi';
import { toast } from 'react-toastify';

const ExportPucModal = ({ visible, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [opciones, setOpciones] = useState({
    incluir_saldos: true,
    incluir_movimientos: true,
    incluir_fiscal: false,
    filtro_estado: '',
    filtro_tipo: '',
    filtro_clase: '',
    solo_movimientos: false,
    incluir_inactivas: false
  });

  const handleExport = async () => {
    try {
      setLoading(true);
      console.log('🚀 Iniciando exportación con opciones:', opciones);
      
      // Llamar a la API con las opciones seleccionadas
      await pucApi.exportarAExcel(opciones);
      
      toast.success('PUC exportado exitosamente');
      onCancel();
    } catch (error) {
      console.error('❌ Error exportando PUC:', error);
      toast.error(error.response?.data?.message || error.message || 'Error al exportar PUC');
    } finally {
      setLoading(false);
    }
  };

  const handleOpcionChange = (campo, valor) => {
    setOpciones(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  if (!visible) return null;

  return (
    <Modal
      isOpen={visible}
      onClose={onCancel}
      title="Exportar Plan Único de Cuentas"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header con icono */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FaFileExcel className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Exportar a Excel
          </h3>
          <p className="text-gray-600 mb-6">
            Configura las opciones de exportación para generar el archivo Excel del PUC.
          </p>
        </div>

        {/* Opciones de Contenido */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaCog className="w-4 h-4 mr-2" />
            Contenido a Exportar
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={opciones.incluir_saldos}
                  onChange={(e) => handleOpcionChange('incluir_saldos', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="text-sm font-medium text-gray-700">
                  Incluir Saldos Actuales
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={opciones.incluir_movimientos}
                  onChange={(e) => handleOpcionChange('incluir_movimientos', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="text-sm font-medium text-gray-700">
                  Incluir Movimientos Contables
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={opciones.incluir_fiscal}
                  onChange={(e) => handleOpcionChange('incluir_fiscal', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="text-sm font-medium text-gray-700">
                  Incluir Información Fiscal
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={opciones.solo_movimientos}
                  onChange={(e) => handleOpcionChange('solo_movimientos', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo Cuentas con Movimientos
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={opciones.incluir_inactivas}
                  onChange={(e) => handleOpcionChange('incluir_inactivas', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="text-sm font-medium text-gray-700">
                  Incluir Cuentas Inactivas
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaFilter className="w-4 h-4 mr-2" />
            Filtros de Exportación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={opciones.filtro_estado}
                onChange={(e) => handleOpcionChange('filtro_estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVA">Solo Activas</option>
                <option value="INACTIVA">Solo Inactivas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuenta
              </label>
              <select
                value={opciones.filtro_tipo}
                onChange={(e) => handleOpcionChange('filtro_tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="CLASE">Clases</option>
                <option value="GRUPO">Grupos</option>
                <option value="CUENTA">Cuentas</option>
                <option value="SUBCUENTA">Subcuentas</option>
                <option value="AUXILIAR">Auxiliares</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clase
              </label>
              <select
                value={opciones.filtro_clase}
                onChange={(e) => handleOpcionChange('filtro_clase', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las clases</option>
                <option value="1">1 - Activos</option>
                <option value="2">2 - Pasivos</option>
                <option value="3">3 - Patrimonio</option>
                <option value="4">4 - Ingresos</option>
                <option value="5">5 - Gastos</option>
                <option value="6">6 - Costos</option>
                <option value="7">7 - Costos de Producción</option>
                <option value="8">8 - Cuentas de Orden Deudoras</option>
                <option value="9">9 - Cuentas de Orden Acreedoras</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información del formato */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <FaCheck className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Formato de Exportación
              </h4>
              <p className="text-sm text-blue-700">
                El archivo se exportará en formato Excel (.xlsx) con la misma estructura 
                y columnas que la plantilla de importación.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Exportando...
              </>
            ) : (
              <>
                <FaDownload className="-ml-1 mr-2 h-4 w-4" />
                Exportar PUC
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportPucModal;
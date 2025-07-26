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
import Modal from '../common/Modal';
import Button from '../common/Button';
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
      
      // Llamar a la API con las opciones seleccionadas
      await pucApi.exportarAExcel(opciones);
      
      toast.success('PUC exportado exitosamente');
      onCancel();
    } catch (error) {
      console.error('Error exportando PUC:', error);
      toast.error(error.response?.data?.message || 'Error al exportar PUC. Intente nuevamente.');
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
    <Modal onClose={onCancel}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FaFileExcel className="text-green-600 mr-3" />
              Exportar Plan Único de Cuentas
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
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
                  y columnas que la plantilla de importación. Incluye todas las columnas 
                  jerárquicas, descripciones y campos adicionales según las opciones seleccionadas.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onCancel}
              variant="secondary"
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleExport}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
              icon={loading ? FaSpinner : FaDownload}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  Exportar PUC
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExportPucModal;

// ===============================================
// 🎯 FRONTEND - API Service Completo
// ===============================================

// frontend-react/src/api/pucApi.js - Método exportarAExcel actualizado
const pucApi = {
  // ... otros métodos existentes ...

  // Método de exportación mejorado
  async exportarAExcel(opciones = {}) {
    try {
      const params = new URLSearchParams();
      
      // Mapear opciones con los nombres correctos del backend
      const opcionesBackend = {
        incluir_saldos: opciones.incluir_saldos !== false,
        incluir_movimientos: opciones.incluir_movimientos !== false,
        incluir_fiscal: opciones.incluir_fiscal !== false,
        filtro_estado: opciones.filtro_estado || '',
        filtro_tipo: opciones.filtro_tipo || '',
        filtro_clase: opciones.filtro_clase || '',
        solo_movimientos: opciones.solo_movimientos || false,
        incluir_inactivas: opciones.incluir_inactivas || false
      };

      // Agregar parámetros no vacíos
      Object.entries(opcionesBackend).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      console.log('📤 Exportando PUC con opciones:', opcionesBackend);

      const response = await api.get(`/puc/exportar/excel?${params.toString()}`, {
        responseType: 'blob',
        timeout: 300000 // 5 minutos para exportaciones grandes
      });

      // Generar nombre de archivo con timestamp
      const fecha = new Date();
      const timestamp = fecha.toISOString().split('T')[0];
      const hora = fecha.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `puc_export_${timestamp}_${hora}.xlsx`;

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);

      console.log('✅ Archivo descargado exitosamente:', fileName);
      return { success: true, fileName };

    } catch (error) {
      console.error('❌ Error exportando PUC:', error);
      
      // Manejo específico de errores
      if (error.response?.status === 404) {
        throw new Error('No se encontraron cuentas para exportar con los filtros especificados');
      } else if (error.response?.status === 500) {
        throw new Error('Error interno del servidor al generar el archivo');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Error de conexión. Verifique su conexión a internet');
      } else {
        throw new Error(error.response?.data?.message || 'Error al exportar el archivo PUC');
      }
    }
  },

  // Método para descargar template (ya existente, mejorado)
  async descargarTemplate(conEjemplos = true) {
    try {
      console.log(`📄 Descargando template PUC (con ejemplos: ${conEjemplos})`);
      
      const response = await api.get(`/puc/exportar/template?con_ejemplos=${conEjemplos}`, {
        responseType: 'blob',
        timeout: 60000
      });

      const fileName = `puc_template_${conEjemplos ? 'con_ejemplos' : 'vacio'}.xlsx`;
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);

      console.log('✅ Template descargado exitosamente:', fileName);
      return { success: true, fileName };

    } catch (error) {
      console.error('❌ Error descargando template:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar template');
    }
  }
};
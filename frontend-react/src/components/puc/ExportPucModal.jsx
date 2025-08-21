// frontend-react/src/components/puc/ExportPucModal.jsx
import React, { useState } from 'react';
import {
  FaFileExport,
  FaTimes,
  FaDownload,
  FaFilter,
  FaCogs,
  FaInfoCircle,
  FaChartBar,
  FaMoneyBillWave,
  FaBalanceScale,
  FaClipboardList,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { pucApi } from '../../api/pucApi';

const ExportPucModal = ({ visible, onCancel }) => {
  console.log('🔍 ExportPucModal renderizado - Props recibidas:', { visible, onCancel });
  
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

  React.useEffect(() => {
    console.log('🔍 ExportPucModal - useEffect - visible cambió a:', visible);
  }, [visible]);

  const handleExport = async () => {
    try {
      console.log('🚀 Iniciando exportación real con opciones:', opciones);
      setLoading(true);
      
      const resultado = await pucApi.exportarAExcel(opciones);
      
      console.log('✅ Exportación completada:', resultado);
      
      // Notificación más elegante
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Archivo exportado exitosamente`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
      onCancel();
      
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Error: ${error.message || 'Error desconocido'}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 5000);
      
    } finally {
      setLoading(false);
    }
  };

  const handleOpcionChange = (campo, valor) => {
    console.log('🔍 Cambiando opción:', campo, 'a:', valor);
    setOpciones(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  if (!visible) {
    console.log('🔍 ExportPucModal NO se renderiza porque visible es:', visible);
    return null;
  }

  console.log('🔍 ExportPucModal SE VA A RENDERIZAR - visible es true');

  return (
    <Modal
      show={visible}
      onClose={onCancel}
      title="Exportar Plan Único de Cuentas"
      size="2xl"
    >
      <div className="space-y-8">
        
        {/* Header con glassmorphism */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5"></div>
          <div className="relative text-center">
            <div className="mx-auto w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30 mb-6">
              <FaFileExport className="text-3xl text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              Exportación Personalizada
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Descarga tu Plan Único de Cuentas en formato Excel con las opciones y filtros que prefieras.
            </p>
          </div>
        </div>

        {/* Opciones de contenido */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-slate-800 flex items-center">
            <FaClipboardList className="mr-3 text-slate-600" />
            Contenido a Exportar
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'incluir_saldos',
                title: 'Incluir Saldos Actuales',
                description: 'Saldos iniciales y finales de cada cuenta',
                icon: <FaMoneyBillWave className="text-emerald-600" />,
                color: 'emerald'
              },
              {
                key: 'incluir_movimientos',
                title: 'Incluir Movimientos',
                description: 'Movimientos débitos y créditos',
                icon: <FaChartBar className="text-blue-600" />,
                color: 'blue'
              },
              {
                key: 'incluir_fiscal',
                title: 'Incluir Info Fiscal',
                description: 'F350, F300, exógena, etc.',
                icon: <FaBalanceScale className="text-purple-600" />,
                color: 'purple'
              },
              {
                key: 'solo_movimientos',
                title: 'Solo con Movimientos',
                description: 'Excluir cuentas sin actividad',
                icon: <FaFilter className="text-orange-600" />,
                color: 'orange'
              },
              {
                key: 'incluir_inactivas',
                title: 'Incluir Cuentas Inactivas',
                description: 'Incluir cuentas deshabilitadas',
                icon: <FaCogs className="text-slate-600" />,
                color: 'slate'
              }
            ].map((option) => (
              <label 
                key={option.key}
                className="group cursor-pointer"
              >
                <div className={`p-5 border-2 rounded-xl transition-all duration-200 ${
                  opciones[option.key] 
                    ? `border-${option.color}-300 bg-${option.color}-50/60 shadow-md shadow-${option.color}-500/10` 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={opciones[option.key]}
                          onChange={(e) => handleOpcionChange(option.key, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          opciones[option.key]
                            ? `border-${option.color}-500 bg-${option.color}-500`
                            : 'border-slate-300 bg-white'
                        }`}>
                          {opciones[option.key] && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-xl">{option.icon}</div>
                        <span className="font-semibold text-slate-800 group-hover:text-slate-900">
                          {option.title}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-slate-800 flex items-center">
            <FaFilter className="mr-3 text-slate-600" />
            Filtros Avanzados
          </h4>
          
          <div className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Estado de la Cuenta
                </label>
                <select 
                  value={opciones.filtro_estado}
                  onChange={(e) => handleOpcionChange('filtro_estado', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white"
                >
                  <option value="">Todas las cuentas</option>
                  <option value="ACTIVA">Solo activas</option>
                  <option value="INACTIVA">Solo inactivas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Tipo de Cuenta
                </label>
                <select 
                  value={opciones.filtro_tipo}
                  onChange={(e) => handleOpcionChange('filtro_tipo', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white"
                >
                  <option value="">Todos los tipos</option>
                  <option value="CLASE">Clases</option>
                  <option value="GRUPO">Grupos</option>
                  <option value="CUENTA">Cuentas</option>
                  <option value="SUBCUENTA">Subcuentas</option>
                  <option value="DETALLE">Detalles</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Clase Específica
                </label>
                <select 
                  value={opciones.filtro_clase}
                  onChange={(e) => handleOpcionChange('filtro_clase', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white"
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
        </div>

        {/* Información del archivo */}
        <div className="bg-blue-50/80 border border-blue-200/60 rounded-xl p-6">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <FaInfoCircle className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Información del Archivo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <strong>Formato:</strong> Excel (.xlsx)
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <strong>Estructura:</strong> Compatible con importación
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <strong>Descarga:</strong> Automática al completar
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <strong>Campos:</strong> Todos los campos del PUC
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de selección */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6">
          <h5 className="font-semibold text-slate-800 mb-4">Resumen de Exportación</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-600">
                {opciones.incluir_saldos ? '✓' : '✗'}
              </div>
              <div className="text-xs text-slate-600">Saldos</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {opciones.incluir_movimientos ? '✓' : '✗'}
              </div>
              <div className="text-xs text-slate-600">Movimientos</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">
                {opciones.incluir_fiscal ? '✓' : '✗'}
              </div>
              <div className="text-xs text-slate-600">Info Fiscal</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(opciones).filter(v => typeof v === 'string' && v !== '').length}
              </div>
              <div className="text-xs text-slate-600">Filtros Activos</div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200/60">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <FaDownload />
                <span>Exportar PUC</span>
              </>
            )}
          </Button>
        </div>

        {/* Debug info (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold mb-2">🔍 Debug Info</summary>
            <div className="space-y-2 font-mono">
              <div><strong>Props:</strong> {JSON.stringify({ visible, onCancel: typeof onCancel }, null, 2)}</div>
              <div><strong>Loading:</strong> {JSON.stringify(loading)}</div>
              <div><strong>Opciones:</strong> {JSON.stringify(opciones, null, 2)}</div>
            </div>
          </details>
        )}
      </div>
    </Modal>
  );
};

export default ExportPucModal;
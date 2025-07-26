// frontend-react/src/components/puc/ExportPucModal.jsx
import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import SelectField from '../SelectField';

const ExportPucModal = ({ visible, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    filtro_estado: 'TODAS',
    filtro_tipo: '',
    filtro_clase: '',
    solo_movimientos: false,
    incluir_inactivas: true,
    incluir_saldos: true,
    incluir_movimientos: false,
    incluir_fiscal: false,
  });

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });

      // Llamar a la API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/puc/exportar/excel?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error en la exportación');
      }

      // Descargar archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fecha = new Date().toISOString().slice(0, 10);
      link.download = `PUC_Export_${fecha}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Cerrar modal y resetear
      onCancel();
      setFormData({
        filtro_estado: 'TODAS',
        filtro_tipo: '',
        filtro_clase: '',
        solo_movimientos: false,
        incluir_inactivas: true,
        incluir_saldos: true,
        incluir_movimientos: false,
        incluir_fiscal: false,
      });
      
    } catch (error) {
      console.error('Error exportando PUC:', error);
      alert('Error al exportar el archivo. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal onClose={onCancel}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Plan Único de Cuentas
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros de Exportación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <SelectField
                label="Estado"
                value={formData.filtro_estado}
                onChange={(value) => handleInputChange('filtro_estado', value)}
                options={[
                  { value: 'TODAS', label: 'Todas' },
                  { value: 'ACTIVA', label: 'Activas' },
                  { value: 'INACTIVA', label: 'Inactivas' },
                  { value: 'SUSPENDIDA', label: 'Suspendidas' }
                ]}
              />
              
              <SelectField
                label="Tipo de Cuenta"
                value={formData.filtro_tipo}
                onChange={(value) => handleInputChange('filtro_tipo', value)}
                options={[
                  { value: '', label: 'Todos los tipos' },
                  { value: 'MADRE', label: 'Cuentas Madre' },
                  { value: 'DETALLE', label: 'Cuentas Detalle' }
                ]}
              />
              
              <SelectField
                label="Clase"
                value={formData.filtro_clase}
                onChange={(value) => handleInputChange('filtro_clase', value)}
                options={[
                  { value: '', label: 'Todas las clases' },
                  { value: '1', label: '1 - Activos' },
                  { value: '2', label: '2 - Pasivos' },
                  { value: '3', label: '3 - Patrimonio' },
                  { value: '4', label: '4 - Ingresos' },
                  { value: '5', label: '5 - Gastos' },
                  { value: '6', label: '6 - Costos' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.solo_movimientos}
                  onChange={(e) => handleInputChange('solo_movimientos', e.target.checked)}
                  className="mr-2"
                />
                Solo cuentas que aceptan movimientos
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.incluir_inactivas}
                  onChange={(e) => handleInputChange('incluir_inactivas', e.target.checked)}
                  className="mr-2"
                />
                Incluir cuentas inactivas
              </label>
            </div>
          </div>

          {/* Contenido */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Contenido a Exportar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.incluir_saldos}
                  onChange={(e) => handleInputChange('incluir_saldos', e.target.checked)}
                  className="mr-2"
                />
                Incluir saldos
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.incluir_movimientos}
                  onChange={(e) => handleInputChange('incluir_movimientos', e.target.checked)}
                  className="mr-2"
                />
                Incluir movimientos
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.incluir_fiscal}
                  onChange={(e) => handleInputChange('incluir_fiscal', e.target.checked)}
                  className="mr-2"
                />
                Incluir información fiscal
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {loading ? 'Exportando...' : 'Exportar Excel'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExportPucModal;

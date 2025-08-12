// components/puc/PucFormModal.jsx
import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaEdit, FaPlus } from 'react-icons/fa';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { usePucValidation } from '../../hooks/usePucValidation';
import { ACCOUNT_TYPES, NATURE_TYPES } from '../../constants/pucConstants';
import { obtenerColorNivel, obtenerColorNaturaleza, obtenerColorTipoCuenta } from '../../utils/formatters';

const PucFormModal = ({
  show,
  onClose,
  onSubmit,
  editingAccount,
  formData,
  setFormData,
  loading
}) => {
  const { analisisJerarquico, validacion, datosEnriquecidos, aplicarSugerencias } = usePucValidation(formData);

  const handleInputChange = (field, value) => {
    if (field === 'codigo_completo') {
      const sugerencias = aplicarSugerencias();
      setFormData({
        ...formData,
        [field]: value,
        tipo_cuenta: sugerencias.tipo_cuenta,
        naturaleza: sugerencias.naturaleza,
        codigo_padre: sugerencias.codigo_padre
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(datosEnriquecidos);
  };

  const aplicarSugerenciasManual = () => {
    const sugerencias = aplicarSugerencias();
    setFormData(sugerencias);
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={editingAccount ? 'Editar Cuenta PUC' : 'Nueva Cuenta PUC'}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Información jerárquica en tiempo real */}
        {analisisJerarquico && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-800 flex items-center">
                <FaInfoCircle className="mr-2" />
                Análisis Jerárquico Automático
              </h4>
              <button
                type="button"
                onClick={aplicarSugerenciasManual}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Aplicar Todas las Sugerencias
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Tipo sugerido:</span>
                <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${
                  obtenerColorTipoCuenta(analisisJerarquico.tipoSugerido)
                }`}>
                  {analisisJerarquico.tipoSugerido || 'INDEFINIDO'}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Nivel:</span>
                <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${obtenerColorNivel(analisisJerarquico.nivel)}`}>
                  Nivel {analisisJerarquico.nivel}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Naturaleza sugerida:</span>
                <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${obtenerColorNaturaleza(analisisJerarquico.naturalezaSugerida)}`}>
                  {analisisJerarquico.naturalezaSugerida}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Padre sugerido:</span>
                <div className="mt-1 font-mono text-xs text-gray-700">
                  {analisisJerarquico.padreSugerido || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Código con autocompletado y validación */}
          <div>
            <Input
              label="Código Completo *"
              value={formData.codigo_completo}
              onChange={(e) => handleInputChange('codigo_completo', e.target.value)}
              placeholder="ej: 110501 (automático: tipo, nivel, naturaleza)"
              required
              disabled={editingAccount}
            />
            {analisisJerarquico && (
              <div className="mt-1 text-xs text-gray-500">
                Longitud: {analisisJerarquico.longitud} dígitos
              </div>
            )}
          </div>
          
          {/* Tipo con validación automática */}
          <Select
            label="Tipo de Cuenta"
            value={formData.tipo_cuenta}
            onChange={(e) => handleInputChange('tipo_cuenta', e.target.value)}
            options={ACCOUNT_TYPES.map(type => ({
              value: type.value,
              label: type.label
            }))}
          />
          
          <div className="md:col-span-2">
            <Input
              label="Descripción *"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción clara y completa de la cuenta"
              required
            />
          </div>
          
          <Select
            label="Naturaleza"
            value={formData.naturaleza}
            onChange={(e) => handleInputChange('naturaleza', e.target.value)}
            options={NATURE_TYPES.map(nature => ({
              value: nature.value,
              label: nature.label
            }))}
          />
          
          {/* Código padre con ayuda */}
          <div>
            <Input
              label="Código Padre"
              value={formData.codigo_padre}
              onChange={(e) => handleInputChange('codigo_padre', e.target.value)}
              placeholder={analisisJerarquico?.padreSugerido || "ej: 1105"}
            />
            {analisisJerarquico?.padreSugerido && (
              <button
                type="button"
                onClick={() => handleInputChange('codigo_padre', analisisJerarquico.padreSugerido)}
                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
              >
                Usar sugerido: {analisisJerarquico.padreSugerido}
              </button>
            )}
          </div>
          
          <div className="md:col-span-2 flex items-center space-x-3">
            <input
              type="checkbox"
              id="acepta_movimientos"
              checked={formData.acepta_movimientos}
              onChange={(e) => handleInputChange('acepta_movimientos', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="acepta_movimientos" className="text-sm font-medium text-gray-700">
              Acepta movimientos contables
            </label>
          </div>
        </div>

        {/* Validaciones en tiempo real */}
        {formData.codigo_completo && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Validaciones:</h4>
            {validacion.valido ? (
              <div className="flex items-center space-x-2 text-green-600">
                <FaCheckCircle />
                <span className="text-sm">Código válido para la jerarquía PUC</span>
              </div>
            ) : (
              <div className="space-y-1">
                {validacion.errores.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2 text-red-600">
                    <FaExclamationTriangle />
                    <span className="text-sm">{error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!validacion.valido}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            icon={editingAccount ? FaEdit : FaPlus}
          >
            {editingAccount ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PucFormModal;
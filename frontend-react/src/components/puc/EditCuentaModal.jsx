// src/components/puc/EditCuentaModal.jsx
import React, { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTimes,
  FaCode,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
} from 'react-icons/fa';
import Modal from '../Modal';
import Button from '../Button';

const EditCuentaModal = ({ isOpen, onClose, onSubmit, cuenta }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo_cuenta: 'AUXILIAR',
    naturaleza: 'DEBITO',
    estado: 'ACTIVA',
    codigo_padre: '',
    acepta_movimientos: true,
    requiere_tercero: false,
    requiere_centro_costo: false,
    dinamica: '',
    es_cuenta_niif: false,
    codigo_niif: '',
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasMovimientos, setHasMovimientos] = useState(false);
  const [hasSubcuentas, setHasSubcuentas] = useState(false);

  // Cargar datos de la cuenta cuando se abre el modal
  useEffect(() => {
    if (cuenta && isOpen) {
      setFormData({
        codigo: cuenta.codigo || '',
        nombre: cuenta.nombre || '',
        descripcion: cuenta.descripcion || '',
        tipo_cuenta: cuenta.tipo_cuenta || 'AUXILIAR',
        naturaleza: cuenta.naturaleza || 'DEBITO',
        estado: cuenta.estado || 'ACTIVA',
        codigo_padre: cuenta.codigo_padre || '',
        acepta_movimientos: cuenta.acepta_movimientos || false,
        requiere_tercero: cuenta.requiere_tercero || false,
        requiere_centro_costo: cuenta.requiere_centro_costo || false,
        dinamica: cuenta.dinamica || '',
        es_cuenta_niif: cuenta.es_cuenta_niif || false,
        codigo_niif: cuenta.codigo_niif || '',
      });

      // Simular verificación de movimientos y subcuentas
      // En un escenario real, estos datos vendrían del backend
      setHasMovimientos(false); // TODO: Verificar si tiene movimientos contables
      setHasSubcuentas(cuenta.subcuentas && cuenta.subcuentas.length > 0);
    }
  }, [cuenta, isOpen]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.codigo) {
      errors.codigo = 'El código es obligatorio';
    } else if (!/^[0-9]+$/.test(formData.codigo)) {
      errors.codigo = 'El código debe contener solo números';
    }
    
    if (!formData.nombre) {
      errors.nombre = 'El nombre es obligatorio';
    }
    
    if (formData.codigo_padre && !/^[0-9]*$/.test(formData.codigo_padre)) {
      errors.codigo_padre = 'El código padre debe contener solo números';
    }
    
    if (formData.es_cuenta_niif && !formData.codigo_niif) {
      errors.codigo_niif = 'El código NIIF es obligatorio cuando se marca como cuenta NIIF';
    }
    
    // Validaciones especiales para cuentas con movimientos
    if (hasMovimientos) {
      if (formData.estado === 'INACTIVA') {
        errors.estado = 'No se puede inactivar una cuenta con movimientos contables';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Confirmación especial para cambios críticos
    if (hasSubcuentas && formData.acepta_movimientos !== cuenta.acepta_movimientos) {
      const confirmar = window.confirm(
        'Esta cuenta tiene subcuentas. ¿Está seguro de cambiar la configuración de movimientos?'
      );
      if (!confirmar) return;
    }
    
    setLoading(true);
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        handleClose();
      }
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error de validación cuando el usuario corrige
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getTipoCuentaInfo = (tipo) => {
    const info = {
      CLASE: { color: 'text-purple-600', nivel: 1 },
      GRUPO: { color: 'text-blue-600', nivel: 2 },
      CUENTA: { color: 'text-green-600', nivel: 3 },
      SUBCUENTA: { color: 'text-yellow-600', nivel: 4 },
      AUXILIAR: { color: 'text-gray-600', nivel: 5 },
    };
    return info[tipo] || info.AUXILIAR;
  };

  const tipoInfo = getTipoCuentaInfo(formData.tipo_cuenta);

  if (!cuenta) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Editar Cuenta: ${cuenta.codigo} - ${cuenta.nombre}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alertas de advertencia */}
        {(hasMovimientos || hasSubcuentas) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Advertencias importantes:</h4>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  {hasMovimientos && (
                    <li>Esta cuenta tiene movimientos contables registrados</li>
                  )}
                  {hasSubcuentas && (
                    <li>Esta cuenta tiene subcuentas asociadas ({cuenta.subcuentas?.length || 0})</li>
                  )}
                  <li>Algunos cambios pueden afectar la integridad de los datos</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de la Cuenta <span className="text-red-500">*</span>
              {hasMovimientos && <FaLock className="inline ml-1 text-gray-400" title="Campo protegido" />}
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => handleInputChange('codigo', e.target.value)}
              pattern="[0-9]+"
              title="Solo números"
              disabled={hasMovimientos}
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                validationErrors.codigo ? 'border-red-500' : 'border-gray-300'
              } ${hasMovimientos ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ej: 1105, 110505"
            />
            {validationErrors.codigo && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.codigo}</p>
            )}
            {hasMovimientos && (
              <p className="text-xs text-gray-500 mt-1">
                No se puede modificar el código de una cuenta con movimientos
              </p>
            )}
          </div>

          {/* Código Padre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código Padre
              {hasSubcuentas && <FaLock className="inline ml-1 text-gray-400" title="Campo protegido" />}
            </label>
            <input
              type="text"
              value={formData.codigo_padre}
              onChange={(e) => handleInputChange('codigo_padre', e.target.value)}
              pattern="[0-9]*"
              disabled={hasSubcuentas}
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                validationErrors.codigo_padre ? 'border-red-500' : 'border-gray-300'
              } ${hasSubcuentas ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Opcional"
            />
            {validationErrors.codigo_padre && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.codigo_padre}</p>
            )}
            {hasSubcuentas && (
              <p className="text-xs text-gray-500 mt-1">
                No se puede cambiar la jerarquía de una cuenta con subcuentas
              </p>
            )}
          </div>
        </div>

        {/* Información de tipo */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FaCode className={tipoInfo.color} />
            <span className={`text-sm font-medium ${tipoInfo.color}`}>
              {formData.tipo_cuenta} - Nivel {tipoInfo.nivel}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Longitud del código: {formData.codigo.length} dígitos
          </p>
        </div>

        {/* Nombre y descripción */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Cuenta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre descriptivo de la cuenta"
            />
            {validationErrors.nombre && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              rows="3"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción detallada del propósito de la cuenta"
            />
          </div>
        </div>

        {/* Configuración básica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cuenta
              {hasMovimientos && <FaLock className="inline ml-1 text-gray-400" />}
            </label>
            <select
              value={formData.tipo_cuenta}
              onChange={(e) => handleInputChange('tipo_cuenta', e.target.value)}
              disabled={hasMovimientos}
              className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasMovimientos ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="CLASE">Clase</option>
              <option value="GRUPO">Grupo</option>
              <option value="CUENTA">Cuenta</option>
              <option value="SUBCUENTA">Subcuenta</option>
              <option value="AUXILIAR">Auxiliar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Naturaleza
              {hasMovimientos && <FaLock className="inline ml-1 text-gray-400" />}
            </label>
            <select
              value={formData.naturaleza}
              onChange={(e) => handleInputChange('naturaleza', e.target.value)}
              disabled={hasMovimientos}
              className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasMovimientos ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="DEBITO">Débito</option>
              <option value="CREDITO">Crédito</option>
            </select>
            {hasMovimientos && (
              <p className="text-xs text-gray-500 mt-1">
                No se puede cambiar la naturaleza de una cuenta con movimientos
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.estado ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="ACTIVA">Activa</option>
              <option value="INACTIVA">Inactiva</option>
            </select>
            {validationErrors.estado && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.estado}</p>
            )}
          </div>
        </div>

        {/* Opciones avanzadas */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <FaInfoCircle className="mr-2 text-blue-500" />
            Configuración Avanzada
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => handleInputChange('acepta_movimientos', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Acepta movimientos
                  </span>
                  <p className="text-xs text-gray-500">Permite registrar transacciones en esta cuenta</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.requiere_tercero}
                  onChange={(e) => handleInputChange('requiere_tercero', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Requiere tercero
                  </span>
                  <p className="text-xs text-gray-500">Obligatorio especificar un tercero en los movimientos</p>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.requiere_centro_costo}
                  onChange={(e) => handleInputChange('requiere_centro_costo', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Requiere centro de costo
                  </span>
                  <p className="text-xs text-gray-500">Obligatorio especificar centro de costo</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.es_cuenta_niif}
                  onChange={(e) => handleInputChange('es_cuenta_niif', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Es cuenta NIIF
                  </span>
                  <p className="text-xs text-gray-500">Cuenta según Normas Internacionales</p>
                </div>
              </label>
            </div>
          </div>

          {formData.es_cuenta_niif && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código NIIF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.codigo_niif}
                onChange={(e) => handleInputChange('codigo_niif', e.target.value)}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.codigo_niif ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Código equivalente en NIIF"
              />
              {validationErrors.codigo_niif && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.codigo_niif}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dinámica Contable
            </label>
            <textarea
              value={formData.dinamica}
              onChange={(e) => handleInputChange('dinamica', e.target.value)}
              rows="3"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe cuándo se debita y cuándo se acredita esta cuenta"
            />
            <p className="text-xs text-gray-500 mt-1">
              Explicación de cuándo aumenta o disminuye el saldo de la cuenta
            </p>
          </div>
        </div>

        {/* Información adicional */}
        {(hasMovimientos || hasSubcuentas) && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Información de la cuenta:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Fecha de creación: {cuenta.created_at ? new Date(cuenta.created_at).toLocaleDateString() : 'No disponible'}</li>
              <li>• Última actualización: {cuenta.updated_at ? new Date(cuenta.updated_at).toLocaleDateString() : 'No disponible'}</li>
              {hasSubcuentas && <li>• Subcuentas: {cuenta.subcuentas?.length || 0}</li>}
              {hasMovimientos && <li>• Tiene movimientos contables registrados</li>}
            </ul>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            icon={loading ? null : FaEdit}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Actualizando...</span>
              </div>
            ) : (
              'Actualizar Cuenta'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCuentaModal;
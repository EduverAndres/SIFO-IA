// frontend-react/src/components/ui/Modal.jsx - VERSIÓN COMPLETA CON ESTILOS LIMPIOS Y GRANDES
import React, { useEffect, useState, useRef } from 'react';
import { 
  FaTimes, 
  FaPlus, 
  FaEdit, 
  FaSave, 
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaUpload,
  FaFileExcel,
  FaCheckCircle,
  FaDownload,
  FaFilter,
  FaCog,
  FaInfoCircle,
  FaShieldAlt,
  FaCloudUploadAlt,
  FaFileImport,
  FaFileExport
} from 'react-icons/fa';

const Modal = ({
  isOpen,
  show, // Compatibilidad adicional
  onClose,
  title,
  children,
  size = 'xl', // Tamaño por defecto más grande
  maxWidth = 'xl', // Compatibilidad adicional
  showCloseButton = true,
  closeOnOverlayClick = true,
  closable = true, // Compatibilidad adicional
  className = '',
  ...props
}) => {
  // Normalizar la prop de visibilidad
  const isVisible = isOpen || show;

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible && closable) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose, closable]);

  if (!isVisible) return null;

  // Mapear tamaños - TODOS MÁS GRANDES
  const sizeClasses = {
    sm: 'max-w-2xl',    // Era md
    md: 'max-w-3xl',    // Era lg  
    lg: 'max-w-5xl',    // Era 2xl
    xl: 'max-w-6xl',    // Era 4xl
    '2xl': 'max-w-7xl', // Era 6xl
    '3xl': 'max-w-[90vw]', // Nuevo - muy grande
    full: 'max-w-[95vw]'   // Casi pantalla completa
  };

  // Determinar la clase de tamaño
  const sizeClass = sizeClasses[size] || sizeClasses[maxWidth] || sizeClasses.xl;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && closable && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay mejorado */}
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Background overlay con mejor animación */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300"
          aria-hidden="true"
        />

        {/* Spacer element para centrar el modal */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen" 
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel mejorado */}
        <div 
          className={`
            inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden 
            shadow-2xl transform transition-all duration-300 sm:my-8 sm:align-middle sm:w-full 
            ${sizeClass} ${className} border border-gray-200
          `}
          style={{
            maxHeight: '90vh',
            minHeight: '400px'
          }}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {/* Header mejorado */}
          {(title || showCloseButton) && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 pt-8 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {title && (
                  <h3 
                    className="text-2xl font-bold text-gray-900 flex items-center" 
                    id="modal-title"
                  >
                    {title}
                  </h3>
                )}
                
                {showCloseButton && closable && (
                  <button
                    type="button"
                    className="ml-4 bg-white rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 p-3 shadow-sm border border-gray-200"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <FaTimes className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content con scroll mejorado */}
          <div className="bg-white px-8 pb-8 pt-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// 🔥 MODALES CRUD ESPECÍFICOS CON ESTILOS LIMPIOS
// ===============================================

// 1️⃣ MODAL CREAR CUENTA
export const CreateAccountModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false,
  error = null,
  setError = () => {}
}) => {
  const [formData, setFormData] = useState({
    codigo_completo: '',
    descripcion: '',
    naturaleza: 'DEBITO',
    tipo_cuenta: 'DETALLE',
    acepta_movimientos: true,
    codigo_padre: '',
    estado: 'ACTIVA'
  });

  const resetForm = () => {
    setFormData({
      codigo_completo: '',
      descripcion: '',
      naturaleza: 'DEBITO',
      tipo_cuenta: 'DETALLE',
      acepta_movimientos: true,
      codigo_padre: '',
      estado: 'ACTIVA'
    });
  };

  const handleClose = () => {
    resetForm();
    setError(null);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.codigo_completo?.trim()) {
      setError('❌ El código completo es requerido');
      return;
    }
    
    if (!formData.descripcion?.trim()) {
      setError('❌ La descripción es requerida');
      return;
    }

    onSubmit(formData);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaPlus className="text-green-600 text-xl" />
          </div>
          <div>
            <span className="text-gray-900">Nueva Cuenta PUC</span>
            <p className="text-sm text-gray-500 font-normal">Crear una nueva cuenta contable</p>
          </div>
        </div>
      }
      size="3xl"
      closable={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Información principal */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FaInfoCircle className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900">Información Principal</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Código Completo *
              </label>
              <input
                type="text"
                placeholder="Ej: 1105001"
                value={formData.codigo_completo}
                onChange={(e) => setFormData({...formData, codigo_completo: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono bg-white shadow-sm transition-all duration-200"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                El código debe seguir la estructura jerárquica del PUC
              </p>
            </div>
            
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo de Cuenta *
              </label>
              <select
                value={formData.tipo_cuenta}
                onChange={(e) => setFormData({...formData, tipo_cuenta: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white shadow-sm transition-all duration-200"
                required
                disabled={loading}
              >
                <option value="CLASE">🏛️ Clase (1 dígito)</option>
                <option value="GRUPO">📁 Grupo (2 dígitos)</option>
                <option value="CUENTA">📋 Cuenta (4 dígitos)</option>
                <option value="SUBCUENTA">📄 Subcuenta (6 dígitos)</option>
                <option value="DETALLE">🔸 Detalle (7+ dígitos)</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Descripción *
            </label>
            <textarea
              placeholder="Descripción detallada de la cuenta contable"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white shadow-sm resize-none transition-all duration-200"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Configuración contable */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-500 rounded-lg">
              <FaShieldAlt className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-semibold text-green-900">Configuración Contable</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Naturaleza Contable *
              </label>
              <select
                value={formData.naturaleza}
                onChange={(e) => setFormData({...formData, naturaleza: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg bg-white shadow-sm transition-all duration-200"
                required
                disabled={loading}
              >
                <option value="DEBITO">📈 Débito (Activos, Gastos, Costos)</option>
                <option value="CREDITO">📉 Crédito (Pasivos, Patrimonio, Ingresos)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Código Cuenta Padre
              </label>
              <input
                type="text"
                placeholder="Código de la cuenta padre (opcional)"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-mono bg-white shadow-sm transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Estado de la Cuenta *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg bg-white shadow-sm transition-all duration-200"
                required
                disabled={loading}
              >
                <option value="ACTIVA">✅ Activa</option>
                <option value="INACTIVA">❌ Inactiva</option>
              </select>
            </div>

            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                <input
                  type="checkbox"
                  id="acepta_movimientos_crear"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">
                  ✓ Acepta movimientos contables
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Error mejorado */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-red-500 text-xl" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-800 mb-1">Error de Validación</h4>
              <p className="text-red-600">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="p-2 text-red-400 hover:text-red-600 transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Botones mejorados */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md"
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin text-xl" />
                <span>Creando Cuenta...</span>
              </>
            ) : (
              <>
                <FaPlus className="text-xl" />
                <span>Crear Cuenta</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// 2️⃣ MODAL EDITAR CUENTA
export const EditAccountModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false,
  error = null,
  setError = () => {},
  account = null
}) => {
  const [formData, setFormData] = useState({
    codigo_completo: '',
    descripcion: '',
    naturaleza: 'DEBITO',
    tipo_cuenta: 'DETALLE',
    acepta_movimientos: true,
    codigo_padre: '',
    estado: 'ACTIVA'
  });

  const resetForm = () => {
    if (account) {
      setFormData({
        codigo_completo: account.codigo_completo || '',
        descripcion: account.descripcion || '',
        naturaleza: account.naturaleza || 'DEBITO',
        tipo_cuenta: account.tipo_cuenta || 'DETALLE',
        acepta_movimientos: account.acepta_movimientos !== undefined ? account.acepta_movimientos : true,
        codigo_padre: account.codigo_padre || '',
        estado: account.estado || 'ACTIVA'
      });
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.descripcion?.trim()) {
      setError('❌ La descripción es requerida');
      return;
    }

    onSubmit(formData);
  };

  useEffect(() => {
    if (isOpen && account) {
      resetForm();
    }
  }, [isOpen, account]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaEdit className="text-blue-600 text-xl" />
          </div>
          <div>
            <span className="text-gray-900">Editar Cuenta PUC</span>
            <p className="text-sm text-gray-500 font-normal">
              {account?.codigo_completo} - {account?.descripcion}
            </p>
          </div>
        </div>
      }
      size="3xl"
      closable={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Información de la cuenta */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-500 rounded-lg">
              <FaEdit className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-semibold text-amber-900">Modificar Información</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Código Completo (No editable)
              </label>
              <input
                type="text"
                value={formData.codigo_completo}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-lg font-mono shadow-sm cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 mt-2">
                El código no puede modificarse una vez creada la cuenta
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo de Cuenta *
              </label>
              <select
                value={formData.tipo_cuenta}
                onChange={(e) => setFormData({...formData, tipo_cuenta: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg bg-white shadow-sm transition-all duration-200"
                required
                disabled={loading}
              >
                <option value="CLASE">🏛️ Clase (1 dígito)</option>
                <option value="GRUPO">📁 Grupo (2 dígitos)</option>
                <option value="CUENTA">📋 Cuenta (4 dígitos)</option>
                <option value="SUBCUENTA">📄 Subcuenta (6 dígitos)</option>
                <option value="DETALLE">🔸 Detalle (7+ dígitos)</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Descripción *
            </label>
            <textarea
              placeholder="Descripción detallada de la cuenta"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg bg-white shadow-sm resize-none transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Naturaleza Contable *
              </label>
              <select
                value={formData.naturaleza}
                onChange={(e) => setFormData({...formData, naturaleza: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg bg-white shadow-sm transition-all duration-200"
                required
                disabled={loading}
              >
                <option value="DEBITO">📈 Débito (Activos, Gastos, Costos)</option>
                <option value="CREDITO">📉 Crédito (Pasivos, Patrimonio, Ingresos)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Código Cuenta Padre
              </label>
              <input
                type="text"
                placeholder="Código de la cuenta padre"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-mono bg-white shadow-sm transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Estado de la Cuenta *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg bg-white shadow-sm transition-all duration-200"
                required
                disabled={loading}
              >
                <option value="ACTIVA">✅ Activa</option>
                <option value="INACTIVA">❌ Inactiva</option>
              </select>
            </div>

            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                <input
                  type="checkbox"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">
                  ✓ Acepta movimientos contables
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-red-500 text-xl" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-800 mb-1">Error de Validación</h4>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md"
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin text-xl" />
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <FaSave className="text-xl" />
                <span>Actualizar Cuenta</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// 3️⃣ MODAL VER DETALLES
export const ViewAccountModal = ({ 
  isOpen, 
  onClose, 
  account = null,
  onEdit = null
}) => {
  // Funciones auxiliares
  const obtenerIconoTipoCuenta = (tipo) => {
    const iconos = {
      'CLASE': '🏛️',
      'GRUPO': '📁',
      'CUENTA': '📋',
      'SUBCUENTA': '📄',
      'DETALLE': '🔸'
    };
    return iconos[tipo] || '📌';
  };

  const obtenerColorNaturaleza = (naturaleza) => {
    return naturaleza === 'DEBITO' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const obtenerColorTipoCuenta = (tipo) => {
    const colores = {
      'CLASE': 'bg-purple-100 text-purple-800 border-purple-200',
      'GRUPO': 'bg-blue-100 text-blue-800 border-blue-200',
      'CUENTA': 'bg-green-100 text-green-800 border-green-200',
      'SUBCUENTA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'DETALLE': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatearSaldo = (saldo) => {
    if (!saldo && saldo !== 0) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(saldo);
  };

  const handleEdit = () => {
    onClose();
    if (onEdit) {
      onEdit(account);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FaEye className="text-indigo-600 text-xl" />
          </div>
          <div>
            <span className="text-gray-900">Detalles de la Cuenta</span>
            <p className="text-sm text-gray-500 font-normal">
              Información completa y actualizada
            </p>
          </div>
        </div>
      }
      size="3xl"
    >
      {account && (
        <div className="space-y-8">
          
          {/* Header principal de la cuenta */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-5xl">{obtenerIconoTipoCuenta(account.tipo_cuenta)}</div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 font-mono">
                    {account.codigo_completo}
                  </h3>
                  <p className="text-xl text-gray-700 mt-1">
                    {account.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex items-center space-x-3 mt-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${obtenerColorTipoCuenta(account.tipo_cuenta)}`}>
                      {account.tipo_cuenta}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${obtenerColorNaturaleza(account.naturaleza)}`}>
                      {account.naturaleza}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-xl text-lg font-semibold ${
                  account.estado === 'ACTIVA' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {account.estado === 'ACTIVA' ? '✅' : '❌'} {account.estado}
                </div>
              </div>
            </div>
          </div>
          
          {/* Grid de información detallada */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Información general */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaInfoCircle className="text-blue-600 text-lg" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Información General</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">ID:</span>
                  <span className="font-mono text-lg font-bold text-blue-600">#{account.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Código Completo:</span>
                  <span className="font-mono text-lg font-bold">{account.codigo_completo}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Longitud:</span>
                  <span className="font-semibold">{account.codigo_completo?.length || 0} dígitos</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Nivel:</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-lg font-semibold">
                    {account.nivel || account.codigo_completo?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Configuración contable */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaShieldAlt className="text-green-600 text-lg" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Configuración</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Código Padre:</span>
                  <span className="font-mono font-semibold">
                    {account.codigo_padre || 'Sin padre'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Acepta Movimientos:</span>
                  <span className={`px-2 py-1 rounded-lg text-sm font-semibold ${
                    account.acepta_movimientos 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {account.acepta_movimientos ? '✓ Sí' : '✗ No'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Activa:</span>
                  <span className={`px-2 py-1 rounded-lg text-sm font-semibold ${
                    account.activo !== false
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {account.activo !== false ? '✓ Sí' : '✗ No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Información financiera */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaFileImport className="text-purple-600 text-lg" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Información Financiera</h4>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium mb-1">Saldo Inicial</div>
                  <div className={`text-2xl font-bold font-mono ${
                    (account.saldo_inicial || 0) > 0 ? 'text-blue-600' : 
                    (account.saldo_inicial || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {formatearSaldo(account.saldo_inicial)}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-1">Saldo Final</div>
                  <div className={`text-2xl font-bold font-mono ${
                    (account.saldo_final || 0) > 0 ? 'text-green-600' : 
                    (account.saldo_final || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {formatearSaldo(account.saldo_final)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Jerarquía de códigos */}
          {(account.codigo_clase || account.codigo_grupo || account.codigo_cuenta || account.codigo_subcuenta) && (
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <div className="p-2 bg-gray-200 rounded-lg mr-3">
                  <FaInfoCircle className="text-gray-600 text-lg" />
                </div>
                Estructura Jerárquica
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {account.codigo_clase && (
                  <div className="text-center">
                    <div className="text-sm text-purple-600 font-medium mb-2">Clase</div>
                    <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg font-mono font-bold text-lg">
                      {account.codigo_clase}
                    </div>
                  </div>
                )}
                {account.codigo_grupo && (
                  <div className="text-center">
                    <div className="text-sm text-blue-600 font-medium mb-2">Grupo</div>
                    <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg font-mono font-bold text-lg">
                      {account.codigo_grupo}
                    </div>
                  </div>
                )}
                {account.codigo_cuenta && (
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium mb-2">Cuenta</div>
                    <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-mono font-bold text-lg">
                      {account.codigo_cuenta}
                    </div>
                  </div>
                )}
                {account.codigo_subcuenta && (
                  <div className="text-center">
                    <div className="text-sm text-yellow-600 font-medium mb-2">Subcuenta</div>
                    <div className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-mono font-bold text-lg">
                      {account.codigo_subcuenta}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fechas de auditoría */}
          {(account.fecha_creacion || account.fecha_modificacion || account.created_at || account.updated_at) && (
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <div className="p-2 bg-gray-200 rounded-lg mr-3">
                  <FaInfoCircle className="text-gray-600 text-lg" />
                </div>
                Información de Auditoría
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(account.fecha_creacion || account.created_at) && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-600 font-medium mb-2">Fecha de Creación</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {new Date(account.fecha_creacion || account.created_at).toLocaleString('es-CO')}
                    </div>
                  </div>
                )}
                {(account.fecha_modificacion || account.updated_at) && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-600 font-medium mb-2">Última Modificación</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {new Date(account.fecha_modificacion || account.updated_at).toLocaleString('es-CO')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaEdit className="text-xl" />
                <span>Editar Cuenta</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// 4️⃣ MODAL IMPORTAR EXCEL
export const ImportPucExcelModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  loading: externalLoading,
  pucApi
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  
  const [options, setOptions] = useState({
    sobreescribir: false,
    validar_jerarquia: true,
    importar_saldos: false,
    importar_fiscal: false,
    hoja: 'Sheet1',
    fila_inicio: 2
  });

  const fileInputRef = useRef(null);

  const resetModal = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setImportResult(null);
    setError(null);
    setStep(1);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('❌ Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('❌ El archivo no puede ser mayor a 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = { target: { files: [files[0]] } };
      handleFileSelect(fakeEvent);
    }
  };

  const validarArchivo = async () => {
    if (!selectedFile || !pucApi) return;

    setLoading(true);
    setError(null);

    try {
      const result = await pucApi.validarArchivoExcel(selectedFile, options);
      setValidationResult(result.data);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Error validando el archivo');
    } finally {
      setLoading(false);
    }
  };

  const ejecutarImportacion = async () => {
    if (!selectedFile || !pucApi) return;

    setLoading(true);
    setError(null);

    try {
      const result = await pucApi.importarDesdeExcel(selectedFile, options);
      setImportResult(result.data);
      setStep(3);
      
      if (onImport) {
        onImport(result.data);
      }
    } catch (err) {
      setError(err.message || 'Error importando el archivo');
    } finally {
      setLoading(false);
    }
  };

  const descargarTemplate = async (conEjemplos = true) => {
    if (!pucApi) return;
    
    try {
      await pucApi.descargarTemplate(conEjemplos);
    } catch (err) {
      setError('Error descargando template: ' + err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaCloudUploadAlt className="text-green-600 text-xl" />
          </div>
          <div>
            <span className="text-gray-900">
              {step === 1 && 'Importar desde Excel'}
              {step === 2 && 'Validación del Archivo'}  
              {step === 3 && 'Resultado de Importación'}
            </span>
            <p className="text-sm text-gray-500 font-normal">
              {step === 1 && 'Selecciona y configura tu archivo Excel'}
              {step === 2 && 'Verificando la integridad de los datos'}
              {step === 3 && 'Proceso completado exitosamente'}
            </p>
          </div>
        </div>
      }
      size="3xl"
      closable={!loading}
    >
      {/* Indicador de progreso mejorado */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-all duration-300 ${
            step >= 1 ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-20 h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-all duration-300 ${
            step >= 2 ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-20 h-2 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-all duration-300 ${
            step >= 3 ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      {/* Errores mejorados */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start space-x-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <FaExclamationTriangle className="text-red-500 text-xl" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-red-800 mb-1">Error en el Proceso</h4>
            <p className="text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="p-2 text-red-400 hover:text-red-600 transition-colors duration-200"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Contenido dinámico por step */}
      <div className="min-h-[500px]">
        {/* STEP 1: Selección de archivo */}
        {step === 1 && (
          <div className="space-y-8">
            
            {/* Zona de arrastre mejorada */}
            <div
              className={`
                border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
                ${selectedFile 
                  ? 'border-green-400 bg-green-50 shadow-lg' 
                  : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50 hover:shadow-md'
                }
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="space-y-6">
                  <div className="text-green-500">
                    <FaFileExcel className="mx-auto text-8xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-800 mb-2">{selectedFile.name}</p>
                    <p className="text-lg text-gray-600">
                      Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-red-600 hover:text-red-800 text-lg font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    <FaTimes className="inline mr-2" />
                    Quitar archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-gray-400">
                    <FaCloudUploadAlt className="mx-auto text-8xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-700 mb-2">
                      Arrastra tu archivo Excel aquí
                    </p>
                    <p className="text-lg text-gray-500 mb-4">
                      o haz clic para seleccionar desde tu computadora
                    </p>
                    <p className="text-sm text-gray-400">
                      Formatos soportados: .xlsx, .xls (máximo 10MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Opciones de importación mejoradas */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FaCog className="text-white text-lg" />
                </div>
                <h4 className="text-xl font-semibold text-blue-900">Opciones de Importación</h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Configuración de Datos</h5>
                  
                  <label className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={options.sobreescribir}
                      onChange={(e) => setOptions(prev => ({ ...prev, sobreescribir: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-700">Sobreescribir cuentas existentes</span>
                      <p className="text-sm text-gray-500">Actualizar cuentas que ya existen en el sistema</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={options.validar_jerarquia}
                      onChange={(e) => setOptions(prev => ({ ...prev, validar_jerarquia: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-700">Validar jerarquía contable</span>
                      <p className="text-sm text-gray-500">Verificar que los códigos cumplan las reglas PUC</p>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Configuración de Archivo</h5>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Hoja
                    </label>
                    <input
                      type="text"
                      value={options.hoja}
                      onChange={(e) => setOptions(prev => ({ ...prev, hoja: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                      placeholder="Sheet1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fila de Inicio de Datos
                    </label>
                    <input
                      type="number"
                      value={options.fila_inicio}
                      onChange={(e) => setOptions(prev => ({ ...prev, fila_inicio: parseInt(e.target.value) || 2 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Templates mejorados */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <FaFileExport className="text-white text-lg" />
                </div>
                <h4 className="text-xl font-semibold text-purple-900">Templates de Excel</h4>
              </div>
              <p className="text-purple-700 mb-6 text-lg">
                Descarga una plantilla para asegurar el formato correcto de tu archivo
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => descargarTemplate(false)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <FaDownload className="text-lg" />
                  <span className="font-medium">Template Vacío</span>
                </button>
                <button
                  onClick={() => descargarTemplate(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <FaDownload className="text-lg" />
                  <span className="font-medium">Con Ejemplos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Validación mejorada */}
        {step === 2 && validationResult && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FaFileImport className="text-white text-lg" />
                </div>
                <h4 className="text-xl font-semibold text-blue-900">Resumen de Validación</h4>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {validationResult.total || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Total registros</div>
                </div>
                <div className="text-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {validationResult.validos || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Válidos</div>
                </div>
                <div className="text-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {validationResult.errores || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Con errores</div>
                </div>
                <div className="text-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {validationResult.advertencias || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Advertencias</div>
                </div>
              </div>
            </div>

            {validationResult.errores > 0 && validationResult.detalles_errores && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  Errores Encontrados
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {validationResult.detalles_errores.map((error, index) => (
                    <div key={index} className="bg-red-100 border border-red-200 p-4 rounded-xl">
                      <div className="font-semibold text-red-800">Fila {error.fila}</div>
                      <div className="text-red-700">{error.mensaje}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Resultado mejorado */}
        {step === 3 && importResult && (
          <div className="text-center space-y-8">
            <div className="text-green-500">
              <FaCheckCircle className="mx-auto text-8xl" />
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-green-800 mb-2">¡Importación Exitosa!</h3>
              <p className="text-xl text-gray-600">El archivo se ha procesado correctamente</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
              <h4 className="text-xl font-semibold text-green-800 mb-6">📊 Resumen Final de Importación</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="text-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {importResult.insertadas || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Cuentas Insertadas</div>
                </div>
                <div className="text-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {importResult.actualizadas || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Cuentas Actualizadas</div>
                </div>
                <div className="text-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {importResult.omitidas || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Registros Omitidos</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción mejorados */}
      <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
        {step === 1 && (
          <>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={validarArchivo}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105"
              disabled={!selectedFile || loading}
            >
              {loading ? <FaSpinner className="animate-spin text-xl" /> : <FaEye className="text-xl" />}
              <span>{loading ? 'Validando...' : 'Validar Archivo'}</span>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <button
              onClick={() => setStep(1)}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md"
              disabled={loading}
            >
              Volver
            </button>
            <button
              onClick={ejecutarImportacion}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105"
              disabled={validationResult?.errores > 0 || loading}
            >
              {loading ? <FaSpinner className="animate-spin text-xl" /> : <FaUpload className="text-xl" />}
              <span>{loading ? 'Importando...' : `Importar (${validationResult?.validos || 0} registros)`}</span>
            </button>
          </>
        )}

        {step === 3 && (
          <button
            onClick={handleClose}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FaCheckCircle className="text-xl" />
            <span>Finalizar</span>
          </button>
        )}
      </div>
    </Modal>
  );
};

// 5️⃣ MODAL EXPORTAR EXCEL
export const ExportPucModal = ({ 
  visible, 
  onCancel,
  pucApi
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [options, setOptions] = useState({
    incluir_saldos: false,
    incluir_movimientos: false,
    incluir_fiscal: false,
    incluir_inactivas: false,
    solo_movimientos: false,
    filtro_estado: '',
    filtro_tipo: '',
    filtro_clase: '',
    filtro_naturaleza: ''
  });

  const resetModal = () => {
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onCancel();
  };

  const ejecutarExportacion = async () => {
    if (!pucApi) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await pucApi.exportarAExcel(options);
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Error exportando el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={visible}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FaFileExport className="text-purple-600 text-xl" />
          </div>
          <div>
            <span className="text-gray-900">Exportar Plan de Cuentas</span>
            <p className="text-sm text-gray-500 font-normal">
              Genera un archivo Excel con tu PUC personalizado
            </p>
          </div>
        </div>
      }
      size="2xl"
      closable={!loading}
    >
      <div className="space-y-8">
        
        {/* Descripción */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              <FaFileExport className="text-white text-lg" />
            </div>
            <h4 className="text-xl font-semibold text-purple-900">Exportación Personalizada</h4>
          </div>
          <p className="text-purple-700 text-lg">
            Descarga tu Plan Único de Cuentas en formato Excel con las opciones y filtros que prefieras.
          </p>
        </div>

        {/* Opciones de contenido */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FaCog className="text-white text-lg" />
            </div>
            <h4 className="text-xl font-semibold text-blue-900">Contenido a Incluir</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-700 mb-3">Información Financiera</h5>
              
              <label className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                <input
                  type="checkbox"
                  checked={options.incluir_saldos}
                  onChange={(e) => setOptions(prev => ({ ...prev, incluir_saldos: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-700">Incluir saldos contables</span>
                  <p className="text-sm text-gray-500">Saldos inicial y final de cada cuenta</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                <input
                  type="checkbox"
                  checked={options.incluir_movimientos}
                  onChange={(e) => setOptions(prev => ({ ...prev, incluir_movimientos: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-700">Incluir resumen de movimientos</span>
                  <p className="text-sm text-gray-500">Cantidad de transacciones por cuenta</p>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-gray-700 mb-3">Filtros de Cuentas</h5>
              
              <label className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                <input
                  type="checkbox"
                  checked={options.incluir_inactivas}
                  onChange={(e) => setOptions(prev => ({ ...prev, incluir_inactivas: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-700">Incluir cuentas inactivas</span>
                  <p className="text-sm text-gray-500">Cuentas deshabilitadas del sistema</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                <input
                  type="checkbox"
                  checked={options.solo_movimientos}
                  onChange={(e) => setOptions(prev => ({ ...prev, solo_movimientos: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-700">Solo cuentas con movimientos</span>
                  <p className="text-sm text-gray-500">Excluir cuentas sin transacciones</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Filtros adicionales */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-500 rounded-lg">
              <FaFilter className="text-white text-lg" />
            </div>
            <h4 className="text-xl font-semibold text-green-900">Filtros Avanzados</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Estado de Cuentas
              </label>
              <select
                value={options.filtro_estado}
                onChange={(e) => setOptions(prev => ({ ...prev, filtro_estado: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm text-lg"
              >
                <option value="">Todas las cuentas</option>
                <option value="ACTIVA">Solo Activas</option>
                <option value="INACTIVA">Solo Inactivas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Naturaleza Contable
              </label>
              <select
                value={options.filtro_naturaleza}
                onChange={(e) => setOptions(prev => ({ ...prev, filtro_naturaleza: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm text-lg"
              >
                <option value="">Ambas naturalezas</option>
                <option value="DEBITO">Solo Débito</option>
                <option value="CREDITO">Solo Crédito</option>
              </select>
            </div>
          </div>
        </div>

        {/* Errores */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-red-500 text-xl" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-800 mb-1">Error en la Exportación</h4>
              <p className="text-red-600">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="p-2 text-red-400 hover:text-red-600 transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
        <button
          onClick={handleClose}
          className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md"
          disabled={loading}
        >
          Cancelar
        </button>
        
        <button
          onClick={ejecutarExportacion}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin text-xl" /> : <FaDownload className="text-xl" />}
          <span>{loading ? 'Generando Excel...' : 'Descargar Excel'}</span>
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
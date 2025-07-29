// frontend-react/src/components/ui/Modal.jsx - VERSIÓN COMPLETA CON TODOS LOS MODALES
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
  FaCog
} from 'react-icons/fa';

const Modal = ({
  isOpen,
  show, // Compatibilidad adicional
  onClose,
  title,
  children,
  size = 'md',
  maxWidth = 'md', // Compatibilidad adicional
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

  // Mapear tamaños
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  // Determinar la clase de tamaño
  const sizeClass = sizeClasses[size] || sizeClasses[maxWidth] || sizeClasses.md;

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
      {/* Overlay */}
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-all duration-300"
          aria-hidden="true"
        />

        {/* Spacer element para centrar el modal */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen" 
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div 
          className={`
            inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl 
            transform transition-all duration-300 sm:my-8 sm:align-middle sm:w-full 
            ${sizeClass} ${className}
          `}
          onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer click dentro
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {title && (
                  <h3 
                    className="text-xl font-semibold text-gray-900" 
                    id="modal-title"
                  >
                    {title}
                  </h3>
                )}
                
                {showCloseButton && closable && (
                  <button
                    type="button"
                    className="ml-4 bg-white rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 p-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <FaTimes className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white px-6 pb-6 pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// 🔥 MODALES CRUD ESPECÍFICOS
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
        <div className="flex items-center space-x-2">
          <span className="text-2xl">➕</span>
          <span>Nueva Cuenta</span>
        </div>
      }
      size="3xl"
      closable={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
            <span className="mr-2">📝</span>
            Información Básica
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Completo *
              </label>
              <input
                type="text"
                placeholder="Ej: 1105001"
                value={formData.codigo_completo}
                onChange={(e) => setFormData({...formData, codigo_completo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuenta *
              </label>
              <select
                value={formData.tipo_cuenta}
                onChange={(e) => setFormData({...formData, tipo_cuenta: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="CLASE">🏛️ Clase</option>
                <option value="GRUPO">📁 Grupo</option>
                <option value="CUENTA">📋 Cuenta</option>
                <option value="SUBCUENTA">📄 Subcuenta</option>
                <option value="DETALLE">🔸 Detalle</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              placeholder="Descripción detallada de la cuenta"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naturaleza *
              </label>
              <select
                value={formData.naturaleza}
                onChange={(e) => setFormData({...formData, naturaleza: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="DEBITO">📈 Débito</option>
                <option value="CREDITO">📉 Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Padre
              </label>
              <input
                type="text"
                placeholder="Código cuenta padre"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="ACTIVA">✅ Activa</option>
                <option value="INACTIVA">❌ Inactiva</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="acepta_movimientos_crear"
                checked={formData.acepta_movimientos}
                onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="acepta_movimientos_crear" className="text-sm text-gray-700">
                Acepta movimientos contables
              </label>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <FaPlus />
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
    
    // Validaciones
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
        <div className="flex items-center space-x-2">
          <span className="text-2xl">✏️</span>
          <span>Editar Cuenta - {account?.codigo_completo}</span>
        </div>
      }
      size="3xl"
      closable={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-amber-50 p-6 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-4 flex items-center">
            <span className="mr-2">✏️</span>
            Modificar Información
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Completo (No editable)
              </label>
              <input
                type="text"
                value={formData.codigo_completo}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuenta *
              </label>
              <select
                value={formData.tipo_cuenta}
                onChange={(e) => setFormData({...formData, tipo_cuenta: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="CLASE">🏛️ Clase</option>
                <option value="GRUPO">📁 Grupo</option>
                <option value="CUENTA">📋 Cuenta</option>
                <option value="SUBCUENTA">📄 Subcuenta</option>
                <option value="DETALLE">🔸 Detalle</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              placeholder="Descripción detallada de la cuenta"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naturaleza *
              </label>
              <select
                value={formData.naturaleza}
                onChange={(e) => setFormData({...formData, naturaleza: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="DEBITO">📈 Débito</option>
                <option value="CREDITO">📉 Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Padre
              </label>
              <input
                type="text"
                placeholder="Código cuenta padre"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="ACTIVA">✅ Activa</option>
                <option value="INACTIVA">❌ Inactiva</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="acepta_movimientos_editar"
                checked={formData.acepta_movimientos}
                onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="acepta_movimientos_editar" className="text-sm text-gray-700">
                Acepta movimientos contables
              </label>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <FaSave />
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
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  const obtenerColorTipoCuenta = (tipo) => {
    const colores = {
      'CLASE': 'bg-purple-100 text-purple-800',
      'GRUPO': 'bg-blue-100 text-blue-800',
      'CUENTA': 'bg-green-100 text-green-800',
      'SUBCUENTA': 'bg-yellow-100 text-yellow-800',
      'DETALLE': 'bg-orange-100 text-orange-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center space-x-2">
          <span className="text-2xl">👁️</span>
          <span>Detalles de la Cuenta</span>
        </div>
      }
      size="2xl"
    >
      {account && (
        <div className="space-y-6">
          {/* Header de la cuenta */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{obtenerIconoTipoCuenta(account.tipo_cuenta)}</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{account.codigo_completo}</h3>
                <p className="text-gray-600 text-lg">{account.descripcion}</p>
              </div>
            </div>
          </div>
          
          {/* Información detallada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Información General</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono">{account.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de Cuenta:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorTipoCuenta(account.tipo_cuenta)}`}>
                      {account.tipo_cuenta}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Naturaleza:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorNaturaleza(account.naturaleza)}`}>
                      {account.naturaleza}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      account.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {account.estado}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">⚙️ Configuración</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Código Padre:</span>
                    <span className="font-mono">
                      {account.codigo_padre || 'Sin padre'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acepta Movimientos:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      account.acepta_movimientos 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {account.acepta_movimientos ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nivel:</span>
                    <span className="font-medium">
                      {account.nivel || account.codigo_completo?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activa:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      account.activo !== false
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {account.activo !== false ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fechas de auditoría */}
          {(account.fecha_creacion || account.fecha_modificacion || account.created_at || account.updated_at) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">📅 Información de Auditoría</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {(account.fecha_creacion || account.created_at) && (
                  <div>
                    <span className="text-gray-600">Fecha de Creación:</span>
                    <p className="font-medium">
                      {new Date(account.fecha_creacion || account.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {(account.fecha_modificacion || account.updated_at) && (
                  <div>
                    <span className="text-gray-600">Última Modificación:</span>
                    <p className="font-medium">
                      {new Date(account.fecha_modificacion || account.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <FaEdit />
                <span>Editar</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
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
  pucApi // Necesitas pasar la API como prop
}) => {
  // Estados locales
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Selección, 2: Validación, 3: Importación
  
  // Opciones de importación
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

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('❌ Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    // Validar tamaño (max 10MB)
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
        <div className="flex items-center space-x-2">
          <FaUpload className="text-green-600" />
          <span>
            {step === 1 && 'Importar desde Excel'}
            {step === 2 && 'Validación del Archivo'}  
            {step === 3 && 'Resultado de Importación'}
          </span>
        </div>
      }
      size="xl"
      closable={!loading}
    >
      {/* Indicador de progreso */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      {/* Errores */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Contenido por step */}
      <div className="min-h-[400px]">
        {/* STEP 1: Selección de archivo */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Zona de arrastre */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                ${selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <FaFileExcel className="mx-auto text-5xl text-green-500" />
                  <div>
                    <p className="text-lg font-semibold text-green-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    <FaTimes className="inline mr-1" />
                    Quitar archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FaUpload className="mx-auto text-5xl text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Arrastra tu archivo Excel aquí
                    </p>
                    <p className="text-sm text-gray-500">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <FaUpload />
                    <span>Seleccionar Archivo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Opciones de importación */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">⚙️ Opciones de Importación</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.sobreescribir}
                      onChange={(e) => setOptions(prev => ({ ...prev, sobreescribir: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Sobreescribir cuentas existentes</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.validar_jerarquia}
                      onChange={(e) => setOptions(prev => ({ ...prev, validar_jerarquia: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Validar jerarquía contable</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hoja de Excel
                    </label>
                    <input
                      type="text"
                      value={options.hoja}
                      onChange={(e) => setOptions(prev => ({ ...prev, hoja: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sheet1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fila de inicio
                    </label>
                    <input
                      type="number"
                      value={options.fila_inicio}
                      onChange={(e) => setOptions(prev => ({ ...prev, fila_inicio: parseInt(e.target.value) || 2 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Templates */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">📄 Templates de Excel</h4>
              <p className="text-sm text-blue-600 mb-3">
                Descarga una plantilla para asegurar el formato correcto
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => descargarTemplate(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>Template Vacío</span>
                </button>
                <button
                  onClick={() => descargarTemplate(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>Con Ejemplos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Validación */}
        {step === 2 && validationResult && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">📊 Resumen de Validación</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {validationResult.total || 0}
                  </div>
                  <div className="text-gray-600">Total registros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {validationResult.validos || 0}
                  </div>
                  <div className="text-gray-600">Válidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {validationResult.errores || 0}
                  </div>
                  <div className="text-gray-600">Con errores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {validationResult.advertencias || 0}
                  </div>
                  <div className="text-gray-600">Advertencias</div>
                </div>
              </div>
            </div>

            {validationResult.errores > 0 && validationResult.detalles_errores && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-3">❌ Errores Encontrados</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {validationResult.detalles_errores.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                      <strong>Fila {error.fila}:</strong> {error.mensaje}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Resultado */}
        {step === 3 && importResult && (
          <div className="text-center space-y-4">
            <FaCheckCircle className="mx-auto text-6xl text-green-500" />
            
            <div>
              <h3 className="text-2xl font-bold text-green-800">¡Importación Exitosa!</h3>
              <p className="text-gray-600">El archivo se ha procesado correctamente</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-4">📊 Resumen Final</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {importResult.insertadas || 0}
                  </div>
                  <div className="text-gray-600">Cuentas insertadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {importResult.actualizadas || 0}
                  </div>
                  <div className="text-gray-600">Cuentas actualizadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {importResult.omitidas || 0}
                  </div>
                  <div className="text-gray-600">Omitidas</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        {step === 1 && (
          <>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={validarArchivo}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              disabled={!selectedFile || loading}
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaEye />}
              <span>{loading ? 'Validando...' : 'Validar Archivo'}</span>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Volver
            </button>
            <button
              onClick={ejecutarImportacion}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              disabled={validationResult?.errores > 0 || loading}
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
              <span>{loading ? 'Importando...' : `Importar (${validationResult?.validos || 0} registros)`}</span>
            </button>
          </>
        )}

        {step === 3 && (
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaCheckCircle />
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
  pucApi // Necesitas pasar la API como prop
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
        <div className="flex items-center space-x-2">
          <FaDownload className="text-purple-600" />
          <span>Exportar Plan de Cuentas</span>
        </div>
      }
      size="lg"
      closable={!loading}
    >
      <div className="space-y-6">
        {/* Descripción */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">📊 Exportar a Excel</h4>
          <p className="text-sm text-purple-600">
            Descarga tu Plan Único de Cuentas en formato Excel con las opciones que selecciones.
          </p>
        </div>

        {/* Opciones de contenido */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <FaCog className="mr-2" />
            Contenido a Incluir
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.incluir_saldos}
                  onChange={(e) => setOptions(prev => ({ ...prev, incluir_saldos: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Incluir saldos contables</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.incluir_movimientos}
                  onChange={(e) => setOptions(prev => ({ ...prev, incluir_movimientos: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Incluir resumen de movimientos</span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.incluir_inactivas}
                  onChange={(e) => setOptions(prev => ({ ...prev, incluir_inactivas: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Incluir cuentas inactivas</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.solo_movimientos}
                  onChange={(e) => setOptions(prev => ({ ...prev, solo_movimientos: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Solo cuentas con movimientos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
            <FaFilter className="mr-2" />
            Filtros Adicionales
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Cuentas
              </label>
              <select
                value={options.filtro_estado}
                onChange={(e) => setOptions(prev => ({ ...prev, filtro_estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                <option value="ACTIVA">Solo Activas</option>
                <option value="INACTIVA">Solo Inactivas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naturaleza
              </label>
              <select
                value={options.filtro_naturaleza}
                onChange={(e) => setOptions(prev => ({ ...prev, filtro_naturaleza: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <FaTimes className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={handleClose}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        
        <button
          onClick={ejecutarExportacion}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
          <span>{loading ? 'Generando...' : 'Descargar Excel'}</span>
        </button>
      </div>
    </Modal>
  );
};

export default Modal;

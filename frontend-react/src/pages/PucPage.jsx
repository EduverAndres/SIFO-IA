// src/pages/PucPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileImport,
  FaTree,
  FaList,
  FaChartBar,
  FaEye,
  FaDownload,
  FaUpload,
  FaCog,
  FaFilter,
  FaSort,
  FaExpandArrowsAlt,
  FaCompressArrowsAlt,
  FaPrint,
  FaFileExcel,
  FaFilePdf,
  FaHistory,
  FaInfoCircle,
  FaTimes,
  FaSave,
  FaUndo,
  FaRedo,
  FaCopy,
  FaChevronDown,
  FaChevronRight,
  FaLock,
  FaUnlock,
  FaQuestion,
  FaBookOpen,
  FaCalculator
} from 'react-icons/fa';
import Button from '../components/Button';

// ✅ IMPORTAR FUNCIONES CORREGIDAS DE LA API
import {
  getPucCuentas,
  getPucArbol,
  getPucEstadisticas,
  crearCuentaPuc,
  validarCodigoPuc,
  authenticatedFetch
} from '../api/ordenesApi';

// Componente Modal para Crear/Editar Cuenta
const CuentaModal = ({ 
  isOpen, 
  onClose, 
  cuenta = null, 
  onSave, 
  cuentasPadre = [],
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'DETALLE',
    naturaleza: 'DEBITO',
    estado: 'ACTIVA',
    codigo_padre: null, // Cambiar a null en lugar de string vacío
    descripcion: '',
    requiere_tercero: false,
    requiere_centro_costo: false,
    acepta_movimiento: true,
    nivel: 1
  });

  const [errors, setErrors] = useState({});
  const [validatingCodigo, setValidatingCodigo] = useState(false);

  useEffect(() => {
    if (cuenta) {
      setFormData({
        codigo: cuenta.codigo || '',
        nombre: cuenta.nombre || '',
        tipo: cuenta.tipo || 'DETALLE',
        naturaleza: cuenta.naturaleza || 'DEBITO',
        estado: cuenta.estado || 'ACTIVA',
        codigo_padre: cuenta.codigo_padre || null, // null si no hay padre
        descripcion: cuenta.descripcion || '',
        requiere_tercero: cuenta.requiere_tercero || false,
        requiere_centro_costo: cuenta.requiere_centro_costo || false,
        acepta_movimiento: cuenta.acepta_movimiento !== false,
        nivel: cuenta.nivel || 1
      });
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        tipo: 'DETALLE',
        naturaleza: 'DEBITO',
        estado: 'ACTIVA',
        codigo_padre: null, // null por defecto
        descripcion: '',
        requiere_tercero: false,
        requiere_centro_costo: false,
        acepta_movimiento: true,
        nivel: 1
      });
    }
    setErrors({});
  }, [cuenta, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    } else if (!/^\d+$/.test(formData.codigo.trim())) {
      newErrors.codigo = 'El código debe contener solo números';
    } else if (formData.codigo.trim().length < 4) {
      newErrors.codigo = 'El código debe tener al menos 4 dígitos';
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar nivel según el código
    const codigo = formData.codigo.trim();
    if (codigo) {
      const expectedLevel = Math.ceil(codigo.length / 2);
      if (formData.nivel !== expectedLevel) {
        newErrors.nivel = `Para un código de ${codigo.length} dígitos, el nivel debería ser ${expectedLevel}`;
      }
    }

    // Validar cuenta padre si se seleccionó
    if (formData.codigo_padre && formData.codigo_padre !== '') {
      const cuentaPadre = cuentasPadre.find(c => c.codigo === formData.codigo_padre);
      if (!cuentaPadre) {
        newErrors.codigo_padre = 'La cuenta padre seleccionada no es válida';
      } else if (formData.codigo && formData.codigo.length <= cuentaPadre.codigo.length) {
        newErrors.codigo_padre = 'La cuenta padre debe tener un código más corto que la cuenta actual';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        // Convertir string vacío a null para codigo_padre
        codigo_padre: formData.codigo_padre && formData.codigo_padre !== '' ? formData.codigo_padre : null
      };

      console.log('📤 [CUENTA] Enviando datos:', dataToSend);

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
      // El error se maneja en el componente padre
    }
  };

  const validateCodigo = async (codigo) => {
    if (!codigo || codigo === cuenta?.codigo) return;
    
    setValidatingCodigo(true);
    try {
      const response = await validarCodigoPuc(codigo);
      if (!response.success) {
        setErrors(prev => ({ ...prev, codigo: 'Este código ya existe' }));
      } else {
        setErrors(prev => ({ ...prev, codigo: undefined }));
      }
    } catch (error) {
      console.error('Error validando código:', error);
      // En caso de error de conexión, no marcamos como error
      setErrors(prev => ({ ...prev, codigo: undefined }));
    } finally {
      setValidatingCodigo(false);
    }
  };

  // Calcular nivel automáticamente basado en el código
  const handleCodigoChange = (value) => {
    const cleanValue = value.replace(/\D/g, ''); // Solo números
    const newLevel = Math.ceil(cleanValue.length / 2);
    
    setFormData(prev => ({ 
      ...prev, 
      codigo: cleanValue,
      nivel: Math.min(newLevel, 5) // Máximo nivel 5
    }));
    
    if (cleanValue !== value) {
      validateCodigo(cleanValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {cuenta ? 'Editar Cuenta' : 'Nueva Cuenta PUC'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => {
                    handleCodigoChange(e.target.value);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono ${
                    errors.codigo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 11050101"
                  maxLength="8"
                />
                {validatingCodigo && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
                  </div>
                )}
              </div>
              {errors.codigo && (
                <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Solo números. El nivel se calculará automáticamente.
              </p>
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel (Calculado)
              </label>
              <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg">
                <span className="text-gray-700 font-medium">{formData.nivel}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {formData.nivel === 1 && '(Clase)'}
                  {formData.nivel === 2 && '(Grupo)'}
                  {formData.nivel === 3 && '(Cuenta)'}
                  {formData.nivel === 4 && '(Subcuenta)'}
                  {formData.nivel === 5 && '(Auxiliar)'}
                </span>
              </div>
              {errors.nivel && (
                <p className="text-red-500 text-sm mt-1">{errors.nivel}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre de la cuenta"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Cuenta Padre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta Padre
              </label>
              <select
                value={formData.codigo_padre || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  codigo_padre: e.target.value === '' ? null : e.target.value 
                }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.codigo_padre ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sin cuenta padre (Cuenta raíz)</option>
                {cuentasPadre
                  .filter(cuenta => {
                    // Filtrar cuentas que pueden ser padre
                    if (!formData.codigo) return true;
                    return cuenta.codigo.length < formData.codigo.length;
                  })
                  .sort((a, b) => a.codigo.localeCompare(b.codigo))
                  .map(cuenta => (
                    <option key={cuenta.codigo} value={cuenta.codigo}>
                      {cuenta.codigo} - {cuenta.nombre}
                    </option>
                  ))
                }
              </select>
              {errors.codigo_padre && (
                <p className="text-red-500 text-sm mt-1">{errors.codigo_padre}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Solo se muestran cuentas que pueden ser padre (código más corto)
              </p>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="CLASE">Clase</option>
                <option value="GRUPO">Grupo</option>
                <option value="CUENTA">Cuenta</option>
                <option value="SUBCUENTA">Subcuenta</option>
                <option value="AUXILIAR">Auxiliar</option>
                <option value="DETALLE">Detalle</option>
              </select>
            </div>

            {/* Naturaleza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naturaleza
              </label>
              <select
                value={formData.naturaleza}
                onChange={(e) => setFormData(prev => ({ ...prev, naturaleza: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de la cuenta (opcional)"
              />
            </div>

            {/* Opciones adicionales */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="acepta_movimiento"
                  checked={formData.acepta_movimiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, acepta_movimiento: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acepta_movimiento" className="ml-2 text-sm text-gray-700">
                  Acepta movimiento contable
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiere_tercero"
                  checked={formData.requiere_tercero}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiere_tercero: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiere_tercero" className="ml-2 text-sm text-gray-700">
                  Requiere tercero
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiere_centro_costo"
                  checked={formData.requiere_centro_costo}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiere_centro_costo: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiere_centro_costo" className="ml-2 text-sm text-gray-700">
                  Requiere centro de costo
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
              icon={loading ? null : FaSave}
            >
              {loading ? 'Guardando...' : (cuenta ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente para mostrar el árbol de cuentas
const TreeNode = ({ cuenta, onEdit, onDelete, onToggle, expanded }) => {
  const hasChildren = cuenta.hijos && cuenta.hijos.length > 0;
  
  return (
    <div className="mb-2">
      <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center flex-1">
          {hasChildren && (
            <button
              onClick={() => onToggle(cuenta.codigo)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {expanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
          )}
          {!hasChildren && <div className="w-4 mr-2" />}
          
          <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded mr-3">
            {cuenta.codigo}
          </span>
          
          <div className="flex-1">
            <span className="font-medium text-gray-900">{cuenta.nombre}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{cuenta.tipo}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                cuenta.naturaleza === 'DEBITO' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {cuenta.naturaleza}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                cuenta.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {cuenta.estado}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(cuenta)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(cuenta)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Eliminar"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div className="ml-6 mt-2 space-y-2">
          {cuenta.hijos.map(hijo => (
            <TreeNode
              key={hijo.codigo}
              cuenta={hijo}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              expanded={expanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente principal
const PucPage = () => {
  const [cuentas, setCuentas] = useState([]);
  const [cuentasTree, setCuentasTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'tree' o 'table'
  const [filterTipo, setFilterTipo] = useState('');
  const [filterNaturaleza, setFilterNaturaleza] = useState('');
  const [filterEstado, setFilterEstado] = useState('ACTIVA');
  const [sortBy, setSortBy] = useState('codigo');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCuenta, setDeletingCuenta] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Estados para el árbol
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  // Estados para estadísticas
  const [stats, setStats] = useState({
    total_cuentas: 0,
    por_tipo: {},
    por_naturaleza: {},
    cuentas_activas: 0,
    cuentas_inactivas: 0,
    por_clase: {},
  });

  // Estados para configuración
  const [showConfig, setShowConfig] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para el éxito de eliminación
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 [PUC] Cargando datos...');

        // ✅ USAR LAS NUEVAS FUNCIONES DE LA API
        const promises = [
          getPucCuentas({ estado: filterEstado || undefined, limite: 1000 }),
          getPucArbol(),
          getPucEstadisticas()
        ];

        const [cuentasResponse, arbolResponse, estadisticasResponse] = await Promise.all(promises);

        console.log('✅ [PUC] Datos cargados:', {
          cuentas: cuentasResponse,
          arbol: arbolResponse,
          estadisticas: estadisticasResponse
        });

        // Verificar que las respuestas sean exitosas
        if (cuentasResponse.success) {
          setCuentas(cuentasResponse.data || []);
        }
        
        if (arbolResponse.success) {
          setCuentasTree(arbolResponse.data || []);
        }
        
        if (estadisticasResponse.success) {
          setStats(estadisticasResponse.data || {});
        }
        
        setError(null);
        
      } catch (err) {
        console.error('💥 [PUC] Error al cargar datos:', err);
        setError('Error al cargar las cuentas: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, [filterEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [PUC] Cargando datos...');

      // ✅ USAR LAS NUEVAS FUNCIONES DE LA API
      const promises = [
        getPucCuentas({ estado: filterEstado || undefined, limite: 1000 }),
        getPucArbol(),
        getPucEstadisticas()
      ];

      const [cuentasResponse, arbolResponse, estadisticasResponse] = await Promise.all(promises);

      console.log('✅ [PUC] Datos cargados:', {
        cuentas: cuentasResponse,
        arbol: arbolResponse,
        estadisticas: estadisticasResponse
      });

      // Verificar que las respuestas sean exitosas
      if (cuentasResponse.success) {
        setCuentas(cuentasResponse.data || []);
      }
      
      if (arbolResponse.success) {
        setCuentasTree(arbolResponse.data || []);
      }
      
      if (estadisticasResponse.success) {
        setStats(estadisticasResponse.data || {});
      }
      
      setError(null);
      
    } catch (err) {
      console.error('💥 [PUC] Error al cargar datos:', err);
      setError('Error al cargar las cuentas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportPucEstandar = async () => {
    try {
      setLoading(true);
      console.log('📥 [PUC] Verificando PUC estándar...');
      
      const response = await authenticatedFetch('/puc/importar-estandar', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('PUC estándar verificado exitosamente');
        await cargarDatos();
      } else {
        throw new Error(result.message || 'Error al verificar el PUC estándar');
      }
    } catch (err) {
      console.error('💥 [PUC] Error al verificar PUC:', err);
      setError('Error al verificar el PUC estándar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCuenta = async (formData) => {
    try {
      setLoading(true);
      
      console.log('💾 [CUENTA] Guardando cuenta:', formData);
      
      if (editingCuenta) {
        // Actualizar cuenta existente
        const response = await authenticatedFetch(`/puc/cuentas/${editingCuenta.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setSuccess('Cuenta actualizada exitosamente');
        } else {
          throw new Error(result.message || 'Error al actualizar la cuenta');
        }
      } else {
        // Crear nueva cuenta
        const response = await crearCuentaPuc(formData);
        console.log('📥 [CUENTA] Respuesta de creación:', response);
        
        if (response.success) {
          setSuccess('Cuenta creada exitosamente');
        } else {
          throw new Error(response.message || 'Error al crear la cuenta');
        }
      }
      
      await cargarDatos();
      setShowModal(false);
      setEditingCuenta(null);
      
    } catch (err) {
      console.error('💥 [CUENTA] Error al guardar cuenta:', err);
      
      // Mejorar mensaje de error para el usuario
      let userMessage = err.message;
      
      if (err.message.includes('foreign key constraint')) {
        userMessage = 'Error: La cuenta padre seleccionada no existe o no es válida. Verifique que la cuenta padre esté creada correctamente.';
      } else if (err.message.includes('duplicate key')) {
        userMessage = 'Error: Ya existe una cuenta con este código. Use un código diferente.';
      } else if (err.message.includes('violates check constraint')) {
        userMessage = 'Error: Los datos ingresados no cumplen con las validaciones requeridas.';
      }
      
      setError(`Error al guardar la cuenta: ${userMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCuenta = async () => {
    if (!deletingCuenta) return;

    try {
      setLoading(true);

      const response = await authenticatedFetch(`/puc/${deletingCuenta.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Cuenta eliminada exitosamente');
        setDeleteSuccessMessage(`Cuenta ${deletingCuenta.codigo} - ${deletingCuenta.nombre} eliminada exitosamente`);
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 5000);
        await cargarDatos();
      } else {
        throw new Error(result.message || 'Error al eliminar la cuenta');
      }

      setShowDeleteModal(false);
      setDeletingCuenta(null);

    } catch (err) {
      console.error('Error al eliminar cuenta:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPuc = async (formato = 'excel') => {
    try {
      setLoading(true);
      
      // Preparar parámetros de exportación
      const params = new URLSearchParams();
      params.append('formato', formato);
      
      // Solo agregar filtros si tienen valores válidos
      if (filterEstado && filterEstado.trim() !== '') {
        params.append('estado', filterEstado);
      }
      
      if (filterTipo && filterTipo.trim() !== '') {
        params.append('tipo', filterTipo);
      }
      
      if (filterNaturaleza && filterNaturaleza.trim() !== '') {
        params.append('naturaleza', filterNaturaleza);
      }
      
      // Agregar parámetros de ordenamiento si es necesario
      if (sortBy) {
        params.append('orden_por', sortBy);
        params.append('orden_direccion', sortOrder);
      }

      // Agrega estos dos parámetros SIEMPRE:

      
      console.log('🔄 [EXPORT] Enviando petición de exportación:', {
        url: `/puc/exportar?${params.toString()}`,
        formato,
        filtros: { filterEstado, filterTipo, filterNaturaleza }
      });
      
      const response = await authenticatedFetch(`/puc/exportar?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': formato === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf'
        }
      });
      
      console.log('📥 [EXPORT] Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        // Obtener el blob de la respuesta
        const blob = await response.blob();
        
        console.log('📦 [EXPORT] Blob creado:', {
          size: blob.size,
          type: blob.type
        });
        
        // Validar que el blob no esté vacío
        if (blob.size === 0) {
          throw new Error('El archivo exportado está vacío');
        }
        
        // Crear nombre de archivo con timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const extension = formato === 'excel' ? 'xlsx' : 'pdf';
        const fileName = `puc_${timestamp}.${extension}`;
        
        // Crear y disparar la descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        // Agregar al DOM, hacer clic y limpiar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar el URL del blob
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        
        setSuccess(`PUC exportado a ${formato.toUpperCase()} exitosamente como ${fileName}`);
        
      } else {
        // Intentar leer el error del response
        let errorMessage = 'Error al exportar el PUC';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const errorText = await response.text();
            errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (err) {
      console.error('💥 [EXPORT] Error al exportar:', err);
      
      // Mejorar el mensaje de error para el usuario
      let userMessage = err.message;
      
      if (err.message.includes('Validation failed')) {
        userMessage = 'Error de validación en los parámetros. Verifique los filtros aplicados.';
      } else if (err.message.includes('numeric string is expected')) {
        userMessage = 'Error en el formato de los parámetros. Intente limpiar los filtros y exportar nuevamente.';
      } else if (err.message.includes('Failed to fetch')) {
        userMessage = 'Error de conexión con el servidor. Verifique su conexión a internet.';
      }
      
      setError(`Error al exportar: ${userMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNode = (codigo) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(codigo)) {
        newSet.delete(codigo);
      } else {
        newSet.add(codigo);
      }
      return newSet;
    });
  };

  const filtrarCuentas = useMemo(() => {
    let filtered = cuentas;
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(cuenta => 
        cuenta.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cuenta.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por tipo
    if (filterTipo) {
      filtered = filtered.filter(cuenta => cuenta.tipo === filterTipo);
    }
    
    // Filtro por naturaleza
    if (filterNaturaleza) {
      filtered = filtered.filter(cuenta => cuenta.naturaleza === filterNaturaleza);
    }
    
    // Filtro por estado
    if (filterEstado) {
      filtered = filtered.filter(cuenta => cuenta.estado === filterEstado);
    }
    
    // Ordenamiento
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
    
    return filtered;
  }, [cuentas, searchTerm, filterTipo, filterNaturaleza, filterEstado, sortBy, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filtrarCuentas.length / pageSize);
  const currentCuentas = filtrarCuentas.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Limpiar mensajes después de unos segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Obtener cuentas padre para el modal (solo cuentas que no aceptan movimiento)
  const cuentasPadre = cuentas.filter(cuenta => 
    !cuenta.acepta_movimiento && cuenta.estado === 'ACTIVA'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Plan Único de Cuentas (PUC)
            </h1>
            <p className="text-gray-600">Gestiona la estructura contable de tu empresa con el PUC estándar colombiano</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              icon={FaPlus}
              disabled={loading}
            >
              Nueva Cuenta
            </Button>
            
            <Button
              onClick={handleImportPucEstandar}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              icon={FaFileImport}
              disabled={loading}
            >
              Verificar PUC
            </Button>
            
            <div className="relative">
              <Button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                icon={FaUpload}
                disabled={loading}
              >
                Importar
              </Button>
            </div>
            
            <div className="relative group">
              <Button
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                icon={FaDownload}
                disabled={loading}
              >
                Exportar
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-2">
                  <button
                    onClick={() => handleExportPuc('excel')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaFileExcel className="mr-2 text-green-600" />
                    Exportar a Excel
                  </button>
                  <button
                    onClick={() => handleExportPuc('pdf')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaFilePdf className="mr-2 text-red-600" />
                    Exportar a PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaPrint className="mr-2 text-gray-600" />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
            
            <Button
              onClick={cargarDatos}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              icon={FaSync}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </Button>
            
            <Button
              onClick={() => setShowConfig(!showConfig)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              icon={FaCog}
            >
              Configurar
            </Button>
          </div>
        </div>

        {/* Panel de Configuración */}
        {showConfig && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Configuración de Vista</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registros por página
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="codigo">Código</option>
                  <option value="nombre">Nombre</option>
                  <option value="tipo">Tipo</option>
                  <option value="naturaleza">Naturaleza</option>
                  <option value="estado">Estado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Cuentas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_cuentas || 0}</p>
              </div>
              <FaChartBar className="text-3xl text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cuentas Activas</p>
                <p className="text-2xl font-bold text-green-600">{stats.cuentas_activas || 0}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Débito</p>
                <p className="text-2xl font-bold text-purple-600">{stats.por_naturaleza?.DEBITO || 0}</p>
              </div>
              <FaCalculator className="text-3xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Crédito</p>
                <p className="text-2xl font-bold text-orange-600">{stats.por_naturaleza?.CREDITO || 0}</p>
              </div>
              <FaCalculator className="text-3xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center shadow-sm animate-fadeIn">
            <FaExclamationTriangle className="text-red-500 mr-3 text-lg" />
            <span className="text-red-700 font-medium">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600 font-bold text-lg"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center shadow-sm animate-fadeIn">
            <FaCheckCircle className="text-green-500 mr-3 text-lg" />
            <span className="text-green-700 font-medium">{success}</span>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600 font-bold text-lg"
            >
              ✕
            </button>
          </div>
        )}

        {showDeleteSuccess && (
          <div className="fixed top-6 right-6 z-50 animate-fadeIn">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg max-w-md flex items-center">
              <FaCheckCircle className="text-green-500 mr-3 text-lg flex-shrink-0" />
              <span className="text-green-700 font-medium flex-1">{deleteSuccessMessage}</span>
              <button
                onClick={() => setShowDeleteSuccess(false)}
                className="ml-3 text-green-400 hover:text-green-600 font-bold text-lg flex-shrink-0"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="CLASE">Clase</option>
                <option value="GRUPO">Grupo</option>
                <option value="CUENTA">Cuenta</option>
                <option value="SUBCUENTA">Subcuenta</option>
                <option value="AUXILIAR">Auxiliar</option>
                <option value="DETALLE">Detalle</option>
              </select>
              
              <select
                value={filterNaturaleza}
                onChange={(e) => setFilterNaturaleza(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las naturalezas</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
              
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
              
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterTipo('');
                  setFilterNaturaleza('');
                  setFilterEstado('ACTIVA');
                  setSortBy('codigo');
                  setSortOrder('asc');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white"
                icon={FaUndo}
                title="Limpiar todos los filtros"
              >
                Limpiar
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  icon={FaList}
                >
                  Tabla
                </Button>
                <Button
                  onClick={() => setViewMode('tree')}
                  className={`px-4 py-2 ${viewMode === 'tree' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  icon={FaTree}
                >
                  Árbol
                </Button>
              </div>
            </div>
          </div>
          
          {/* Información de filtros aplicados */}
          {(searchTerm || filterTipo || filterNaturaleza || filterEstado !== 'ACTIVA') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <FaFilter className="text-blue-500" />
                  <span className="font-medium">Filtros aplicados:</span>
                  <div className="flex gap-2 flex-wrap">
                    {searchTerm && (
                      <span className="bg-blue-200 px-2 py-1 rounded text-xs">
                        Búsqueda: "{searchTerm}"
                      </span>
                    )}
                    {filterTipo && (
                      <span className="bg-blue-200 px-2 py-1 rounded text-xs">
                        Tipo: {filterTipo}
                      </span>
                    )}
                    {filterNaturaleza && (
                      <span className="bg-blue-200 px-2 py-1 rounded text-xs">
                        Naturaleza: {filterNaturaleza}
                      </span>
                    )}
                    {filterEstado && filterEstado !== 'ACTIVA' && (
                      <span className="bg-blue-200 px-2 py-1 rounded text-xs">
                        Estado: {filterEstado}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-blue-600 font-medium">
                  {filtrarCuentas.length} resultado(s)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <p className="text-gray-600 font-medium">Cargando plan de cuentas...</p>
              <p className="text-gray-500 text-sm">Conectando con el servidor...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-4xl border border-gray-200 overflow-hidden">
            {viewMode === 'tree' ? (
              /* Vista Árbol */
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Vista de Árbol</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setExpandedNodes(new Set(cuentasTree.map(c => c.codigo)))}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
                      icon={FaExpandArrowsAlt}
                    >
                      Expandir Todo
                    </Button>
                    <Button
                      onClick={() => setExpandedNodes(new Set())}
                      className="text-sm px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                      icon={FaCompressArrowsAlt}
                    >
                      Contraer Todo
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {cuentasTree.length > 0 ? (
                    cuentasTree.map((cuenta) => (
                      <TreeNode
                        key={cuenta.codigo}
                        cuenta={cuenta}
                        onEdit={(cuenta) => {
                          setEditingCuenta(cuenta);
                          setShowModal(true);
                        }}
                        onDelete={(cuenta) => {
                          setDeletingCuenta(cuenta);
                          setShowDeleteModal(true);
                        }}
                        onToggle={handleToggleNode}
                        expanded={expandedNodes.has(cuenta.codigo)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FaTree className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay cuentas en el árbol para mostrar</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Vista Tabla */
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => {
                              setSortBy('codigo');
                              setSortOrder(sortBy === 'codigo' && sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                            className="flex items-center gap-2 hover:text-gray-700"
                          >
                            Código
                            <FaSort className="text-xs" />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => {
                              setSortBy('nombre');
                              setSortOrder(sortBy === 'nombre' && sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                            className="flex items-center gap-2 hover:text-gray-700"
                          >
                            Nombre
                            <FaSort className="text-xs" />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Naturaleza
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Opciones
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentCuentas.length > 0 ? (
                        currentCuentas.map((cuenta, index) => (
                          <tr key={cuenta.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">
                                {cuenta.codigo}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {cuenta.nombre}
                              </div>
                              {cuenta.descripcion && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {cuenta.descripcion}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{cuenta.tipo}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                cuenta.naturaleza === 'DEBITO' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {cuenta.naturaleza}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                cuenta.estado === 'ACTIVA' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {cuenta.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-xs">
                                {cuenta.acepta_movimiento && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded" title="Acepta movimiento">
                                    MOV
                                  </span>
                                )}
                                {cuenta.requiere_tercero && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded" title="Requiere tercero">
                                    TER
                                  </span>
                                )}
                                {cuenta.requiere_centro_costo && (
                                  <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded" title="Requiere centro de costo">
                                    CC
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCuenta(cuenta);
                                    setShowModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Editar"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingCuenta(cuenta);
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Eliminar"
                                >
                                  <FaTrash />
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(cuenta.codigo);
                                    setSuccess('Código copiado al portapapeles');
                                  }}
                                  className="text-gray-600 hover:text-gray-800 p-1"
                                  title="Copiar código"
                                >
                                  <FaCopy />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                            {searchTerm || filterTipo || filterNaturaleza
                              ? `No se encontraron cuentas que coincidan con los filtros aplicados` 
                              : 'No hay cuentas para mostrar'
                            }
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, filtrarCuentas.length)} de {filtrarCuentas.length} registros
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Anterior
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 text-sm border ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <CuentaModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCuenta(null);
        }}
        cuenta={editingCuenta}
        onSave={handleSaveCuenta}
        cuentasPadre={cuentasPadre}
        loading={loading}
      />

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && deletingCuenta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FaExclamationTriangle className="text-red-500 text-2xl mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Confirmar Eliminación
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar la cuenta <strong>{deletingCuenta.codigo} - {deletingCuenta.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingCuenta(null);
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteCuenta}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                  icon={loading ? null : FaTrash}
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importación */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Importar Cuentas PUC
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos soportados: Excel (.xlsx, .xls) y CSV (.csv)
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-blue-500 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Formato requerido:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Código (obligatorio)</li>
                        <li>• Nombre (obligatorio)</li>
                        <li>• Tipo (CLASE, GRUPO, CUENTA, etc.)</li>
                        <li>• Naturaleza (DEBITO, CREDITO)</li>
                        <li>• Estado (ACTIVA, INACTIVA)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancelar
                </Button>
                <Button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  icon={FaUpload}
                >
                  Importar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ayuda y Documentación */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <Button
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            icon={FaQuestion}
          />
          <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Ayuda - PUC</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Crear cuenta:</strong> Click en "Nueva Cuenta" para agregar una cuenta al PUC.</p>
                <p><strong>Importar:</strong> Sube un archivo Excel o CSV con las cuentas a importar.</p>
                <p><strong>Exportar:</strong> Descarga el PUC en formato Excel o PDF.</p>
                <p><strong>Filtros:</strong> Usa los filtros para encontrar cuentas específicas.</p>
                <p><strong>Vista árbol:</strong> Visualiza la estructura jerárquica del PUC.</p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                  <FaBookOpen className="mr-1" />
                  Ver documentación completa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast de Notificaciones */}
      <div className="fixed top-6 right-6 z-50 space-y-2">
        {/* Las notificaciones se mostrarían aquí dinámicamente */}
      </div>
    </div>
  );
};

export default PucPage;
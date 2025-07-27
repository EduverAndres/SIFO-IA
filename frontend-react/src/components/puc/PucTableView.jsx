// ===============================================
// 🔧 PucTableView.jsx - ARCHIVO COMPLETO CORREGIDO
// ===============================================

import React, { useState, useMemo } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaList,
  FaInfo,
  FaCode,
  FaExclamationTriangle,
  FaTimes,
  FaSearch,
  FaTree,
  FaMoneyBill,
  FaBuilding,
  FaUser,
  FaTag,
  FaFlag
} from 'react-icons/fa';

const PucTableView = ({ 
  cuentas = [], // ✅ DEFAULT VALUE
  onEdit, 
  onDelete, 
  onCreateChild, 
  filtros, 
  setFiltros,
  loading = false 
}) => {
  // ===============================================
  // 🎯 ESTADOS LOCALES
  // ===============================================
  const [sortField, setSortField] = useState('codigo');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cuentaToDelete, setCuentaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCuentas, setSelectedCuentas] = useState(new Set());
  
  // Estados para mensajes
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ===============================================
  // 🚨 VALIDACIÓN DEFENSIVA INICIAL
  // ===============================================
  const safeCuentas = Array.isArray(cuentas) ? cuentas : [];
  
  console.log('🎯 PucTableView render:', {
    cuentasReceived: cuentas,
    cuentasType: Array.isArray(cuentas) ? 'Array' : typeof cuentas,
    safeCuentasLength: safeCuentas.length,
    loading,
    sortField,
    sortDirection
  });

  // ✅ EARLY RETURN SI HAY PROBLEMAS CON LOS DATOS
  if (!Array.isArray(cuentas)) {
    console.error('❌ PucTableView recibió datos inválidos:', {
      cuentas,
      type: typeof cuentas,
      isArray: Array.isArray(cuentas)
    });
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error en los datos</h3>
        <p className="text-red-600 mb-4">
          Los datos de cuentas no tienen el formato correcto.
          <br />
          <small className="text-red-500">
            Tipo recibido: {typeof cuentas} | Esperado: Array
          </small>
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-2"
          >
            Recargar página
          </button>
          <button
            onClick={() => console.log('Datos recibidos:', cuentas)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Debug en consola
          </button>
        </div>
      </div>
    );
  }

  // ===============================================
  // 🔧 FUNCIONES DE UTILIDAD
  // ===============================================

  // Obtener información de nivel y jerarquía
  const getCuentaLevel = (codigo) => {
    if (!codigo) return 0;
    const length = codigo.length;
    if (length === 1) return 1; // Clase
    if (length === 2) return 2; // Grupo
    if (length === 4) return 3; // Cuenta
    if (length === 6) return 4; // Subcuenta
    return 5; // Auxiliar
  };

  const getCuentaType = (codigo) => {
    if (!codigo) return 'DESCONOCIDO';
    const length = codigo.length;
    switch (length) {
      case 1: return 'CLASE';
      case 2: return 'GRUPO';
      case 4: return 'CUENTA';
      case 6: return 'SUBCUENTA';
      default: return 'AUXILIAR';
    }
  };

  const getSubcuentasCount = (codigo) => {
    if (!codigo) return 0;
    return safeCuentas.filter(cuenta => 
      cuenta.codigo_padre === codigo
    ).length;
  };

  // ===============================================
  // 🔄 FUNCIONES DE ORDENAMIENTO
  // ===============================================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ✅ ORDENAR CUENTAS CON VALIDACIÓN ROBUSTA
  const sortedCuentas = useMemo(() => {
    try {
      return [...safeCuentas].sort((a, b) => {
        // Validar que ambos objetos existen
        if (!a || !b) return 0;
        
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';
        
        // Manejo especial para códigos (ordenamiento numérico)
        if (sortField === 'codigo') {
          aValue = aValue.toString();
          bValue = bValue.toString();
          
          // Si ambos son numéricos, ordenar numéricamente
          if (/^\d+$/.test(aValue) && /^\d+$/.test(bValue)) {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
          }
        }
        
        // Convertir a string para comparación si es necesario
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Realizar comparación
        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        else if (aValue < bValue) comparison = -1;
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } catch (error) {
      console.error('Error ordenando cuentas:', error);
      return safeCuentas; // Retornar datos sin ordenar en caso de error
    }
  }, [safeCuentas, sortField, sortDirection]);

  // ===============================================
  // 🎛️ FUNCIONES DE PAGINACIÓN
  // ===============================================

  const currentPage = filtros?.page || 1;
  const itemsPerPage = filtros?.limit || 50;
  const totalItems = sortedCuentas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCuentas = sortedCuentas.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (setFiltros && newPage >= 1 && newPage <= totalPages) {
      setFiltros(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  // ===============================================
  // 🎯 FUNCIONES DE ACCIONES
  // ===============================================

  const handleEdit = (cuenta) => {
    console.log('📝 Editando cuenta:', cuenta);
    if (onEdit) {
      onEdit(cuenta);
    }
  };

  const handleDeleteClick = (cuenta) => {
    setCuentaToDelete(cuenta);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cuentaToDelete || !onDelete) return;

    try {
      setDeleting(true);
      await onDelete(cuentaToDelete.id);
      setShowDeleteModal(false);
      setCuentaToDelete(null);
      showSuccess('Cuenta eliminada exitosamente');
    } catch (error) {
      showError('Error al eliminar la cuenta');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateChild = (cuenta) => {
    console.log('👶 Creando subcuenta de:', cuenta);
    if (onCreateChild) {
      onCreateChild(cuenta);
    }
  };

  // Función para mostrar mensajes
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    setTimeout(() => setShowErrorMessage(false), 5000);
  };

  // ===============================================
  // 🎨 COMPONENTES DE UI
  // ===============================================

  // Componente para headers ordenables
  const SortableHeader = ({ field, children, className = "" }) => (
    <th 
      className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? 
            <FaSortUp className="text-blue-500" /> : 
            <FaSortDown className="text-blue-500" />
        ) : (
          <FaSort className="opacity-30" />
        )}
      </div>
    </th>
  );

  // Componente de mensajes de éxito
  const SuccessMessage = () => showSuccessMessage && (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 shadow-lg">
      <div className="flex items-center">
        <FaCheckCircle className="mr-2" />
        <span>{successMessage}</span>
        <button
          onClick={() => setShowSuccessMessage(false)}
          className="ml-4 text-green-500 hover:text-green-700"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );

  // Componente de mensajes de error
  const ErrorMessage = () => showErrorMessage && (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 shadow-lg">
      <div className="flex items-center">
        <FaExclamationTriangle className="mr-2" />
        <span>{errorMessage}</span>
        <button
          onClick={() => setShowErrorMessage(false)}
          className="ml-4 text-red-500 hover:text-red-700"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );

  // Modal de confirmación de eliminación
  const DeleteModal = () => showDeleteModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className="text-red-500 text-xl mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Confirmar Eliminación</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          ¿Está seguro de que desea eliminar la cuenta{' '}
          <strong>{cuentaToDelete?.codigo} - {cuentaToDelete?.nombre}</strong>?
          <br />
          <small className="text-red-600">Esta acción no se puede deshacer.</small>
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Componente de paginación
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); 
           i <= Math.min(totalPages - 1, currentPage + delta); 
           i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="bg-white px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
            <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
            <span className="font-medium">{totalItems}</span> cuentas
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft />
            </button>
            
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <span key={index} className="px-3 py-2 text-gray-500">
                    ...
                  </span>
                );
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===============================================
  // 🎨 RENDER PRINCIPAL
  // ===============================================

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando cuentas del PUC...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mensajes */}
      <SuccessMessage />
      <ErrorMessage />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header de la tabla */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaList className="text-blue-600 text-lg" />
              <h3 className="text-lg font-semibold text-gray-900">Lista de Cuentas</h3>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {sortedCuentas.length} cuenta{sortedCuentas.length !== 1 ? 's' : ''} total{sortedCuentas.length !== 1 ? 'es' : ''}
                {currentCuentas.length !== sortedCuentas.length && (
                  <span className="ml-2 text-blue-600">
                    ({currentCuentas.length} mostradas)
                  </span>
                )}
              </div>
              
              {/* Indicador de ordenamiento activo */}
              {sortField && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Ordenado por: {sortField} ({sortDirection === 'asc' ? '↑' : '↓'})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        {currentCuentas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader field="codigo">Código</SortableHeader>
                  <SortableHeader field="nombre">Nombre</SortableHeader>
                  <SortableHeader field="tipo">Tipo</SortableHeader>
                  <SortableHeader field="naturaleza">Naturaleza</SortableHeader>
                  <SortableHeader field="estado">Estado</SortableHeader>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedades
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jerarquía
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCuentas.map((cuenta, index) => {
                  // ✅ VALIDACIÓN DE CADA CUENTA
                  if (!cuenta || typeof cuenta !== 'object') {
                    console.warn(`⚠️ Cuenta inválida en índice ${index}:`, cuenta);
                    return (
                      <tr key={index} className="bg-red-50">
                        <td colSpan="8" className="px-6 py-4 text-center text-red-600">
                          Datos de cuenta inválidos
                        </td>
                      </tr>
                    );
                  }

                  const subcuentasCount = getSubcuentasCount(cuenta.codigo);
                  const tieneSubcuentas = subcuentasCount > 0;
                  const nivel = getCuentaLevel(cuenta.codigo);
                  const tipo = getCuentaType(cuenta.codigo);

                  return (
                    <tr 
                      key={cuenta.id || index} 
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {/* Código */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span 
                            className={`font-mono text-sm font-bold px-2 py-1 rounded ${
                              nivel === 1 ? 'bg-purple-100 text-purple-800' :
                              nivel === 2 ? 'bg-blue-100 text-blue-800' :
                              nivel === 3 ? 'bg-green-100 text-green-800' :
                              nivel === 4 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {cuenta.codigo || 'N/A'}
                          </span>
                          
                          {/* Indicador de jerarquía */}
                          {cuenta.codigo_padre && (
                            <span className="text-xs text-gray-500 bg-gray-50 px-1 py-0.5 rounded">
                              ← {cuenta.codigo_padre}
                            </span>
                          )}
                          
                          {/* Indicador de subcuentas */}
                          {tieneSubcuentas && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center">
                              <FaTree className="mr-1" />
                              {subcuentasCount}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Nombre */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {cuenta.nombre || 'Sin nombre'}
                        </div>
                        {cuenta.descripcion && (
                          <div className="text-xs text-gray-500 mt-1">
                            {cuenta.descripcion}
                          </div>
                        )}
                      </td>
                      
                      {/* Tipo */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${
                          tipo === 'CLASE' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          tipo === 'GRUPO' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          tipo === 'CUENTA' ? 'bg-green-100 text-green-800 border-green-200' :
                          tipo === 'SUBCUENTA' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {tipo}
                        </span>
                      </td>
                      
                      {/* Naturaleza */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${
                          cuenta.naturaleza === 'DEBITO' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        }`}>
                          {cuenta.naturaleza === 'DEBITO' ? (
                            <FaMoneyBill className="mr-1" />
                          ) : (
                            <FaTag className="mr-1" />
                          )}
                          {cuenta.naturaleza || 'N/A'}
                        </span>
                      </td>
                      
                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${
                          cuenta.estado === 'ACTIVA' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {cuenta.estado === 'ACTIVA' ? (
                            <FaCheckCircle className="mr-1" />
                          ) : (
                            <FaTimesCircle className="mr-1" />
                          )}
                          {cuenta.estado || 'N/A'}
                        </span>
                      </td>
                      
                      {/* Propiedades */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {cuenta.permite_movimiento && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full border border-green-200">
                              <FaCheckCircle className="mr-1" />
                              Movimientos
                            </span>
                          )}
                          {cuenta.requiere_tercero && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                              <FaUser className="mr-1" />
                              Tercero
                            </span>
                          )}
                          {cuenta.requiere_centro_costo && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                              <FaBuilding className="mr-1" />
                              C.Costo
                            </span>
                          )}
                          {cuenta.es_cuenta_niif && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                              <FaFlag className="mr-1" />
                              NIIF
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Jerarquía */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          <div>Nivel: {nivel}</div>
                          {tieneSubcuentas && (
                            <div className="text-orange-600">
                              {subcuentasCount} subcuenta{subcuentasCount > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(cuenta)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Editar cuenta"
                          >
                            <FaEdit />
                          </button>
                          
                          <button
                            onClick={() => handleCreateChild(cuenta)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Crear subcuenta"
                            disabled={!cuenta.permite_movimiento}
                          >
                            <FaPlus />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(cuenta)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Eliminar cuenta"
                          >
                            <FaTrash />
                          </button>
                          
                          <button
                            onClick={() => console.log('Ver detalles:', cuenta)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuentas</h3>
            <p className="text-gray-500 mb-4">
              {safeCuentas.length === 0 
                ? 'No se han cargado cuentas del PUC.' 
                : 'No se encontraron cuentas con los filtros aplicados.'
              }
            </p>
            {safeCuentas.length === 0 && (
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Recargar datos
              </button>
            )}
          </div>
        )}

        {/* Paginación */}
        <Pagination />
      </div>

      {/* Modal de eliminación */}
      <DeleteModal />
    </>
  );
};

export default PucTableView;
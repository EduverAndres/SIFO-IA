// src/components/puc/PucTableView.jsx - VERSIÓN COMPLETA CON MANEJO DE ERRORES
import React, { useState } from 'react';
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
} from 'react-icons/fa';

const PucTableView = ({ 
  cuentas, 
  onEdit, 
  onDelete, 
  onCreateChild, 
  filtros, 
  setFiltros,
  loading = false 
}) => {
  const [sortField, setSortField] = useState('codigo');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cuentaToDelete, setCuentaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // ✅ ESTADOS PARA MENSAJES DE ÉXITO Y ERROR
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Configurar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Ordenar cuentas
  const sortedCuentas = [...cuentas].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // ✅ FUNCIÓN PARA VERIFICAR SI UNA CUENTA TIENE SUBCUENTAS
  const getSubcuentasCount = (codigoPadre) => {
    return cuentas.filter(cuenta => cuenta.codigo_padre === codigoPadre).length;
  };

  // ✅ FUNCIÓN PARA MOSTRAR MENSAJE DE ERROR
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    
    // Ocultar mensaje después de 7 segundos (más tiempo para errores)
    setTimeout(() => {
      setShowErrorMessage(false);
      setErrorMessage('');
    }, 7000);
  };

  // ✅ FUNCIÓN PARA MOSTRAR MENSAJE DE ÉXITO
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSuccessMessage('');
    }, 5000);
  };

  // Manejar confirmación de eliminación
  const handleDeleteClick = (cuenta) => {
    // ✅ VERIFICAR SI LA CUENTA TIENE SUBCUENTAS ANTES DE MOSTRAR EL MODAL
    const subcuentasCount = getSubcuentasCount(cuenta.codigo);
    
    if (subcuentasCount > 0) {
      // Mostrar error inmediatamente sin abrir el modal
      showError(
        `No se puede eliminar la cuenta "${cuenta.codigo} - ${cuenta.nombre}" porque tiene ${subcuentasCount} subcuenta${subcuentasCount > 1 ? 's' : ''} asociada${subcuentasCount > 1 ? 's' : ''}. Elimine primero las subcuentas.`
      );
      return;
    }
    
    setCuentaToDelete(cuenta);
    setShowDeleteModal(true);
  };

  // ✅ EJECUTAR ELIMINACIÓN CON MANEJO MEJORADO DE ERRORES
  const handleConfirmDelete = async () => {
    if (!cuentaToDelete) return;

    setDeleting(true);
    try {
      console.log('🗑️ [TABLE] Eliminando cuenta:', cuentaToDelete.codigo);
      
      // Llamar a la función de eliminación del padre
      const result = await onDelete(cuentaToDelete);
      
      console.log('✅ [TABLE] Cuenta eliminada exitosamente');
      
      // ✅ CERRAR MODAL Y MOSTRAR MENSAJE DE ÉXITO
      setShowDeleteModal(false);
      setCuentaToDelete(null);
      
      // Mostrar mensaje de éxito
      showSuccess(`Cuenta ${cuentaToDelete.codigo} - ${cuentaToDelete.nombre} eliminada exitosamente`);
      
    } catch (error) {
      console.error('💥 [TABLE] Error al eliminar cuenta:', error);
      
      // ✅ ANALIZAR EL ERROR Y MOSTRAR MENSAJE ESPECÍFICO
      let userMessage = 'Error desconocido al eliminar la cuenta';
      
      if (error.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('subcuentas') || errorMsg.includes('subcuenta') || errorMsg.includes('asociadas')) {
          const subcuentasCount = getSubcuentasCount(cuentaToDelete.codigo);
          userMessage = `No se puede eliminar la cuenta "${cuentaToDelete.codigo} - ${cuentaToDelete.nombre}" porque tiene ${subcuentasCount} subcuenta${subcuentasCount > 1 ? 's' : ''} asociada${subcuentasCount > 1 ? 's' : ''}. Elimine primero las subcuentas.`;
        } else if (errorMsg.includes('movimientos') || errorMsg.includes('transacciones')) {
          userMessage = `No se puede eliminar la cuenta "${cuentaToDelete.codigo} - ${cuentaToDelete.nombre}" porque tiene movimientos contables asociados.`;
        } else if (errorMsg.includes('not found') || errorMsg.includes('no encontrada') || errorMsg.includes('404')) {
          userMessage = `La cuenta "${cuentaToDelete.codigo} - ${cuentaToDelete.nombre}" no fue encontrada. Es posible que ya haya sido eliminada.`;
        } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized') || errorMsg.includes('forbidden')) {
          userMessage = `No tienes permisos para eliminar la cuenta "${cuentaToDelete.codigo} - ${cuentaToDelete.nombre}".`;
        } else if (errorMsg.includes('conexión') || errorMsg.includes('network') || errorMsg.includes('fetch')) {
          userMessage = `Error de conexión. Verifique su conexión a internet e intente nuevamente.`;
        } else {
          // Usar el mensaje del error directamente si es específico
          userMessage = `Error al eliminar la cuenta "${cuentaToDelete.codigo} - ${cuentaToDelete.nombre}": ${error.message}`;
        }
      }
      
      // Mostrar mensaje de error
      showError(userMessage);
      
      // ✅ CERRAR MODAL SOLO SI EL ERROR NO ES DE VALIDACIÓN
      if (!error.message?.toLowerCase().includes('subcuentas') && 
          !error.message?.toLowerCase().includes('movimientos')) {
        setShowDeleteModal(false);
        setCuentaToDelete(null);
      }
      
    } finally {
      setDeleting(false);
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCuentaToDelete(null);
  };

  // ✅ FUNCIÓN PARA CERRAR MENSAJES MANUALMENTE
  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
    setSuccessMessage('');
  };

  const handleCloseErrorMessage = () => {
    setShowErrorMessage(false);
    setErrorMessage('');
  };

  // Configuración de colores por tipo de cuenta
  const getTipoCuentaColor = (tipo) => {
    const colors = {
      'CLASE': 'bg-purple-100 text-purple-800 border-purple-200',
      'GRUPO': 'bg-blue-100 text-blue-800 border-blue-200',
      'CUENTA': 'bg-green-100 text-green-800 border-green-200',
      'SUBCUENTA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'AUXILIAR': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Configuración de colores por naturaleza
  const getNaturalezaColor = (naturaleza) => {
    return naturaleza === 'DEBITO' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Componente de encabezado ordenable
  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <FaSortUp className="text-blue-500" />
          ) : (
            <FaSortDown className="text-blue-500" />
          )
        ) : (
          <FaSort className="text-gray-400" />
        )}
      </div>
    </th>
  );

  // ✅ COMPONENTE DE MENSAJE DE ÉXITO
  const SuccessMessage = () => {
    if (!showSuccessMessage) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg max-w-md">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-3 text-lg flex-shrink-0" />
            <span className="text-green-700 font-medium flex-1">{successMessage}</span>
            <button 
              onClick={handleCloseSuccessMessage}
              className="ml-3 text-green-400 hover:text-green-600 font-bold text-lg flex-shrink-0"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ COMPONENTE DE MENSAJE DE ERROR
  const ErrorMessage = () => {
    if (!showErrorMessage) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg max-w-lg">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 mr-3 text-lg flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-red-800 font-medium text-sm leading-relaxed">
                {errorMessage}
              </div>
              <div className="mt-2 text-red-600 text-xs">
                💡 Sugerencia: Elimine primero las subcuentas o contacte al administrador si el problema persiste.
              </div>
            </div>
            <button 
              onClick={handleCloseErrorMessage}
              className="ml-3 text-red-400 hover:text-red-600 font-bold text-lg flex-shrink-0"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ MODAL DE CONFIRMACIÓN MEJORADO CON INFORMACIÓN DE SUBCUENTAS
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !cuentaToDelete) return null;

    const subcuentasCount = getSubcuentasCount(cuentaToDelete.codigo);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Confirmar eliminación
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">
              ¿Estás seguro de que deseas eliminar la siguiente cuenta?
            </p>
            
            <div className="mt-2 p-4 bg-gray-50 rounded-md border">
              <p className="text-sm font-medium text-gray-900">
                {cuentaToDelete.codigo} - {cuentaToDelete.nombre}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {cuentaToDelete.tipo} • {cuentaToDelete.naturaleza} • {cuentaToDelete.estado}
              </p>
              {cuentaToDelete.descripcion && (
                <p className="text-xs text-gray-600 mt-2 italic">
                  "{cuentaToDelete.descripcion}"
                </p>
              )}
              
              {/* ✅ MOSTRAR INFORMACIÓN DE SUBCUENTAS */}
              {subcuentasCount > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800 font-medium">
                    ⚠️ Esta cuenta tiene {subcuentasCount} subcuenta{subcuentasCount > 1 ? 's' : ''} asociada{subcuentasCount > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-sm text-red-600 mt-3 font-medium">
              ⚠️ Esta acción no se puede deshacer.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancelDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center space-x-2 transition-colors duration-200"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <FaTrash />
                  <span>Eliminar cuenta</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente de paginación
  const Pagination = () => {
    const totalPages = Math.ceil(cuentas.length / filtros.limit);
    const currentPage = filtros.page;
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Mostrando</span>
          <select
            value={filtros.limit}
            onChange={(e) => setFiltros(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>de {cuentas.length} resultados</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setFiltros(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={currentPage === 1}
            className="p-2 rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft />
          </button>
          
          <div className="flex space-x-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setFiltros(prev => ({ ...prev, page: pageNum }))}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setFiltros(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
            disabled={currentPage === totalPages}
            className="p-2 rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando cuentas...</span>
      </div>
    );
  }

  return (
    <>
      {/* ✅ MENSAJES DE ÉXITO Y ERROR */}
      <SuccessMessage />
      <ErrorMessage />
      
      <div className="overflow-hidden">
        {/* Header de la tabla */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaList className="text-blue-600 text-lg" />
              <h3 className="text-lg font-semibold text-gray-900">Vista de Lista</h3>
            </div>
            
            <div className="text-sm text-gray-500">
              {sortedCuentas.length} cuenta{sortedCuentas.length !== 1 ? 's' : ''} encontrada{sortedCuentas.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Tabla */}
        {sortedCuentas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
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
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCuentas.map((cuenta) => {
                  const subcuentasCount = getSubcuentasCount(cuenta.codigo);
                  const tieneSubcuentas = subcuentasCount > 0;
                  
                  return (
                    <tr key={cuenta.id} className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Código */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {cuenta.codigo}
                          </span>
                          {cuenta.codigo_padre && (
                            <span className="text-xs text-gray-500">
                              ← {cuenta.codigo_padre}
                            </span>
                          )}
                          {/* ✅ INDICADOR DE CUENTA PADRE */}
                          {tieneSubcuentas && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full" title={`Tiene ${subcuentasCount} subcuenta${subcuentasCount > 1 ? 's' : ''}`}>
                              📁 {subcuentasCount}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Nombre y descripción */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {cuenta.nombre}
                            {/* ✅ INDICADOR VISUAL DE CUENTA PADRE */}
                            {tieneSubcuentas && (
                              <span className="ml-2 text-xs text-yellow-600" title="Cuenta padre con subcuentas">
                                👑
                              </span>
                            )}
                          </div>
                          {cuenta.descripcion && (
                            <div className="text-sm text-gray-500 truncate max-w-xs" title={cuenta.descripcion}>
                              {cuenta.descripcion}
                            </div>
                          )}
                          {cuenta.dinamica && (
                            <div className="text-xs text-blue-600 italic truncate max-w-xs" title={cuenta.dinamica}>
                              {cuenta.dinamica}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Tipo de cuenta */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getTipoCuentaColor(cuenta.tipo)}`}>
                          {cuenta.tipo}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Nivel {cuenta.nivel}
                        </div>
                      </td>
                      
                      {/* Naturaleza */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getNaturalezaColor(cuenta.naturaleza)}`}>
                          {cuenta.naturaleza}
                        </span>
                      </td>
                      
                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          cuenta.estado === 'ACTIVA' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {cuenta.estado === 'ACTIVA' ? (
                            <FaCheckCircle className="mr-1" />
                          ) : (
                            <FaTimesCircle className="mr-1" />
                          )}
                          {cuenta.estado}
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
                              <FaInfo className="mr-1" />
                              Tercero
                            </span>
                          )}
                          {cuenta.requiere_centro_costo && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                              <FaCode className="mr-1" />
                              C.Costo
                            </span>
                          )}
                          {cuenta.es_cuenta_niif && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                              NIIF
                              {cuenta.codigo_niif && (
                                <span className="ml-1">({cuenta.codigo_niif})</span>
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onCreateChild(cuenta.codigo)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Crear subcuenta"
                          >
                            <FaPlus className="text-sm" />
                          </button>
                          
                          <button
                            onClick={() => onEdit(cuenta)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Editar cuenta"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          
                          {/* ✅ BOTÓN DE ELIMINAR CON INDICADOR VISUAL */}
                          <button
                            onClick={() => handleDeleteClick(cuenta)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              tieneSubcuentas 
                                ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                                : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                            }`}
                            title={
                              tieneSubcuentas 
                                ? `No se puede eliminar: tiene ${subcuentasCount} subcuenta${subcuentasCount > 1 ? 's' : ''}`
                                : 'Eliminar cuenta'
                            }
                            disabled={deleting}
                          >
                            {tieneSubcuentas ? (
                              <span className="text-sm">🔒</span>
                            ) : (
                              <FaTrash className="text-sm" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Paginación */}
            <Pagination />
          </div>
        ) : (
          <div className="text-center py-12">
            <FaList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cuentas</h3>
            <p className="text-gray-500 mb-4">
              Ajusta los filtros de búsqueda o crea nuevas cuentas.
            </p>
          </div>
        )}

        {/* Información adicional */}
        {sortedCuentas.length > 0 && (
          <div className="bg-blue-50 px-6 py-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-600">
                <span>Ordenado por: <strong>{sortField}</strong> ({sortDirection === 'asc' ? 'Ascendente' : 'Descendente'})</span>
              </div>
              <div className="flex items-center space-x-4 text-blue-600">
                <div className="flex items-center space-x-1">
                  <FaInfo className="text-xs" />
                  <span>Haz clic en los encabezados para ordenar</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs">🔒 = Cuenta padre</span>
                  <span className="text-xs">👑 = Tiene subcuentas</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal />
    </>
  );
};

export default PucTableView;
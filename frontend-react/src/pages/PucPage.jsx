// frontend-react/src/pages/PucPage.jsx - CÓDIGO COMPLETO Y CORREGIDO
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaUpload, 
  FaFileExcel,
  FaFileAlt,  
  FaTimes,
  FaTree,
  FaList,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestion,
  FaBookOpen,
} from 'react-icons/fa';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import ImportPucExcelModal from '../components/puc/ImportPucExcelModal'; // Modal específico para Excel
import { pucApi } from '../api/pucApi';

const PucPage = () => {
  // ===============================================
  // 🔄 ESTADOS PRINCIPALES
  // ===============================================
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Estados de formularios
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    codigo_completo: '',
    nombre: '',
    descripcion: '',
    naturaleza: 'DEBITO',
    tipo_cuenta: 'DETALLE',
    acepta_movimientos: true,
    codigo_padre: ''
  });

  // Estados de exportación
  const [exportOptions, setExportOptions] = useState({
    incluir_saldos: true,
    incluir_movimientos: true,
    incluir_fiscal: true,
    filtro_estado: 'ACTIVA',
    filtro_tipo: ''
  });

  // Estados de filtros y vista
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'ACTIVA',
    tipo: '',
    naturaleza: '',
    codigo_padre: '',
    limite: 50,
    pagina: 1
  });
  const [vistaArbol, setVistaArbol] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [paginacion, setPaginacion] = useState({
    total: 0,
    totalPaginas: 0,
    paginaActual: 1
  });

  // ===============================================
  // 🔄 EFECTOS Y CARGA INICIAL
  // ===============================================
  
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pucApi.obtenerCuentas(filtros);
      setCuentas(response.data || []);
      setPaginacion({
        total: response.total || 0,
        totalPaginas: response.totalPaginas || 0,
        paginaActual: response.pagina || 1
      });
    } catch (err) {
      setError('Error cargando cuentas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await pucApi.obtenerEstadisticas();
      setEstadisticas(response.data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    cargarEstadisticas();
  }, [cargarDatos, cargarEstadisticas]);

  useEffect(() => {
    // Limpiar mensajes después de 5 segundos
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    // Limpiar errores después de 8 segundos
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ===============================================
  // 📥 FUNCIÓN DE IMPORTACIÓN ACTUALIZADA
  // ===============================================
  const handleImportSuccess = async (result) => {
    try {
      // Mostrar mensaje de éxito
      setSuccess(`Importación completada: ${result.resumen.insertadas} insertadas, ${result.resumen.actualizadas} actualizadas`);
      
      // Recargar datos
      await cargarDatos();
      await cargarEstadisticas();
      
      // Cerrar modal
      setShowImportModal(false);
    } catch (err) {
      console.error('Error al actualizar después de importar:', err);
    }
  };

  // ===============================================
  // 📤 FUNCIONES DE EXPORTACIÓN
  // ===============================================
  const exportarExcel = async () => {
    setLoading(true);
    try {
      await pucApi.exportarAExcel(exportOptions);
      setSuccess('Archivo Excel exportado exitosamente');
      setShowExportModal(false);
    } catch (err) {
      setError('Error exportando: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const descargarTemplate = async () => {
    setLoading(true);
    try {
      await pucApi.descargarTemplate(true);
      setSuccess('Template descargado exitosamente');
    } catch (err) {
      setError('Error descargando template: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================================
  // 📝 FUNCIONES CRUD
  // ===============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingAccount) {
        await pucApi.actualizarCuenta(editingAccount.id, formData);
        setSuccess('Cuenta actualizada exitosamente');
      } else {
        await pucApi.crearCuenta(formData);
        setSuccess('Cuenta creada exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      await cargarDatos();
      await cargarEstadisticas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarCuenta = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cuenta?')) return;
    
    setLoading(true);
    try {
      await pucApi.eliminarCuenta(id);
      setSuccess('Cuenta eliminada exitosamente');
      await cargarDatos();
      await cargarEstadisticas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editarCuenta = (cuenta) => {
    setEditingAccount(cuenta);
    setFormData({
      codigo_completo: cuenta.codigo_completo,
      nombre: cuenta.nombre,
      descripcion: cuenta.descripcion || '',
      naturaleza: cuenta.naturaleza,
      tipo_cuenta: cuenta.tipo_cuenta,
      acepta_movimientos: cuenta.acepta_movimientos,
      codigo_padre: cuenta.codigo_padre || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      codigo_completo: '',
      nombre: '',
      descripcion: '',
      naturaleza: 'DEBITO',
      tipo_cuenta: 'DETALLE',
      acepta_movimientos: true,
      codigo_padre: ''
    });
  };

  // ===============================================
  // 🔧 FUNCIONES AUXILIARES
  // ===============================================
  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: nuevaPagina }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: '',
      tipo: '',
      naturaleza: '',
      codigo_padre: '',
      limite: 50,
      pagina: 1
    });
  };

  const formatearSaldo = (saldo) => {
    if (!saldo) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(saldo);
  };

  // ===============================================
  // 🎨 COMPONENTE PRINCIPAL
  // ===============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-6">
        {/* Header con estadísticas */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Plan Único de Cuentas (PUC)
            </h1>
            <p className="text-gray-600">
              Gestiona la estructura contable con importación/exportación Excel
            </p>
            
            {/* Estadísticas rápidas */}
            {estadisticas && (
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="font-semibold text-blue-600">{estadisticas.total}</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border">
                  <span className="text-sm text-gray-600">Con movimientos: </span>
                  <span className="font-semibold text-green-600">{estadisticas.acepta_movimientos}</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border">
                  <span className="text-sm text-gray-600">Clases: </span>
                  <span className="font-semibold text-purple-600">{estadisticas.por_tipo?.clases || 0}</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border">
                  <span className="text-sm text-gray-600">Activas: </span>
                  <span className="font-semibold text-green-600">{estadisticas.por_estado?.activas || 0}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              icon={FaPlus}
            >
              Nueva Cuenta
            </Button>
            
            <Button
              onClick={() => setShowImportModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              icon={FaUpload}
            >
              Importar Excel
            </Button>
            
            <Button
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              icon={FaDownload}
            >
              Exportar
            </Button>

            <Button
              onClick={descargarTemplate}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              icon={FaFileAlt}
              loading={loading}
            >
              Template
            </Button>
          </div>
        </div>

        {/* Mensajes de notificación */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-500 hover:text-red-700 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
            <FaCheckCircle className="text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Éxito</p>
              <p className="text-green-600 text-sm">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess(null)} 
              className="ml-auto text-green-500 hover:text-green-700 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Panel de filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h2>
            <div className="flex space-x-2">
              <Button
                onClick={limpiarFiltros}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                icon={FaTimes}
              >
                Limpiar
              </Button>
              <Button
                onClick={() => setVistaArbol(!vistaArbol)}
                className={`px-3 py-1 text-sm transition-colors ${
                  vistaArbol 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                icon={vistaArbol ? FaTree : FaList}
              >
                {vistaArbol ? 'Árbol' : 'Lista'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <Input
              label="Buscar"
              placeholder="Código o nombre..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value, pagina: 1})}
              icon={FaSearch}
            />
            
            <Select
              label="Estado"
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value, pagina: 1})}
              options={[
                { value: '', label: 'Todos' },
                { value: 'ACTIVA', label: 'Activa' },
                { value: 'INACTIVA', label: 'Inactiva' }
              ]}
            />
            
            <Select
              label="Tipo"
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value, pagina: 1})}
              options={[
                { value: '', label: 'Todos' },
                { value: 'CLASE', label: 'Clase' },
                { value: 'GRUPO', label: 'Grupo' },
                { value: 'CUENTA', label: 'Cuenta' },
                { value: 'SUBCUENTA', label: 'Subcuenta' },
                { value: 'DETALLE', label: 'Detalle' }
              ]}
            />
            
            <Select
              label="Naturaleza"
              value={filtros.naturaleza}
              onChange={(e) => setFiltros({...filtros, naturaleza: e.target.value, pagina: 1})}
              options={[
                { value: '', label: 'Todas' },
                { value: 'DEBITO', label: 'Débito' },
                { value: 'CREDITO', label: 'Crédito' }
              ]}
            />

            <Input
              label="Cuenta Padre"
              placeholder="Código padre..."
              value={filtros.codigo_padre}
              onChange={(e) => setFiltros({...filtros, codigo_padre: e.target.value, pagina: 1})}
            />

            <Select
              label="Por página"
              value={filtros.limite}
              onChange={(e) => setFiltros({...filtros, limite: parseInt(e.target.value), pagina: 1})}
              options={[
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
                { value: 200, label: '200' }
              ]}
            />
          </div>
        </div>

        {/* Tabla de cuentas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Cuentas del PUC
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{cuentas.length} cuentas mostradas</span>
                <span>•</span>
                <span>{paginacion.total} total</span>
                {paginacion.totalPaginas > 1 && (
                  <>
                    <span>•</span>
                    <span>Página {paginacion.paginaActual} de {paginacion.totalPaginas}</span>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-blue-600" />
                <span className="ml-3 text-gray-600">Cargando cuentas...</span>
              </div>
            ) : cuentas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaFileAlt className="text-6xl mx-auto mb-4" />
                </div>
                <p className="text-gray-500 text-lg">No se encontraron cuentas</p>
                <p className="text-gray-400 text-sm">Intenta ajustar los filtros o importar cuentas desde Excel</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Código</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Naturaleza</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Saldo Inicial</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuentas.map((cuenta, index) => (
                        <tr 
                          key={cuenta.id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border">
                              {cuenta.codigo_completo}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{cuenta.nombre}</div>
                              {cuenta.descripcion && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{cuenta.descripcion}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cuenta.tipo_cuenta === 'CLASE' ? 'bg-purple-100 text-purple-800' :
                              cuenta.tipo_cuenta === 'GRUPO' ? 'bg-blue-100 text-blue-800' :
                              cuenta.tipo_cuenta === 'CUENTA' ? 'bg-green-100 text-green-800' :
                              cuenta.tipo_cuenta === 'SUBCUENTA' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {cuenta.tipo_cuenta}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              cuenta.naturaleza === 'DEBITO' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {cuenta.naturaleza}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm">
                              {formatearSaldo(cuenta.saldo_inicial)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cuenta.estado === 'ACTIVA' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cuenta.estado}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editarCuenta(cuenta)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Editar cuenta"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => eliminarCuenta(cuenta.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar cuenta"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {paginacion.totalPaginas > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Mostrando {((paginacion.paginaActual - 1) * filtros.limite) + 1} - {Math.min(paginacion.paginaActual * filtros.limite, paginacion.total)} de {paginacion.total} resultados
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => cambiarPagina(paginacion.paginaActual - 1)}
                        disabled={paginacion.paginaActual === 1}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </Button>
                      
                      {/* Números de página */}
                      {Array.from({ length: Math.min(5, paginacion.totalPaginas) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            onClick={() => cambiarPagina(page)}
                            className={`px-3 py-1 text-sm transition-colors ${
                              page === paginacion.paginaActual
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        onClick={() => cambiarPagina(paginacion.paginaActual + 1)}
                        disabled={paginacion.paginaActual === paginacion.totalPaginas}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Crear/Editar Cuenta */}
        <Modal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Código Completo *"
                value={formData.codigo_completo}
                onChange={(e) => setFormData({...formData, codigo_completo: e.target.value})}
                placeholder="ej: 110501"
                required
                disabled={editingAccount} // No permitir cambiar código al editar
              />
              
              <Input
                label="Nombre *"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Nombre de la cuenta"
                required
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción detallada (opcional)"
                />
              </div>
              
              <Select
                label="Naturaleza"
                value={formData.naturaleza}
                onChange={(e) => setFormData({...formData, naturaleza: e.target.value})}
                options={[
                  { value: 'DEBITO', label: 'Débito' },
                  { value: 'CREDITO', label: 'Crédito' }
                ]}
              />
              
              <Select
                label="Tipo de Cuenta"
                value={formData.tipo_cuenta}
                onChange={(e) => setFormData({...formData, tipo_cuenta: e.target.value})}
                options={[
                  { value: 'CLASE', label: 'Clase' },
                  { value: 'GRUPO', label: 'Grupo' },
                  { value: 'CUENTA', label: 'Cuenta' },
                  { value: 'SUBCUENTA', label: 'Subcuenta' },
                  { value: 'DETALLE', label: 'Detalle' }
                ]}
              />
              
              <Input
                label="Código Padre"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
                placeholder="ej: 1105"
              />
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="acepta_movimientos"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="acepta_movimientos" className="text-sm font-medium text-gray-700">
                  Acepta movimientos
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                icon={editingAccount ? FaEdit : FaPlus}
              >
                {editingAccount ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Importar Excel - USANDO ImportPucExcelModal */}
        <ImportPucExcelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportSuccess}
          loading={loading}
        />

        {/* Modal Exportar */}
        <Modal
          show={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Exportar PUC a Excel"
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opciones de contenido */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Contenido a Exportar</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="incluir_saldos"
                      checked={exportOptions.incluir_saldos}
                      onChange={(e) => setExportOptions({...exportOptions, incluir_saldos: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="incluir_saldos" className="text-sm text-gray-700">
                      Incluir saldos iniciales y finales
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="incluir_movimientos"
                      checked={exportOptions.incluir_movimientos}
                      onChange={(e) => setExportOptions({...exportOptions, incluir_movimientos: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="incluir_movimientos" className="text-sm text-gray-700">
                      Incluir movimientos (débitos/créditos)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="incluir_fiscal"
                      checked={exportOptions.incluir_fiscal}
                      onChange={(e) => setExportOptions({...exportOptions, incluir_fiscal: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="incluir_fiscal" className="text-sm text-gray-700">
                      Incluir información fiscal
                    </label>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Filtros</h3>
                
                <Select
                  label="Estado de las cuentas"
                  value={exportOptions.filtro_estado}
                  onChange={(e) => setExportOptions({...exportOptions, filtro_estado: e.target.value})}
                  options={[
                    { value: 'TODAS', label: 'Todas' },
                    { value: 'ACTIVA', label: 'Solo activas' },
                    { value: 'INACTIVA', label: 'Solo inactivas' }
                  ]}
                />
                
                <Select
                  label="Tipo de cuenta"
                  value={exportOptions.filtro_tipo}
                  onChange={(e) => setExportOptions({...exportOptions, filtro_tipo: e.target.value})}
                  options={[
                    { value: '', label: 'Todos los tipos' },
                    { value: 'CLASE', label: 'Solo clases' },
                    { value: 'GRUPO', label: 'Solo grupos' },
                    { value: 'CUENTA', label: 'Solo cuentas' },
                    { value: 'SUBCUENTA', label: 'Solo subcuentas' },
                    { value: 'DETALLE', label: 'Solo detalles' }
                  ]}
                />
              </div>
            </div>

            {/* Información del archivo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FaFileExcel className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Archivo que se generará:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Formato: Excel (.xlsx)</li>
                    <li>• Estructura: Compatible con importación</li>
                    <li>• Incluye headers del template estándar</li>
                    <li>• Descarga automática al completar</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={exportarExcel}
                loading={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                icon={FaDownload}
              >
                Exportar Excel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Ayuda y Documentación */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative group">
            <Button
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              icon={FaQuestion}
            />
            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Ayuda - PUC</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Crear cuenta:</strong> Click en "Nueva Cuenta" para agregar una cuenta al PUC.</p>
                  <p><strong>Importar:</strong> Sube un archivo Excel con el formato del template.</p>
                  <p><strong>Exportar:</strong> Descarga el PUC en formato Excel compatible.</p>
                  <p><strong>Template:</strong> Descarga la plantilla Excel con ejemplos.</p>
                  <p><strong>Filtros:</strong> Usa los filtros para encontrar cuentas específicas.</p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors">
                    <FaBookOpen className="mr-1" />
                    Ver documentación completa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS adicionales para animaciones */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .bg-gray-25 {
          background-color: #fafafa;
        }
        
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
        
        .transition-all {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default PucPage;
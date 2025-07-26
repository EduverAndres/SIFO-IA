// frontend-react/src/pages/PucPage.jsx - CÓDIGO CORREGIDO PARA MODAL DE EXPORTACIÓN
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaUpload, 
  // FaFileExcel, // ✅ COMENTADO - No se usa
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
import ExportPucModal from '../components/puc/ExportPucModal'; // ✅ IMPORTAR EL MODAL DE EXPORTACIÓN
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
  const [showExportModal, setShowExportModal] = useState(false); // ✅ MANTENER ESTE ESTADO

  // ✅ CONSOLE LOG PARA MONITOREAR CAMBIOS EN showExportModal
  useEffect(() => {
    console.log('🔍 PucPage - showExportModal cambió a:', showExportModal);
  }, [showExportModal]);

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
  // 📤 FUNCIONES DE EXPORTACIÓN - ✅ SIMPLIFICADAS
  // ===============================================
  // ✅ FUNCIÓN REMOVIDA - No se usa
  // const handleExportSuccess = async () => {
  //   try {
  //     setSuccess('PUC exportado exitosamente');
  //     setShowExportModal(false);
  //   } catch (err) {
  //     setError('Error en exportación: ' + err.message);
  //   }
  // };

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
            
            {/* ✅ BOTÓN DE EXPORTAR CORREGIDO CON CONSOLE LOG */}
            <Button
              onClick={() => {
                console.log('🔍 BOTÓN EXPORTAR CLICKEADO - Estado actual showExportModal:', showExportModal);
                console.log('🔍 Cambiando showExportModal a: true');
                setShowExportModal(true);
              }}
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

{/* Tabla de cuentas - VERSIÓN EXACTA CON CAMPOS REALES DE LA BD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Cuentas del PUC - Vista Completa (Campos Exactos BD)
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
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {/* CAMPOS EXACTOS SEGÚN LA BD */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[60px] border-r border-gray-200" style={{backgroundColor: '#f8f9fa'}}>id</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[100px] border-r border-gray-200" style={{backgroundColor: '#f8f9fa'}}>codigo_completo</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[150px] border-r border-gray-200" style={{backgroundColor: '#f8f9fa'}}>nombre</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[200px] border-r border-gray-200" style={{backgroundColor: '#f8f9fa'}}>descripcion</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>tipo_cuenta</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[70px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>naturaleza</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>nivel</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[60px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>estado</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[30px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>tipo_cta</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[70px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>codigo_padre</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>codigo_clase</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>codigo_grupo</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>codigo_cuenta</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[60px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>codigo_subcuenta</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[60px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>codigo_detalle</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e8f5e8'}}>saldo_inicial</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e8f5e8'}}>saldo_final</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e8f5e8'}}>movimientos_debito</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e8f5e8'}}>movimientos_credito</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>acepta_movimientos</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>requiere_tercero</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>requiere_centro_costo</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>activo</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>es_cuenta_niif</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>aplica_f350</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>aplica_f300</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>aplica_exogena</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>aplica_ica</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>aplica_dr110</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[70px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>codigo_niif</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>codigo_ti</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>codigo_at</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>codigo_ct</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>codigo_cc</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[100px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>centro_costos</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[100px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>dinamica</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[100px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>observaciones</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>conciliacion_fiscal</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>tipo_om</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>id_movimiento</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>usuario_creacion</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>usuario_modificacion</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>fecha_creacion</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>fecha_modificacion</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>fila_excel</th>
                        
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px]" style={{backgroundColor: '#74b9ff'}}>Acciones</th>
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
                          {/* USANDO NOMBRES EXACTOS DE LA BD */}
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs text-gray-500 font-mono">#{cuenta.id}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{cuenta.codigo_completo}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="font-medium text-xs text-gray-900 max-w-[150px] truncate" title={cuenta.nombre}>
                              {cuenta.nombre}
                            </div>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="text-xs text-gray-600 max-w-[200px] truncate" title={cuenta.descripcion}>
                              {cuenta.descripcion || <span className="text-gray-400 italic">N/A</span>}
                            </div>
                          </td>

                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                              cuenta.tipo_cuenta === 'CLASE' ? 'bg-purple-100 text-purple-800' :
                              cuenta.tipo_cuenta === 'GRUPO' ? 'bg-blue-100 text-blue-800' :
                              cuenta.tipo_cuenta === 'CUENTA' ? 'bg-green-100 text-green-800' :
                              cuenta.tipo_cuenta === 'SUBCUENTA' ? 'bg-yellow-100 text-yellow-800' :
                              cuenta.tipo_cuenta === 'DETALLE' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {cuenta.tipo_cuenta}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                              cuenta.naturaleza === 'DEBITO' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {cuenta.naturaleza}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className="text-xs font-medium">{cuenta.nivel || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                              cuenta.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {cuenta.estado}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className="text-xs font-mono">{cuenta.tipo_cta || 'N/A'}</span>
                          </td>

                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_padre || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_clase || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_grupo || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_cuenta || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_subcuenta || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_detalle || 'N/A'}</span>
                          </td>

                          <td className="py-1 px-1 border-r border-gray-100 text-right">
                            <span className="text-xs font-mono">{formatearSaldo(cuenta.saldo_inicial)}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-right">
                            <span className={`text-xs font-mono ${
                              (cuenta.saldo_final || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatearSaldo(cuenta.saldo_final)}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-right">
                            <span className="text-xs font-mono text-red-600">{formatearSaldo(cuenta.movimientos_debito)}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-right">
                            <span className="text-xs font-mono text-blue-600">{formatearSaldo(cuenta.movimientos_credito)}</span>
                          </td>

                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.acepta_movimientos ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.acepta_movimientos ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.requiere_tercero ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.requiere_tercero ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.requiere_centro_costo ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.requiere_centro_costo ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.activo ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.activo ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.es_cuenta_niif ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.es_cuenta_niif ? '✓' : '✗'}
                            </span>
                          </td>

                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_f350 ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_f350 ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_f300 ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_f300 ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_exogena ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_exogena ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_ica ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_ica ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_dr110 ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_dr110 ? '✓' : '✗'}
                            </span>
                          </td>

                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_niif || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_ti || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_at || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_ct || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_cc || 'N/A'}</span>
                          </td>

                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="text-xs max-w-[100px] truncate" title={cuenta.centro_costos}>
                              {cuenta.centro_costos || <span className="text-gray-400">N/A</span>}
                            </div>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="text-xs max-w-[100px] truncate" title={cuenta.dinamica}>
                              {cuenta.dinamica || <span className="text-gray-400">N/A</span>}
                            </div>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="text-xs max-w-[100px] truncate" title={cuenta.observaciones}>
                              {cuenta.observaciones || <span className="text-gray-400">N/A</span>}
                            </div>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">{cuenta.conciliacion_fiscal || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">{cuenta.tipo_om || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.id_movimiento || 'N/A'}</span>
                          </td>

                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">{cuenta.usuario_creacion || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">{cuenta.usuario_modificacion || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">
                              {cuenta.fecha_creacion ? new Date(cuenta.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">
                              {cuenta.fecha_modificacion ? new Date(cuenta.fecha_modificacion).toLocaleDateString('es-ES') : 'N/A'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className="text-xs">{cuenta.fila_excel || 'N/A'}</span>
                          </td>

                          <td className="py-1 px-1">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => editarCuenta(cuenta)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Editar cuenta"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              <button
                                onClick={() => {
                                  const confirmar = window.confirm(
                                    `¿Estás seguro de que deseas eliminar la cuenta?\n\n` +
                                    `Código: ${cuenta.codigo_completo}\n` +
                                    `Nombre: ${cuenta.nombre}\n\n` +
                                    `Esta acción NO se puede deshacer.`
                                  );
                                  if (confirmar) {
                                    console.log('🗑️ Eliminando cuenta:', cuenta.id, cuenta.codigo_completo);
                                    eliminarCuenta(cuenta.id);
                                  }
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Eliminar cuenta"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                              <button
                                onClick={() => {
                                  console.log('🔍 DATOS EXACTOS DE LA BD:', cuenta);
                                  // Mostrar todos los campos tal como vienen de la BD
                                  const camposOrdenados = Object.keys(cuenta).sort().map(key => 
                                    `${key}: ${cuenta[key] === null ? 'NULL' : cuenta[key]}`
                                  ).join('\n');
                                  alert(`📊 DATOS EXACTOS DE LA BD:\n\n${camposOrdenados}`);
                                }}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Ver datos exactos de BD"
                              >
                                <FaQuestion className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Información sobre campos exactos de BD */}
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">✅ Campos exactos de la base de datos:</h4>
                  <div className="text-xs text-green-700">
                    <p><strong>IMPORTANTE:</strong> Esta tabla muestra los nombres exactos de las columnas tal como están en la base de datos.</p>
                    <p><strong>Verificación:</strong> Usa el botón "?" en cada fila para ver los datos exactos que llegan desde la BD.</p>
                    <p><strong>Campos de la BD:</strong> id, tipo_cuenta, naturaleza, estado, nivel, acepta_movimientos, requiere_tercero, requiere_centro_costo, saldo_inicial, saldo_final, movimientos_debito, movimientos_credito, aplica_f350, aplica_f300, aplica_exogena, aplica_ica, aplica_dr110, es_cuenta_niif, activo, fecha_creacion, fecha_modificacion, fila_excel, codigo_ti, centro_costos, codigo_clase, codigo_grupo, codigo_cuenta, codigo_subcuenta, codigo_detalle, codigo_completo, nombre, descripcion, dinamica, observaciones, codigo_niif, usuario_modificacion, tipo_cta, codigo_padre, usuario_creacion, id_movimiento, conciliacion_fiscal, tipo_om, codigo_at, codigo_ct, codigo_cc</p>
                  </div>
                </div>

                {/* Leyenda de colores */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">🎨 Leyenda de colores por sección:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#f8f9fa'}}></div>
                      <span>Identificación</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#e3f2fd'}}></div>
                      <span>Clasificación</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#fff3e0'}}></div>
                      <span>Jerarquía</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#e8f5e8'}}></div>
                      <span>Saldos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#f3e5f5'}}></div>
                      <span>Operativas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#ffeaa7'}}></div>
                      <span>Fiscales</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#fdcb6e'}}></div>
                      <span>Códigos Esp.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#dda0dd'}}></div>
                      <span>Info Adicional</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#fab1a0'}}></div>
                      <span>Metadatos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#74b9ff'}}></div>
                      <span>Acciones</span>
                    </div>
                  </div>
                </div>

                {/* Información detallada sobre todos los campos */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">📋 Descripción completa de todos los campos de la BD:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-xs text-blue-700">
                    
                    {/* Identificación */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🆔 Identificación:</h5>
                      <div><strong>id:</strong> integer NOT NULL - PK</div>
                      <div><strong>codigo_completo:</strong> varchar NOT NULL</div>
                      <div><strong>nombre:</strong> varchar NOT NULL</div>
                      <div><strong>descripcion:</strong> text NULLABLE</div>
                    </div>

                    {/* Clasificación */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">📊 Clasificación:</h5>
                      <div><strong>tipo_cuenta:</strong> USER-DEFINED NOT NULL</div>
                      <div><strong>naturaleza:</strong> USER-DEFINED NOT NULL</div>
                      <div><strong>nivel:</strong> integer NOT NULL</div>
                      <div><strong>estado:</strong> USER-DEFINED NOT NULL</div>
                      <div><strong>tipo_cta:</strong> character NOT NULL</div>
                    </div>

                    {/* Jerarquía */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🌳 Jerarquía:</h5>
                      <div><strong>codigo_padre:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_clase:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_grupo:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_cuenta:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_subcuenta:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_detalle:</strong> varchar NULLABLE</div>
                    </div>

                    {/* Saldos */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">💰 Saldos:</h5>
                      <div><strong>saldo_inicial:</strong> numeric NOT NULL</div>
                      <div><strong>saldo_final:</strong> numeric NOT NULL</div>
                      <div><strong>movimientos_debito:</strong> numeric NOT NULL</div>
                      <div><strong>movimientos_credito:</strong> numeric NOT NULL</div>
                    </div>

                    {/* Operativas */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">⚙️ Configuración:</h5>
                      <div><strong>acepta_movimientos:</strong> boolean NOT NULL</div>
                      <div><strong>requiere_tercero:</strong> boolean NOT NULL</div>
                      <div><strong>requiere_centro_costo:</strong> boolean NOT NULL</div>
                      <div><strong>activo:</strong> boolean NOT NULL</div>
                      <div><strong>es_cuenta_niif:</strong> boolean NOT NULL</div>
                    </div>

                    {/* Fiscales */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🏛️ Aplicaciones Fiscales:</h5>
                      <div><strong>aplica_f350:</strong> boolean NOT NULL</div>
                      <div><strong>aplica_f300:</strong> boolean NOT NULL</div>
                      <div><strong>aplica_exogena:</strong> boolean NOT NULL</div>
                      <div><strong>aplica_ica:</strong> boolean NOT NULL</div>
                      <div><strong>aplica_dr110:</strong> boolean NOT NULL</div>
                    </div>

                    {/* Códigos Especiales */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🔢 Códigos Especiales:</h5>
                      <div><strong>codigo_niif:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_ti:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_at:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_ct:</strong> varchar NULLABLE</div>
                      <div><strong>codigo_cc:</strong> varchar NULLABLE</div>
                    </div>

                    {/* Adicional */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">📝 Información Adicional:</h5>
                      <div><strong>centro_costos:</strong> varchar NULLABLE</div>
                      <div><strong>dinamica:</strong> text NULLABLE</div>
                      <div><strong>observaciones:</strong> text NULLABLE</div>
                      <div><strong>conciliacion_fiscal:</strong> varchar NULLABLE</div>
                      <div><strong>tipo_om:</strong> varchar NULLABLE</div>
                      <div><strong>id_movimiento:</strong> varchar NULLABLE</div>
                    </div>

                    {/* Metadatos */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🕐 Metadatos:</h5>
                      <div><strong>usuario_creacion:</strong> varchar NULLABLE</div>
                      <div><strong>usuario_modificacion:</strong> varchar NULLABLE</div>
                      <div><strong>fecha_creacion:</strong> timestamp with time zone NOT NULL</div>
                      <div><strong>fecha_modificacion:</strong> timestamp with time zone NOT NULL</div>
                      <div><strong>fila_excel:</strong> integer NULLABLE</div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de la vista */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between text-sm">
                    <div className="text-green-800">
                      <strong>📊 Vista exacta BD:</strong> Mostrando todos los {Object.keys(cuentas[0] || {}).length} campos reales de la base de datos
                    </div>
                    <div className="text-green-600">
                      🔍 Click en "?" para ver datos exactos • Scroll horizontal para todos los campos →
                    </div>
                  </div>
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
        </div>        {/* Tabla de cuentas - VERSIÓN COMPLETA CON TODOS LOS CAMPOS DE LA BD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Cuentas del PUC - Vista Completa (Todos los campos)
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
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {/* Campos de Identificación */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[60px] border-r border-gray-200" style={{backgroundColor: '#f8f9fa'}}>ID</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[100px] border-r border-gray-200" style={{backgroundColor: '#f8f9fa'}}>Código Completo</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[150px] border-r border-gray-200" style={{backgroundColor: '#f8f9fa'}}>Nombre</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[200px] border-r border-gray-200" style={{backgroundColor: '#f8f9fa'}}>Descripción</th>
                        
                        {/* Campos de Clasificación */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>Tipo Cuenta</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[70px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>Naturaleza</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>Nivel</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[60px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>Estado</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[30px] border-r border-gray-200" style={{backgroundColor: '#e3f2fd'}}>Tipo Cta</th>
                        
                        {/* Códigos Jerárquicos */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[70px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>Padre</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>Clase</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>Grupo</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>Cuenta</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[60px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>Subcuenta</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[60px] border-r border-gray-200" style={{backgroundColor: '#fff3e0'}}>Detalle</th>
                        
                        {/* Saldos y Movimientos */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e8f5e8'}}>Saldo Inicial</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e8f5e8'}}>Saldo Final</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e8f5e8'}}>Mov. Débito</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#e8f5e8'}}>Mov. Crédito</th>
                        
                        {/* Configuraciones Operativas */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>Acepta Mov</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>Req. Tercero</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>Req. CC</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>Activo</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#f3e5f5'}}>NIIF</th>
                        
                        {/* Aplicaciones Fiscales */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>F350</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>F300</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>Exógena</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>ICA</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[40px] border-r border-gray-200" style={{backgroundColor: '#ffeaa7'}}>DR110</th>
                        
                        {/* Códigos Especiales */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[70px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>Código NIIF</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>Código TI</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>Código AT</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>Código CT</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fdcb6e'}}>Código CC</th>
                        
                        {/* Información Adicional */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[100px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>Centro Costos</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[100px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>Dinámica</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[100px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>Observaciones</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>Concil. Fiscal</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>Tipo OM</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#dda0dd'}}>ID Movimiento</th>
                        
                        {/* Metadatos */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>Usuario Creación</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>Usuario Modif.</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>Fecha Creación</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>Fecha Modif.</th>
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[50px] border-r border-gray-200" style={{backgroundColor: '#fab1a0'}}>Fila Excel</th>
                        
                        {/* Acciones */}
                        <th className="text-left py-2 px-1 font-medium text-gray-700 min-w-[80px]" style={{backgroundColor: '#74b9ff'}}>Acciones</th>
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
                          {/* Campos de Identificación */}
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs text-gray-500 font-mono">#{cuenta.id}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{cuenta.codigo_completo}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="font-medium text-xs text-gray-900 max-w-[150px] truncate" title={cuenta.nombre}>
                              {cuenta.nombre}
                            </div>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="text-xs text-gray-600 max-w-[200px] truncate" title={cuenta.descripcion}>
                              {cuenta.descripcion || <span className="text-gray-400 italic">N/A</span>}
                            </div>
                          </td>

                          {/* Campos de Clasificación */}
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                              cuenta.tipo_cuenta === 'CLASE' ? 'bg-purple-100 text-purple-800' :
                              cuenta.tipo_cuenta === 'GRUPO' ? 'bg-blue-100 text-blue-800' :
                              cuenta.tipo_cuenta === 'CUENTA' ? 'bg-green-100 text-green-800' :
                              cuenta.tipo_cuenta === 'SUBCUENTA' ? 'bg-yellow-100 text-yellow-800' :
                              cuenta.tipo_cuenta === 'DETALLE' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {cuenta.tipo_cuenta}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                              cuenta.naturaleza === 'DEBITO' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {cuenta.naturaleza}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className="text-xs font-medium">{cuenta.nivel || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                              cuenta.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {cuenta.estado}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className="text-xs font-mono">{cuenta.tipo_cta || 'N/A'}</span>
                          </td>

                          {/* Códigos Jerárquicos */}
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_padre || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_clase || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_grupo || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_cuenta || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_subcuenta || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_detalle || 'N/A'}</span>
                          </td>

                          {/* Saldos y Movimientos */}
                          <td className="py-1 px-1 border-r border-gray-100 text-right">
                            <span className="text-xs font-mono">{formatearSaldo(cuenta.saldo_inicial)}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-right">
                            <span className={`text-xs font-mono ${
                              (cuenta.saldo_final || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatearSaldo(cuenta.saldo_final)}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-right">
                            <span className="text-xs font-mono text-red-600">{formatearSaldo(cuenta.movimientos_debito)}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-right">
                            <span className="text-xs font-mono text-blue-600">{formatearSaldo(cuenta.movimientos_credito)}</span>
                          </td>

                          {/* Configuraciones Operativas */}
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.acepta_movimientos ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.acepta_movimientos ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.requiere_tercero ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.requiere_tercero ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.requiere_centro_costo ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.requiere_centro_costo ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.activo ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.activo ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.es_cuenta_niif ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.es_cuenta_niif ? '✓' : '✗'}
                            </span>
                          </td>

                          {/* Aplicaciones Fiscales */}
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_f350 ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_f350 ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_f300 ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_f300 ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_exogena ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_exogena ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_ica ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_ica ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className={`text-xs ${cuenta.aplica_dr110 ? 'text-green-600' : 'text-red-600'}`}>
                              {cuenta.aplica_dr110 ? '✓' : '✗'}
                            </span>
                          </td>

                          {/* Códigos Especiales */}
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_niif || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_ti || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_at || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_ct || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.codigo_cc || 'N/A'}</span>
                          </td>

                          {/* Información Adicional */}
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="text-xs max-w-[100px] truncate" title={cuenta.centro_costos}>
                              {cuenta.centro_costos || <span className="text-gray-400">N/A</span>}
                            </div>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="text-xs max-w-[100px] truncate" title={cuenta.dinamica}>
                              {cuenta.dinamica || <span className="text-gray-400">N/A</span>}
                            </div>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <div className="text-xs max-w-[100px] truncate" title={cuenta.observaciones}>
                              {cuenta.observaciones || <span className="text-gray-400">N/A</span>}
                            </div>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">{cuenta.conciliacion_fiscal || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">{cuenta.tipo_om || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs font-mono">{cuenta.id_movimiento || 'N/A'}</span>
                          </td>

                          {/* Metadatos */}
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">{cuenta.usuario_creacion || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">{cuenta.usuario_modificacion || 'N/A'}</span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">
                              {cuenta.fecha_creacion ? new Date(cuenta.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100">
                            <span className="text-xs">
                              {cuenta.fecha_modificacion ? new Date(cuenta.fecha_modificacion).toLocaleDateString('es-ES') : 'N/A'}
                            </span>
                          </td>
                          <td className="py-1 px-1 border-r border-gray-100 text-center">
                            <span className="text-xs">{cuenta.fila_excel || 'N/A'}</span>
                          </td>

                          {/* Acciones */}
                          <td className="py-1 px-1">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => editarCuenta(cuenta)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Editar cuenta"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              <button
                                onClick={() => {
                                  const confirmar = window.confirm(
                                    `¿Estás seguro de que deseas eliminar la cuenta?\n\n` +
                                    `Código: ${cuenta.codigo_completo}\n` +
                                    `Nombre: ${cuenta.nombre}\n\n` +
                                    `Esta acción NO se puede deshacer.`
                                  );
                                  if (confirmar) {
                                    console.log('🗑️ Eliminando cuenta:', cuenta.id, cuenta.codigo_completo);
                                    eliminarCuenta(cuenta.id);
                                  }
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Eliminar cuenta"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Detalles completos de la cuenta:', cuenta);
                                  alert(`Detalles de ${cuenta.codigo_completo}:\n${JSON.stringify(cuenta, null, 2)}`);
                                }}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Ver detalles completos"
                              >
                                <FaQuestion className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Leyenda de colores */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">🎨 Leyenda de colores por sección:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#f8f9fa'}}></div>
                      <span>Identificación</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#e3f2fd'}}></div>
                      <span>Clasificación</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#fff3e0'}}></div>
                      <span>Jerarquía</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#e8f5e8'}}></div>
                      <span>Saldos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#f3e5f5'}}></div>
                      <span>Operativas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#ffeaa7'}}></div>
                      <span>Fiscales</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#fdcb6e'}}></div>
                      <span>Códigos Esp.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#dda0dd'}}></div>
                      <span>Info Adicional</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#fab1a0'}}></div>
                      <span>Metadatos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#74b9ff'}}></div>
                      <span>Acciones</span>
                    </div>
                  </div>
                </div>

                {/* Información detallada sobre todos los campos */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">📋 Descripción completa de todos los campos:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-xs text-blue-700">
                    
                    {/* Identificación */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🆔 Identificación:</h5>
                      <div><strong>ID:</strong> Identificador único interno</div>
                      <div><strong>Código Completo:</strong> Código contable PUC</div>
                      <div><strong>Nombre:</strong> Denominación oficial</div>
                      <div><strong>Descripción:</strong> Detalle adicional</div>
                    </div>

                    {/* Clasificación */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">📊 Clasificación:</h5>
                      <div><strong>Tipo Cuenta:</strong> Nivel jerárquico</div>
                      <div><strong>Naturaleza:</strong> Débito o Crédito</div>
                      <div><strong>Nivel:</strong> Posición en jerarquía</div>
                      <div><strong>Estado:</strong> Activa/Inactiva</div>
                      <div><strong>Tipo Cta:</strong> Tipo específico</div>
                    </div>

                    {/* Jerarquía */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🌳 Jerarquía:</h5>
                      <div><strong>Padre:</strong> Cuenta padre</div>
                      <div><strong>Clase:</strong> Código de clase</div>
                      <div><strong>Grupo:</strong> Código de grupo</div>
                      <div><strong>Cuenta:</strong> Código de cuenta</div>
                      <div><strong>Subcuenta:</strong> Código subcuenta</div>
                      <div><strong>Detalle:</strong> Código detalle</div>
                    </div>

                    {/* Saldos */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">💰 Saldos:</h5>
                      <div><strong>Saldo Inicial:</strong> Inicio período</div>
                      <div><strong>Saldo Final:</strong> Final período</div>
                      <div><strong>Mov. Débito:</strong> Total débitos</div>
                      <div><strong>Mov. Crédito:</strong> Total créditos</div>
                    </div>

                    {/* Operativas */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">⚙️ Configuración:</h5>
                      <div><strong>Acepta Mov:</strong> Permite movimientos</div>
                      <div><strong>Req. Tercero:</strong> Requiere tercero</div>
                      <div><strong>Req. CC:</strong> Requiere centro costo</div>
                      <div><strong>Activo:</strong> Estado activo</div>
                      <div><strong>NIIF:</strong> Es cuenta NIIF</div>
                    </div>

                    {/* Fiscales */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🏛️ Aplicaciones Fiscales:</h5>
                      <div><strong>F350:</strong> Formulario 350</div>
                      <div><strong>F300:</strong> Formulario 300</div>
                      <div><strong>Exógena:</strong> Info exógena</div>
                      <div><strong>ICA:</strong> Impuesto ICA</div>
                      <div><strong>DR110:</strong> Decreto 110</div>
                    </div>

                    {/* Códigos Especiales */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🔢 Códigos Especiales:</h5>
                      <div><strong>Código NIIF:</strong> Homologación NIIF</div>
                      <div><strong>Código TI:</strong> Código tributario</div>
                      <div><strong>Código AT:</strong> Código AT</div>
                      <div><strong>Código CT:</strong> Código CT</div>
                      <div><strong>Código CC:</strong> Centro costos</div>
                    </div>

                    {/* Adicional */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">📝 Información Adicional:</h5>
                      <div><strong>Centro Costos:</strong> Asignación CC</div>
                      <div><strong>Dinámica:</strong> Info dinámica</div>
                      <div><strong>Observaciones:</strong> Notas adicionales</div>
                      <div><strong>Concil. Fiscal:</strong> Conciliación</div>
                      <div><strong>Tipo OM:</strong> Tipo orden</div>
                      <div><strong>ID Movimiento:</strong> ID movimiento</div>
                    </div>

                    {/* Metadatos */}
                    <div className="space-y-1">
                      <h5 className="font-semibold text-blue-900">🕐 Metadatos:</h5>
                      <div><strong>Usuario Creación:</strong> Quién creó</div>
                      <div><strong>Usuario Modif.:</strong> Quién modificó</div>
                      <div><strong>Fecha Creación:</strong> Cuándo se creó</div>
                      <div><strong>Fecha Modif.:</strong> Última modificación</div>
                      <div><strong>Fila Excel:</strong> Fila importación</div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de la vista */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between text-sm">
                    <div className="text-green-800">
                      <strong>📊 Vista completa:</strong> Mostrando {Object.keys(cuentas[0] || {}).length} campos por cuenta
                    </div>
                    <div className="text-green-600">
                      Scroll horizontal para ver todos los campos →
                    </div>
                  </div>
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
        </div>{/* Tabla de cuentas - VERSIÓN COMPLETA CON TODA LA INFORMACIÓN */}
        



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

        {/* ✅ MODAL EXPORTAR - USANDO EL COMPONENTE CORRECTO CON CONSOLE LOG */}
        <ExportPucModal
          visible={showExportModal}
          onCancel={() => {
            console.log('🔍 CERRANDO ExportPucModal - Estado actual:', showExportModal);
            setShowExportModal(false);
          }}
        />

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
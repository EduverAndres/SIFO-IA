// frontend-react/src/pages/PucPage.jsx - VISTA OPTIMIZADA SIN ERRORES
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaUpload, 
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
  FaEye,
  FaMoneyBillWave,
  FaBalanceScale,
  FaBuilding,
  FaClipboardList,
  FaChartLine,
  FaFilter,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import ImportPucExcelModal from '../components/puc/ImportPucExcelModal';
import ExportPucModal from '../components/puc/ExportPucModal';
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Estados de formularios
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    codigo_completo: '',
    descripcion: '', // CORREGIDO: usar descripcion en lugar de nombre
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
  const [vistaExpandida, setVistaExpandida] = useState(false);
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
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ===============================================
  // 📥 FUNCIÓN DE IMPORTACIÓN
  // ===============================================
  const handleImportSuccess = async (result) => {
    try {
      setSuccess(`Importación completada: ${result.resumen.insertadas} insertadas, ${result.resumen.actualizadas} actualizadas`);
      await cargarDatos();
      await cargarEstadisticas();
      setShowImportModal(false);
    } catch (err) {
      console.error('Error al actualizar después de importar:', err);
    }
  };

  // ===============================================
  // 📤 FUNCIONES DE EXPORTACIÓN
  // ===============================================
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
      descripcion: cuenta.descripcion || '', // CORREGIDO: usar descripcion
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
      descripcion: '', // CORREGIDO: usar descripcion
      naturaleza: 'DEBITO',
      tipo_cuenta: 'DETALLE',
      acepta_movimientos: true,
      codigo_padre: ''
    });
  };

  const verDetalleCuenta = (cuenta) => {
    setSelectedAccount(cuenta);
    setShowDetailModal(true);
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

  const obtenerColorNivel = (nivel) => {
    const colores = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-green-100 text-green-800 border-green-200',
      5: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colores[nivel] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const obtenerColorNaturaleza = (naturaleza) => {
    return naturaleza === 'DEBITO' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

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
            
            {/* Estadísticas rápidas mejoradas */}
            {estadisticas && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
                  <FaClipboardList className="text-blue-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Total</span>
                    <span className="font-bold text-blue-600">{estadisticas.total}</span>
                  </div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
                  <FaChartLine className="text-green-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Con Movimientos</span>
                    <span className="font-bold text-green-600">{estadisticas.acepta_movimientos}</span>
                  </div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
                  <FaBuilding className="text-purple-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Clases</span>
                    <span className="font-bold text-purple-600">{estadisticas.por_tipo?.clases || 0}</span>
                  </div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
                  <FaCheckCircle className="text-green-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Activas</span>
                    <span className="font-bold text-green-600">{estadisticas.por_estado?.activas || 0}</span>
                  </div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
                  <FaMoneyBillWave className="text-orange-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Débito</span>
                    <span className="font-bold text-orange-600">{estadisticas.por_naturaleza?.debito || 0}</span>
                  </div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
                  <FaBalanceScale className="text-indigo-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Crédito</span>
                    <span className="font-bold text-indigo-600">{estadisticas.por_naturaleza?.credito || 0}</span>
                  </div>
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

{/* Panel de filtros mejorado - COMPLETO */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
      <FaFilter className="text-blue-600" />
      <span>Filtros de Búsqueda Avanzados</span>
      {Object.values(filtros).some(value => value && value !== '' && value !== 'todos') && (
        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
          Filtros activos
        </span>
      )}
    </h2>
    <div className="flex space-x-2">
      <Button
        onClick={limpiarFiltros}
        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
        icon={FaTimes}
      >
        Limpiar Todos
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
      <Button
        onClick={() => setVistaExpandida(!vistaExpandida)}
        className={`px-3 py-1 text-sm transition-colors ${
          vistaExpandida 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        icon={vistaExpandida ? FaCompress : FaExpand}
      >
        {vistaExpandida ? 'Compacta' : 'Expandida'}
      </Button>
    </div>
  </div>
  
  {/* Sección 1: Filtros Básicos */}
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <FaSearch className="mr-2 text-blue-600" />
      Búsqueda y Básicos
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div className="xl:col-span-2">
        <Input
          label="Buscar"
          placeholder="Código, descripción, centro de costos..."
          value={filtros.busqueda}
          onChange={(e) => setFiltros({...filtros, busqueda: e.target.value, pagina: 1})}
          icon={FaSearch}
        />
      </div>
      
      <Select
        label="Estado"
        value={filtros.estado}
        onChange={(e) => setFiltros({...filtros, estado: e.target.value, pagina: 1})}
        options={[
          { value: '', label: 'Todos los estados' },
          { value: 'ACTIVA', label: 'Activa' },
          { value: 'INACTIVA', label: 'Inactiva' },
          { value: 'BLOQUEADA', label: 'Bloqueada' }
        ]}
      />
      
      <div className="flex items-center space-x-3 pt-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filtros.solo_activos}
            onChange={(e) => setFiltros({...filtros, solo_activos: e.target.checked, pagina: 1})}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Solo activos</span>
        </label>
      </div>
    </div>
  </div>

  {/* Sección 2: Filtros de Jerarquía */}
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <FaTree className="mr-2 text-green-600" />
      Jerarquía PUC
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Select
        label="Tipo de Cuenta"
        value={filtros.tipo}
        onChange={(e) => setFiltros({...filtros, tipo: e.target.value, pagina: 1})}
        options={[
          { value: '', label: 'Todos los tipos' },
          { value: 'CLASE', label: 'Clase (Nivel 1)' },
          { value: 'GRUPO', label: 'Grupo (Nivel 2)' },
          { value: 'CUENTA', label: 'Cuenta (Nivel 3)' },
          { value: 'SUBCUENTA', label: 'Subcuenta (Nivel 4)' },
          { value: 'DETALLE', label: 'Detalle (Nivel 5)' },
          { value: 'AUXILIAR', label: 'Auxiliar' }
        ]}
      />
      
      <Select
        label="Nivel"
        value={filtros.nivel}
        onChange={(e) => setFiltros({...filtros, nivel: e.target.value, pagina: 1})}
        options={[
          { value: '', label: 'Todos los niveles' },
          { value: '1', label: 'Nivel 1 (Clase)' },
          { value: '2', label: 'Nivel 2 (Grupo)' },
          { value: '3', label: 'Nivel 3 (Cuenta)' },
          { value: '4', label: 'Nivel 4 (Subcuenta)' },
          { value: '5', label: 'Nivel 5 (Detalle)' }
        ]}
      />
      
      <Input
        label="Código Clase"
        placeholder="Ej: 1, 2, 3..."
        value={filtros.codigo_clase}
        onChange={(e) => setFiltros({...filtros, codigo_clase: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Código Grupo"
        placeholder="Ej: 11, 21, 31..."
        value={filtros.codigo_grupo}
        onChange={(e) => setFiltros({...filtros, codigo_grupo: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Cuenta Padre"
        placeholder="Código padre..."
        value={filtros.codigo_padre}
        onChange={(e) => setFiltros({...filtros, codigo_padre: e.target.value, pagina: 1})}
      />
      
      <Select
        label="Naturaleza"
        value={filtros.naturaleza}
        onChange={(e) => setFiltros({...filtros, naturaleza: e.target.value, pagina: 1})}
        options={[
          { value: '', label: 'Todas las naturalezas' },
          { value: 'DEBITO', label: 'Débito' },
          { value: 'CREDITO', label: 'Crédito' }
        ]}
      />
    </div>
  </div>

  {/* Sección 3: Filtros de Configuración */}
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <FaBuilding className="mr-2 text-purple-600" />
      Configuración y Operación
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <div className="flex flex-col space-y-3 pt-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filtros.solo_movimiento}
            onChange={(e) => setFiltros({...filtros, solo_movimiento: e.target.checked, pagina: 1})}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Solo con movimientos</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filtros.requiere_tercero}
            onChange={(e) => setFiltros({...filtros, requiere_tercero: e.target.checked, pagina: 1})}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Requiere tercero</span>
        </label>
      </div>
      
      <div className="flex flex-col space-y-3 pt-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filtros.requiere_centro_costo}
            onChange={(e) => setFiltros({...filtros, requiere_centro_costo: e.target.checked, pagina: 1})}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Requiere centro costo</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filtros.es_cuenta_niif}
            onChange={(e) => setFiltros({...filtros, es_cuenta_niif: e.target.checked, pagina: 1})}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Cuenta NIIF</span>
        </label>
      </div>
      
      <Input
        label="Centro de Costos"
        placeholder="Código centro..."
        value={filtros.centro_costos}
        onChange={(e) => setFiltros({...filtros, centro_costos: e.target.value, pagina: 1})}
      />
      
      <Select
        label="Tipo Cta"
        value={filtros.tipo_cta}
        onChange={(e) => setFiltros({...filtros, tipo_cta: e.target.value, pagina: 1})}
        options={[
          { value: '', label: 'Todos' },
          { value: 'D', label: 'D - Detalle' },
          { value: 'G', label: 'G - Grupo' }
        ]}
      />
      
      <Input
        label="Código NIIF"
        placeholder="Código NIIF..."
        value={filtros.codigo_niif}
        onChange={(e) => setFiltros({...filtros, codigo_niif: e.target.value, pagina: 1})}
      />
      
      <Input
        label="ID Movimiento"
        placeholder="ID movimiento..."
        value={filtros.id_movimiento}
        onChange={(e) => setFiltros({...filtros, id_movimiento: e.target.value, pagina: 1})}
      />
    </div>
  </div>

  {/* Sección 4: Filtros Fiscales */}
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <FaClipboardList className="mr-2 text-yellow-600" />
      Información Fiscal
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filtros.aplica_f350}
          onChange={(e) => setFiltros({...filtros, aplica_f350: e.target.checked, pagina: 1})}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">F350</span>
      </label>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filtros.aplica_f300}
          onChange={(e) => setFiltros({...filtros, aplica_f300: e.target.checked, pagina: 1})}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">F300</span>
      </label>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filtros.aplica_exogena}
          onChange={(e) => setFiltros({...filtros, aplica_exogena: e.target.checked, pagina: 1})}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Exógena</span>
      </label>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filtros.aplica_ica}
          onChange={(e) => setFiltros({...filtros, aplica_ica: e.target.checked, pagina: 1})}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">ICA</span>
      </label>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filtros.aplica_dr110}
          onChange={(e) => setFiltros({...filtros, aplica_dr110: e.target.checked, pagina: 1})}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">DR110</span>
      </label>
      
      <Input
        label="Conciliación Fiscal"
        placeholder="Tipo conciliación..."
        value={filtros.conciliacion_fiscal}
        onChange={(e) => setFiltros({...filtros, conciliacion_fiscal: e.target.value, pagina: 1})}
      />
    </div>
  </div>

  {/* Sección 5: Filtros de Códigos Especiales */}
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <FaChartLine className="mr-2 text-indigo-600" />
      Códigos Especiales
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Input
        label="Código AT"
        placeholder="Código AT..."
        value={filtros.codigo_at}
        onChange={(e) => setFiltros({...filtros, codigo_at: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Código CT"
        placeholder="Código CT..."
        value={filtros.codigo_ct}
        onChange={(e) => setFiltros({...filtros, codigo_ct: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Código CC"
        placeholder="Código CC..."
        value={filtros.codigo_cc}
        onChange={(e) => setFiltros({...filtros, codigo_cc: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Código TI"
        placeholder="Código TI..."
        value={filtros.codigo_ti}
        onChange={(e) => setFiltros({...filtros, codigo_ti: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Tipo OM"
        placeholder="Tipo OM..."
        value={filtros.tipo_om}
        onChange={(e) => setFiltros({...filtros, tipo_om: e.target.value, pagina: 1})}
      />
    </div>
  </div>

  {/* Sección 6: Filtros de Saldos y Fechas */}
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <FaMoneyBillWave className="mr-2 text-green-600" />
      Saldos y Fechas
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <Input
        label="Saldo Inicial Min"
        type="number"
        placeholder="0"
        value={filtros.saldo_inicial_min}
        onChange={(e) => setFiltros({...filtros, saldo_inicial_min: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Saldo Inicial Max"
        type="number"
        placeholder="999999999"
        value={filtros.saldo_inicial_max}
        onChange={(e) => setFiltros({...filtros, saldo_inicial_max: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Fecha Creación Desde"
        type="date"
        value={filtros.fecha_creacion_desde}
        onChange={(e) => setFiltros({...filtros, fecha_creacion_desde: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Fecha Creación Hasta"
        type="date"
        value={filtros.fecha_creacion_hasta}
        onChange={(e) => setFiltros({...filtros, fecha_creacion_hasta: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Usuario Creación"
        placeholder="Usuario..."
        value={filtros.usuario_creacion}
        onChange={(e) => setFiltros({...filtros, usuario_creacion: e.target.value, pagina: 1})}
      />
      
      <Input
        label="Fila Excel"
        type="number"
        placeholder="Número fila..."
        value={filtros.fila_excel}
        onChange={(e) => setFiltros({...filtros, fila_excel: e.target.value, pagina: 1})}
      />
    </div>
  </div>

  {/* Sección 7: Configuración de Vista y Paginación */}
  <div className="border-t border-gray-200 pt-4">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <FaEye className="mr-2 text-blue-600" />
      Vista y Paginación
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <Select
        label="Registros por página"
        value={filtros.limite}
        onChange={(e) => setFiltros({...filtros, limite: parseInt(e.target.value), pagina: 1})}
        options={[
          { value: 10, label: '10 registros' },
          { value: 25, label: '25 registros' },
          { value: 50, label: '50 registros' },
          { value: 100, label: '100 registros' },
          { value: 200, label: '200 registros' },
          { value: 500, label: '500 registros' },
          { value: 1000, label: '1000 registros' },
          { value: 5000, label: '5000 registros' },
          { value: 999999, label: 'Todos los registros' }
        ]}
      />
      
      <Select
        label="Ordenar por"
        value={filtros.ordenar_por}
        onChange={(e) => setFiltros({...filtros, ordenar_por: e.target.value, pagina: 1})}
        options={[
          { value: 'codigo_completo', label: 'Código Completo' },
          { value: 'descripcion', label: 'Descripción' },
          { value: 'nivel', label: 'Nivel' },
          { value: 'tipo_cuenta', label: 'Tipo Cuenta' },
          { value: 'naturaleza', label: 'Naturaleza' },
          { value: 'saldo_inicial', label: 'Saldo Inicial' },
          { value: 'saldo_final', label: 'Saldo Final' },
          { value: 'fecha_creacion', label: 'Fecha Creación' },
          { value: 'fecha_modificacion', label: 'Fecha Modificación' }
        ]}
      />
      
      <Select
        label="Orden"
        value={filtros.orden}
        onChange={(e) => setFiltros({...filtros, orden: e.target.value, pagina: 1})}
        options={[
          { value: 'ASC', label: 'Ascendente (A-Z, 0-9)' },
          { value: 'DESC', label: 'Descendente (Z-A, 9-0)' }
        ]}
      />
      
      <div className="flex flex-col space-y-2 pt-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filtros.incluir_inactivos}
            onChange={(e) => setFiltros({...filtros, incluir_inactivos: e.target.checked, pagina: 1})}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Incluir inactivos</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filtros.solo_con_saldos}
            onChange={(e) => setFiltros({...filtros, solo_con_saldos: e.target.checked, pagina: 1})}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Solo con saldos</span>
        </label>
      </div>
      
      <div className="flex flex-col justify-center">
        <Button
          onClick={() => {
            // Aplicar filtros y cargar datos
            cargarDatos();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
          icon={FaSearch}
        >
          Aplicar Filtros
        </Button>
      </div>
      
      <div className="flex flex-col justify-center">
        <Button
          onClick={() => {
            // Exportar con filtros actuales
            setShowExportModal(true);
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm"
          icon={FaDownload}
        >
          Exportar Filtrados
        </Button>
      </div>
    </div>
  </div>

  {/* Resumen de filtros activos */}
  {Object.values(filtros).some(value => value && value !== '' && value !== 'todos') && (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-sm font-medium text-blue-800 mb-2">🔍 Filtros Activos:</h4>
      <div className="flex flex-wrap gap-2">
        {Object.entries(filtros).map(([key, value]) => {
          if (value && value !== '' && value !== 'todos' && key !== 'pagina' && key !== 'limite') {
            return (
              <span key={key} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {key.replace('_', ' ')}: {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                <button
                  onClick={() => setFiltros({...filtros, [key]: key.includes('checkbox') ? false : '', pagina: 1})}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  )}
</div>


{/* Tabla de cuentas con columnas individuales */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200">
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Cuentas del PUC - Vista Detallada por Columnas
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
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {/* Columnas de Identificación */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">ID</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Código Completo</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[250px]">Descripción</th>
                
                {/* Columnas de Jerarquía */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Clase</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Grupo</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">Cuenta</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Subcuenta</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[140px]">Detalle</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Código Padre</th>
                
                {/* Columnas de Clasificación */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">Tipo Cuenta</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[90px]">Naturaleza</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Estado</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[60px]">Nivel</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Tipo Cta</th>
                
                {/* Columnas de Configuración */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Acepta Movimientos</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Req. Tercero</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[140px]">Req. Centro Costo</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">Cuenta NIIF</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Activo</th>
                
                {/* Columnas Financieras */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Saldo Inicial</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Saldo Final</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Mov. Débito</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Mov. Crédito</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[150px]">Centro Costos</th>
                
                {/* Columnas Fiscales */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">F350</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">F300</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[90px]">Exógena</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[70px]">ICA</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">DR110</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[150px]">Conciliación Fiscal</th>
                
                {/* Columnas de Códigos Especiales */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">Código NIIF</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Código AT</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Código CT</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Código CC</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Código TI</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Tipo OM</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">ID Movimiento</th>
                
                {/* Columnas de Auditoría */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Usuario Creación</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[140px]">Fecha Creación</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[140px]">Usuario Modificación</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[150px]">Fecha Modificación</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">Fila Excel</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[200px]">Observaciones</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[200px]">Dinámica</th>
                
                {/* Columna de Acciones */}
                <th className="text-left py-3 px-2 font-medium text-gray-700 min-w-[120px] sticky right-0 bg-gray-50 z-10">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((cuenta, index) => (
                <tr 
                  key={cuenta.id} 
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  {/* Columnas de Identificación */}
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    <span className="font-mono font-bold text-blue-600">#{cuenta.id}</span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{obtenerIconoTipoCuenta(cuenta.tipo_cuenta)}</span>
                      <span className="font-mono font-bold text-gray-900">{cuenta.codigo_completo}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-900 truncate" title={cuenta.descripcion}>
                        {cuenta.descripcion || 'Sin descripción'}
                      </div>
                    </div>
                  </td>
                  
                  {/* Columnas de Jerarquía */}
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_clase && (
                      <span className="px-1 py-0.5 bg-red-100 text-red-700 rounded font-mono text-xs">
                        {cuenta.codigo_clase}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_grupo && (
                      <span className="px-1 py-0.5 bg-orange-100 text-orange-700 rounded font-mono text-xs">
                        {cuenta.codigo_grupo}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_cuenta && (
                      <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded font-mono text-xs">
                        {cuenta.codigo_cuenta}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_subcuenta && (
                      <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded font-mono text-xs">
                        {cuenta.codigo_subcuenta}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_detalle && (
                      <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded font-mono text-xs">
                        {cuenta.codigo_detalle}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_padre && (
                      <span className="font-mono text-gray-600">{cuenta.codigo_padre}</span>
                    )}
                  </td>
                  
                  {/* Columnas de Clasificación */}
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
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
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorNaturaleza(cuenta.naturaleza)}`}>
                      {cuenta.naturaleza}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    <div className="flex items-center space-x-1">
                      <span className={`w-2 h-2 rounded-full ${
                        cuenta.estado === 'ACTIVA' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className={`text-xs ${
                        cuenta.estado === 'ACTIVA' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {cuenta.estado}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorNivel(cuenta.nivel)}`}>
                      {cuenta.nivel}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    <span className="font-mono">{cuenta.tipo_cta}</span>
                  </td>
                  
                  {/* Columnas de Configuración */}
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    <span className={`${cuenta.acepta_movimientos ? 'text-green-600' : 'text-red-600'}`}>
                      {cuenta.acepta_movimientos ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    <span className={`${cuenta.requiere_tercero ? 'text-green-600' : 'text-red-600'}`}>
                      {cuenta.requiere_tercero ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    <span className={`${cuenta.requiere_centro_costo ? 'text-green-600' : 'text-red-600'}`}>
                      {cuenta.requiere_centro_costo ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    <span className={`${cuenta.es_cuenta_niif ? 'text-green-600' : 'text-red-600'}`}>
                      {cuenta.es_cuenta_niif ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    <span className={`${cuenta.activo ? 'text-green-600' : 'text-red-600'}`}>
                      {cuenta.activo ? '✓' : '✗'}
                    </span>
                  </td>
                  
                  {/* Columnas Financieras */}
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-right">
                    <span className="font-mono text-blue-600">
                      {formatearSaldo(cuenta.saldo_inicial)}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-right">
                    <span className={`font-mono ${
                      (cuenta.saldo_final || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatearSaldo(cuenta.saldo_final)}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-right">
                    <span className="font-mono text-red-600">
                      {formatearSaldo(cuenta.movimientos_debito)}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-right">
                    <span className="font-mono text-blue-600">
                      {formatearSaldo(cuenta.movimientos_credito)}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.centro_costos && (
                      <span className="px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {cuenta.centro_costos}
                      </span>
                    )}
                  </td>
                  
                  {/* Columnas Fiscales */}
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    {cuenta.aplica_f350 && <span className="text-yellow-600">✓</span>}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    {cuenta.aplica_f300 && <span className="text-yellow-600">✓</span>}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    {cuenta.aplica_exogena && <span className="text-orange-600">✓</span>}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    {cuenta.aplica_ica && <span className="text-red-600">✓</span>}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-center">
                    {cuenta.aplica_dr110 && <span className="text-purple-600">✓</span>}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.conciliacion_fiscal && (
                      <span className="text-xs text-gray-600 truncate" title={cuenta.conciliacion_fiscal}>
                        {cuenta.conciliacion_fiscal.substring(0, 20)}...
                      </span>
                    )}
                  </td>
                  
                  {/* Columnas de Códigos Especiales */}
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_niif && (
                      <span className="font-mono text-green-600">{cuenta.codigo_niif}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_at && (
                      <span className="font-mono text-gray-600">{cuenta.codigo_at}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_ct && (
                      <span className="font-mono text-gray-600">{cuenta.codigo_ct}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_cc && (
                      <span className="font-mono text-gray-600">{cuenta.codigo_cc}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.codigo_ti && (
                      <span className="font-mono text-gray-600">{cuenta.codigo_ti}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.tipo_om && (
                      <span className="font-mono text-gray-600">{cuenta.tipo_om}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.id_movimiento && (
                      <span className="font-mono text-gray-600">{cuenta.id_movimiento}</span>
                    )}
                  </td>
                  
                  {/* Columnas de Auditoría */}
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.usuario_creacion && (
                      <span className="text-gray-600">{cuenta.usuario_creacion}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.fecha_creacion && (
                      <span className="font-mono text-gray-600">
                        {new Date(cuenta.fecha_creacion).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.usuario_modificacion && (
                      <span className="text-gray-600">{cuenta.usuario_modificacion}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.fecha_modificacion && (
                      <span className="font-mono text-gray-600">
                        {new Date(cuenta.fecha_modificacion).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.fila_excel && (
                      <span className="font-mono text-blue-600">#{cuenta.fila_excel}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.observaciones && (
                      <span className="text-gray-600 truncate" title={cuenta.observaciones}>
                        {cuenta.observaciones.substring(0, 30)}...
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-100 text-xs">
                    {cuenta.dinamica && (
                      <span className="text-gray-600 truncate" title={cuenta.dinamica}>
                        {cuenta.dinamica.substring(0, 30)}...
                      </span>
                    )}
                  </td>
                  
                  {/* Columna de Acciones - Fija */}
                  <td className="py-2 px-2 sticky right-0 bg-white z-10 border-l border-gray-300">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => verDetalleCuenta(cuenta)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      <button
                        onClick={() => editarCuenta(cuenta)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Editar"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          const confirmar = window.confirm(
                            `¿Eliminar cuenta ${cuenta.codigo_completo}?\n${cuenta.descripcion}`
                          );
                          if (confirmar) eliminarCuenta(cuenta.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación Mejorados */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Información de registros */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                Mostrando {((paginacion.paginaActual - 1) * filtros.limite) + 1} - {Math.min(paginacion.paginaActual * filtros.limite, paginacion.total)} de {paginacion.total} resultados
              </span>
              
              {/* Selector de registros por página */}
              <div className="flex items-center space-x-2">
                <span>Mostrar:</span>
                <select 
                  value={filtros.limite} 
                  onChange={(e) => setFiltros({...filtros, limite: parseInt(e.target.value), pagina: 1})}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                  <option value={paginacion.total}>Todos ({paginacion.total})</option>
                </select>
                <span>por página</span>
              </div>
            </div>

            {/* Controles de navegación */}
            {paginacion.totalPaginas > 1 && (
              <div className="flex items-center space-x-2">
                
                {/* Ir a primera página */}
                <Button
                  onClick={() => cambiarPagina(1)}
                  disabled={paginacion.paginaActual === 1}
                  className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                  title="Primera página"
                >
                  ««
                </Button>
                
                {/* Página anterior */}
                <Button
                  onClick={() => cambiarPagina(paginacion.paginaActual - 1)}
                  disabled={paginacion.paginaActual === 1}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  « Anterior
                </Button>

                {/* Input directo de página */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Página</span>
                  <input
                    type="number"
                    min="1"
                    max={paginacion.totalPaginas}
                    value={paginacion.paginaActual}
                    onChange={(e) => {
                      const pagina = parseInt(e.target.value);
                      if (pagina >= 1 && pagina <= paginacion.totalPaginas) {
                        cambiarPagina(pagina);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                  />
                  <span className="text-sm text-gray-600">de {paginacion.totalPaginas}</span>
                </div>

                {/* Páginas numéricas */}
                <div className="hidden md:flex space-x-1">
                  {Array.from({ length: Math.min(7, paginacion.totalPaginas) }, (_, i) => {
                    let page;
                    if (paginacion.totalPaginas <= 7) {
                      page = i + 1;
                    } else if (paginacion.paginaActual <= 4) {
                      page = i + 1;
                    } else if (paginacion.paginaActual >= paginacion.totalPaginas - 3) {
                      page = paginacion.totalPaginas - 6 + i;
                    } else {
                      page = paginacion.paginaActual - 3 + i;
                    }
                    
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
                </div>
                
                {/* Página siguiente */}
                <Button
                  onClick={() => cambiarPagina(paginacion.paginaActual + 1)}
                  disabled={paginacion.paginaActual === paginacion.totalPaginas}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Siguiente »
                </Button>
                
                {/* Ir a última página */}
                <Button
                  onClick={() => cambiarPagina(paginacion.totalPaginas)}
                  disabled={paginacion.paginaActual === paginacion.totalPaginas}
                  className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                  title="Última página"
                >
                  »»
                </Button>
              </div>
            )}
          </div>

          {/* Accesos rápidos */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Accesos rápidos:</span>
              <Button
                onClick={() => setFiltros({...filtros, limite: 50, pagina: 1})}
                className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700"
              >
                Ver 50 primeros
              </Button>
              <Button
                onClick={() => setFiltros({...filtros, limite: paginacion.total, pagina: 1})}
                className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700"
              >
                Ver todos ({paginacion.total})
              </Button>
              <Button
                onClick={() => cambiarPagina(Math.ceil(paginacion.totalPaginas / 2))}
                className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700"
              >
                Ir al medio
              </Button>
              <Button
                onClick={() => cambiarPagina(paginacion.totalPaginas)}
                className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700"
              >
                Ir al final
              </Button>
            </div>
          </div>
        </div>

        {/* Información de columnas mostradas */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">📊 Información completa mostrada (43 columnas):</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-blue-700">
            <div>
              <h5 className="font-semibold mb-1">🆔 Identificación (3):</h5>
              <ul className="space-y-0.5">
                <li>• ID, Código Completo, Descripción</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">🏗️ Jerarquía (6):</h5>
              <ul className="space-y-0.5">
                <li>• Clase, Grupo, Cuenta</li>
                <li>• Subcuenta, Detalle, Código Padre</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">📊 Clasificación (5):</h5>
              <ul className="space-y-0.5">
                <li>• Tipo Cuenta, Naturaleza, Estado</li>
                <li>• Nivel, Tipo Cta</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">⚙️ Configuración (5):</h5>
              <ul className="space-y-0.5">
                <li>• Acepta Movimientos, Req. Tercero</li>
                <li>• Req. Centro Costo, Cuenta NIIF, Activo</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">💰 Financiero (5):</h5>
              <ul className="space-y-0.5">
                <li>• Saldo Inicial, Saldo Final</li>
                <li>• Mov. Débito, Mov. Crédito, Centro Costos</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">🏛️ Fiscal (6):</h5>
              <ul className="space-y-0.5">
                <li>• F350, F300, Exógena, ICA</li>
                <li>• DR110, Conciliación Fiscal</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">🔢 Códigos Especiales (7):</h5>
              <ul className="space-y-0.5">
                <li>• NIIF, AT, CT, CC, TI</li>
                <li>• Tipo OM, ID Movimiento</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">📝 Auditoría y Otros (6):</h5>
              <ul className="space-y-0.5">
                <li>• Usuario/Fecha Creación/Modificación</li>
                <li>• Fila Excel, Observaciones, Dinámica</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
</div>


        {/* Modal Crear/Editar Cuenta - CORREGIDO */}
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
                disabled={editingAccount}
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Descripción *"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción de la cuenta"
                  required
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
        
        {/* Modal Detalle Completo de Cuenta - CORREGIDO */}
        <Modal
          show={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAccount(null);
          }}
          title={`Detalles Completos - ${selectedAccount?.codigo_completo}`}
          maxWidth="4xl"
        >
          {selectedAccount && (
            <div className="space-y-6">
              {/* Header con información principal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{obtenerIconoTipoCuenta(selectedAccount.tipo_cuenta)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedAccount.codigo_completo}</h3>
                      <p className="text-gray-600">{selectedAccount.descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerColorNivel(selectedAccount.nivel)}`}>
                      Nivel {selectedAccount.nivel} - {selectedAccount.tipo_cuenta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid con toda la información */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Identificación y Jerarquía */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaTree className="mr-2 text-green-600" />
                    Jerarquía
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> #{selectedAccount.id}</div>
                    <div><strong>Código Padre:</strong> {selectedAccount.codigo_padre || 'N/A'}</div>
                    <div><strong>Clase:</strong> {selectedAccount.codigo_clase || 'N/A'}</div>
                    <div><strong>Grupo:</strong> {selectedAccount.codigo_grupo || 'N/A'}</div>
                    <div><strong>Cuenta:</strong> {selectedAccount.codigo_cuenta || 'N/A'}</div>
                    <div><strong>Subcuenta:</strong> {selectedAccount.codigo_subcuenta || 'N/A'}</div>
                    <div><strong>Detalle:</strong> {selectedAccount.codigo_detalle || 'N/A'}</div>
                  </div>
                </div>

                {/* Clasificación */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaBalanceScale className="mr-2 text-blue-600" />
                    Clasificación
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Naturaleza:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${obtenerColorNaturaleza(selectedAccount.naturaleza)}`}>
                        {selectedAccount.naturaleza}
                      </span>
                    </div>
                    <div><strong>Estado:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedAccount.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAccount.estado}
                      </span>
                    </div>
                    <div><strong>Tipo Cta:</strong> {selectedAccount.tipo_cta}</div>
                    <div><strong>Acepta Movimientos:</strong> 
                      <span className={`ml-1 ${selectedAccount.acepta_movimientos ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedAccount.acepta_movimientos ? '✓ Sí' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Saldos y Movimientos */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaMoneyBillWave className="mr-2 text-green-600" />
                    Financiero
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Saldo Inicial:</strong> 
                      <span className="ml-1 font-mono">{formatearSaldo(selectedAccount.saldo_inicial)}</span>
                    </div>
                    <div><strong>Saldo Final:</strong> 
                      <span className={`ml-1 font-mono ${
                        (selectedAccount.saldo_final || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatearSaldo(selectedAccount.saldo_final)}
                      </span>
                    </div>
                    <div><strong>Mov. Débito:</strong> 
                      <span className="ml-1 font-mono text-red-600">{formatearSaldo(selectedAccount.movimientos_debito)}</span>
                    </div>
                    <div><strong>Mov. Crédito:</strong> 
                      <span className="ml-1 font-mono text-blue-600">{formatearSaldo(selectedAccount.movimientos_credito)}</span>
                    </div>
                    <div><strong>Centro Costos:</strong> {selectedAccount.centro_costos || 'N/A'}</div>
                  </div>
                </div>

                {/* Configuración */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaBuilding className="mr-2 text-purple-600" />
                    Configuración
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Requiere Tercero:</span>
                      <span className={selectedAccount.requiere_tercero ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.requiere_tercero ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Requiere Centro Costo:</span>
                      <span className={selectedAccount.requiere_centro_costo ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.requiere_centro_costo ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cuenta NIIF:</span>
                      <span className={selectedAccount.es_cuenta_niif ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.es_cuenta_niif ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Activo:</span>
                      <span className={selectedAccount.activo ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.activo ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información Fiscal */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaClipboardList className="mr-2 text-yellow-600" />
                    Información Fiscal
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>F350:</span>
                      <span className={selectedAccount.aplica_f350 ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.aplica_f350 ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>F300:</span>
                      <span className={selectedAccount.aplica_f300 ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.aplica_f300 ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Exógena:</span>
                      <span className={selectedAccount.aplica_exogena ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.aplica_exogena ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ICA:</span>
                      <span className={selectedAccount.aplica_ica ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.aplica_ica ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>DR110:</span>
                      <span className={selectedAccount.aplica_dr110 ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.aplica_dr110 ? '✓' : '✗'}
                      </span>
                    </div>
                    <div><strong>Conciliación Fiscal:</strong> {selectedAccount.conciliacion_fiscal || 'N/A'}</div>
                  </div>
                </div>

                {/* Códigos Especiales */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaChartLine className="mr-2 text-indigo-600" />
                    Códigos Especiales
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Código NIIF:</strong> {selectedAccount.codigo_niif || 'N/A'}</div>
                    <div><strong>Código AT:</strong> {selectedAccount.codigo_at || 'N/A'}</div>
                    <div><strong>Código CT:</strong> {selectedAccount.codigo_ct || 'N/A'}</div>
                    <div><strong>Código CC:</strong> {selectedAccount.codigo_cc || 'N/A'}</div>
                    <div><strong>Código TI:</strong> {selectedAccount.codigo_ti || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              {(selectedAccount.dinamica || selectedAccount.observaciones) && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">📝 Información Adicional</h4>
                  {selectedAccount.dinamica && (
                    <div className="mb-3">
                      <strong className="text-sm">Dinámica:</strong>
                      <p className="text-sm text-gray-600 mt-1">{selectedAccount.dinamica}</p>
                    </div>
                  )}
                  {selectedAccount.observaciones && (
                    <div>
                      <strong className="text-sm">Observaciones:</strong>
                      <p className="text-sm text-gray-600 mt-1">{selectedAccount.observaciones}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Metadatos */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaClipboardList className="mr-2 text-gray-600" />
                  Metadatos del Sistema
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div><strong>Usuario Creación:</strong> {selectedAccount.usuario_creacion || 'N/A'}</div>
                    <div><strong>Fecha Creación:</strong> {
                      selectedAccount.fecha_creacion 
                        ? new Date(selectedAccount.fecha_creacion).toLocaleString('es-ES')
                        : 'N/A'
                    }</div>
                  </div>
                  <div>
                    <div><strong>Usuario Modificación:</strong> {selectedAccount.usuario_modificacion || 'N/A'}</div>
                    <div><strong>Fecha Modificación:</strong> {
                      selectedAccount.fecha_modificacion 
                        ? new Date(selectedAccount.fecha_modificacion).toLocaleString('es-ES')
                        : 'N/A'
                    }</div>
                  </div>
                  {selectedAccount.fila_excel && (
                    <div className="md:col-span-2">
                      <div><strong>Fila Excel:</strong> {selectedAccount.fila_excel}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    editarCuenta(selectedAccount);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  icon={FaEdit}
                >
                  Editar Cuenta
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAccount(null);
                  }}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Importar Excel */}
        <ImportPucExcelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportSuccess}
          loading={loading}
        />

        {/* Modal Exportar */}
        <ExportPucModal
          visible={showExportModal}
          onCancel={() => setShowExportModal(false)}
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
                <h4 className="font-semibold text-gray-800 mb-2">💡 Ayuda - PUC Mejorado</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>🆕 Vista Optimizada:</strong> Información más clara y organizada por secciones.</p>
                  <p><strong>👁️ Ver Detalles:</strong> Click en el ojo para ver toda la información de una cuenta.</p>
                  <p><strong>🔍 Vista Expandida:</strong> Toggle para mostrar información fiscal y códigos especiales.</p>
                  <p><strong>📊 Saldos Visuales:</strong> Saldos y movimientos en tarjetas codificadas por colores.</p>
                  <p><strong>🏗️ Jerarquía Visual:</strong> Códigos de jerarquía con colores por nivel.</p>
                  <p><strong>🎯 Estadísticas:</strong> Dashboard con métricas principales del PUC.</p>
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

      {/* Estilos CSS adicionales */}
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

        /* Scroll personalizado para tablas */
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default PucPage;

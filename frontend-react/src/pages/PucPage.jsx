// frontend-react/src/pages/PucPage.jsx - VERSIÓN CORREGIDA
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaUpload,
  FaFileAlt,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaSave,
  FaSearch,
  FaUsers,
  FaUser,
  FaSitemap,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaRedo, // ✅ CORREGIDO
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaDatabase,
  FaChartBar
} from 'react-icons/fa';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import ImportPucExcelModal from '../components/puc/ImportPucExcelModal';
import ExportPucModal from '../components/puc/ExportPucModal';
import { pucApi } from '../api/pucApi';

const PucPage = () => {
  // Estados principales
  const [cuentas, setCuentas] = useState([]);
  const [cuentasOriginales, setCuentasOriginales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Estados de datos
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Estados de UI
  const [vistaArbol, setVistaArbol] = useState(false);
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState({ campo: 'codigo_completo', direccion: 'asc' });

  // Form data para crear/editar
  const [formData, setFormData] = useState({
    codigo_completo: '',
    descripcion: '',
    naturaleza: 'DEBITO',
    tipo_cuenta: 'DETALLE',
    acepta_movimientos: true,
    codigo_padre: '',
    estado: 'ACTIVA'
  });

  // Filtros mejorados y perfeccionados
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'ACTIVA',
    naturaleza: '',
    tipo_cuenta: '',
    jerarquia: '',
    solo_padres: false,
    solo_hijas: false,
    codigo_padre: '',
    acepta_movimientos: '',
    rango_nivel: { min: '', max: '' },
    fecha_creacion: { desde: '', hasta: '' },
    limite: 50, // Opciones: 10, 25, 50, 100, 'todos'
    pagina: 1,
    incluir_inactivas: false,
    solo_con_movimientos: false,
    clase_contable: ''
  });

  // Estados de paginación
  const [paginacion, setPaginacion] = useState({
    total: 0,
    totalPaginas: 0,
    paginaActual: 1,
    limite: 50
  });

  // ===============================================
  // 🔧 FUNCIONES DE JERARQUÍA MEJORADAS
  // ===============================================

  const esCuentaPadre = useCallback((cuenta, todasLasCuentas) => {
    return todasLasCuentas.some(c => c.codigo_padre === cuenta.codigo_completo);
  }, []);

  const obtenerNivelJerarquia = useCallback((cuenta) => {
    const codigo = cuenta.codigo_completo;
    if (!codigo) return 0;
    
    if (codigo.length === 1) return 1; // Clase
    if (codigo.length === 2) return 2; // Grupo  
    if (codigo.length === 4) return 3; // Cuenta
    if (codigo.length === 6) return 4; // Subcuenta
    if (codigo.length >= 8) return 5; // Detalle
    
    return 0;
  }, []);

  const obtenerIndentacion = useCallback((cuenta) => {
    const nivel = obtenerNivelJerarquia(cuenta);
    return nivel * 20;
  }, [obtenerNivelJerarquia]);

  const obtenerClaseContable = useCallback((codigo) => {
    if (!codigo) return '';
    const clase = codigo.charAt(0);
    const clases = {
      '1': 'ACTIVOS',
      '2': 'PASIVOS',
      '3': 'PATRIMONIO',
      '4': 'INGRESOS',
      '5': 'GASTOS',
      '6': 'COSTOS DE VENTAS',
      '7': 'COSTOS DE PRODUCCIÓN',
      '8': 'CUENTAS DE ORDEN DEUDORAS',
      '9': 'CUENTAS DE ORDEN ACREEDORAS'
    };
    return clases[clase] || `CLASE ${clase}`;
  }, []);

  // ===============================================
  // 🔧 FUNCIONES PRINCIPALES OPTIMIZADAS
  // ===============================================

  const cargarDatos = useCallback(async (nuevaPage = 1) => {
    setLoading(true);
    setLoadingAction('cargando');
    
    try {
      // Construir parámetros de filtro
      const params = {
        ...filtros,
        pagina: nuevaPage,
        // Si limite es 'todos', enviamos un número muy alto
        limite: filtros.limite === 'todos' ? 10000 : filtros.limite
      };

      console.log('📊 Cargando cuentas con parámetros:', params);
      
      const response = await pucApi.obtenerCuentas(params);
      const cuentasData = response.data || [];
      
      setCuentasOriginales(cuentasData);
      setCuentas(aplicarFiltrosLocales(cuentasData));
      
      // Actualizar paginación si viene del backend
      if (response.pagination) {
        setPaginacion({
          total: response.pagination.total,
          totalPaginas: response.pagination.totalPages,
          paginaActual: response.pagination.currentPage,
          limite: response.pagination.limit
        });
      }

      // Cargar estadísticas
      await cargarEstadisticas();
      
    } catch (err) {
      console.error('❌ Error cargando cuentas:', err);
      setError('Error cargando cuentas: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  }, [filtros]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await pucApi.obtenerEstadisticas();
      setEstadisticas(response.data);
    } catch (err) {
      console.warn('⚠️ No se pudieron cargar las estadísticas:', err);
    }
  }, []);

  // Aplicar filtros locales mejorados
  const aplicarFiltrosLocales = useCallback((cuentasRaw) => {
    let cuentasFiltradas = [...cuentasRaw];

    // Filtros de jerarquía
    if (filtros.jerarquia) {
      cuentasFiltradas = cuentasFiltradas.filter(cuenta => {
        const esPadre = esCuentaPadre(cuenta, cuentasRaw);
        const nivel = obtenerNivelJerarquia(cuenta);
        
        switch (filtros.jerarquia) {
          case 'padre': return esPadre;
          case 'hija': return !esPadre;
          case 'nivel1': return nivel === 1;
          case 'nivel2': return nivel === 2;
          case 'nivel3': return nivel === 3;
          case 'nivel4': return nivel === 4;
          case 'nivel5': return nivel >= 5;
          default: return true;
        }
      });
    }

    // Filtros checkbox
    if (filtros.solo_padres) {
      cuentasFiltradas = cuentasFiltradas.filter(cuenta => 
        esCuentaPadre(cuenta, cuentasRaw)
      );
    }
    
    if (filtros.solo_hijas) {
      cuentasFiltradas = cuentasFiltradas.filter(cuenta => 
        !esCuentaPadre(cuenta, cuentasRaw)
      );
    }

    // Filtro por código padre específico
    if (filtros.codigo_padre) {
      cuentasFiltradas = cuentasFiltradas.filter(cuenta => 
        cuenta.codigo_padre === filtros.codigo_padre
      );
    }

    // Filtro por rango de nivel
    if (filtros.rango_nivel.min || filtros.rango_nivel.max) {
      cuentasFiltradas = cuentasFiltradas.filter(cuenta => {
        const nivel = obtenerNivelJerarquia(cuenta);
        const min = filtros.rango_nivel.min ? parseInt(filtros.rango_nivel.min) : 0;
        const max = filtros.rango_nivel.max ? parseInt(filtros.rango_nivel.max) : Infinity;
        return nivel >= min && nivel <= max;
      });
    }

    // Filtro por clase contable
    if (filtros.clase_contable) {
      cuentasFiltradas = cuentasFiltradas.filter(cuenta => 
        cuenta.codigo_completo && cuenta.codigo_completo.startsWith(filtros.clase_contable)
      );
    }

    // Aplicar ordenamiento
    cuentasFiltradas.sort((a, b) => {
      let valorA = a[ordenamiento.campo] || '';
      let valorB = b[ordenamiento.campo] || '';

      // Ordenamiento especial para códigos
      if (ordenamiento.campo === 'codigo_completo') {
        valorA = valorA.padStart(10, '0');
        valorB = valorB.padStart(10, '0');
      }

      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (ordenamiento.direccion === 'asc') {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    return cuentasFiltradas;
  }, [filtros, esCuentaPadre, obtenerNivelJerarquia, ordenamiento]);

  // Memoizar cuentas filtradas para optimización
  const cuentasMemo = useMemo(() => {
    return aplicarFiltrosLocales(cuentasOriginales);
  }, [cuentasOriginales, aplicarFiltrosLocales]);

  // Actualizar cuentas cuando cambien los filtros locales
  useEffect(() => {
    setCuentas(cuentasMemo);
  }, [cuentasMemo]);

  const resetForm = useCallback(() => {
    setFormData({
      codigo_completo: '',
      descripcion: '',
      naturaleza: 'DEBITO',
      tipo_cuenta: 'DETALLE',
      acepta_movimientos: true,
      codigo_padre: '',
      estado: 'ACTIVA'
    });
  }, []);

  // ===============================================
  // 🎯 FUNCIONES CRUD OPTIMIZADAS
  // ===============================================

  const abrirModalCrear = useCallback(() => {
    resetForm();
    setShowCreateModal(true);
  }, [resetForm]);

  const cerrarModalCrear = useCallback(() => {
    setShowCreateModal(false);
    resetForm();
    setError(null);
  }, [resetForm]);

  const crearCuenta = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.codigo_completo?.trim() || !formData.descripcion?.trim()) {
      setError('❌ Por favor complete todos los campos requeridos');
      return;
    }

    setLoadingAction('creando');
    
    try {
      await pucApi.crearCuenta(formData);
      setSuccess('✅ Cuenta creada exitosamente');
      setShowCreateModal(false);
      resetForm();
      cargarDatos(paginacion.paginaActual);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || err.message || 'Error al crear la cuenta'));
    } finally {
      setLoadingAction(null);
    }
  }, [formData, resetForm, cargarDatos, paginacion.paginaActual]);

  const abrirModalEditar = useCallback((cuenta) => {
    setSelectedAccount(cuenta);
    setFormData({
      codigo_completo: cuenta.codigo_completo || '',
      descripcion: cuenta.descripcion || '',
      naturaleza: cuenta.naturaleza || 'DEBITO',
      tipo_cuenta: cuenta.tipo_cuenta || 'DETALLE',
      acepta_movimientos: cuenta.acepta_movimientos !== undefined ? cuenta.acepta_movimientos : true,
      codigo_padre: cuenta.codigo_padre || '',
      estado: cuenta.estado || 'ACTIVA'
    });
    setShowEditModal(true);
  }, []);

  const cerrarModalEditar = useCallback(() => {
    setShowEditModal(false);
    setSelectedAccount(null);
    resetForm();
    setError(null);
  }, [resetForm]);

  const actualizarCuenta = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;
    
    if (!formData.descripcion?.trim()) {
      setError('❌ La descripción es requerida');
      return;
    }

    setLoadingAction('actualizando');
    
    try {
      await pucApi.actualizarCuenta(selectedAccount.id, formData);
      setSuccess('✅ Cuenta actualizada exitosamente');
      setShowEditModal(false);
      setSelectedAccount(null);
      resetForm();
      cargarDatos(paginacion.paginaActual);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || err.message || 'Error al actualizar la cuenta'));
    } finally {
      setLoadingAction(null);
    }
  }, [selectedAccount, formData, resetForm, cargarDatos, paginacion.paginaActual]);

  const abrirModalEliminar = useCallback((cuenta) => {
    setAccountToDelete(cuenta);
    setShowDeleteModal(true);
  }, []);

  const cerrarModalEliminar = useCallback(() => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  }, []);

  const confirmarEliminacion = useCallback(async () => {
    if (!accountToDelete) return;
    
    setLoadingAction('eliminando');
    
    try {
      await pucApi.eliminarCuenta(accountToDelete.id);
      setSuccess('✅ Cuenta eliminada exitosamente');
      setShowDeleteModal(false);
      setAccountToDelete(null);
      cargarDatos(paginacion.paginaActual);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || err.message || 'Error al eliminar la cuenta'));
    } finally {
      setLoadingAction(null);
    }
  }, [accountToDelete, cargarDatos, paginacion.paginaActual]);

  const abrirModalDetalle = useCallback((cuenta) => {
    setSelectedAccount(cuenta);
    setShowDetailModal(true);
  }, []);

  const cerrarModalDetalle = useCallback(() => {
    setShowDetailModal(false);
    setSelectedAccount(null);
  }, []);

  // ===============================================
  // 📊 FUNCIONES DE IMPORTAR/EXPORTAR
  // ===============================================

  const abrirModalImportar = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const cerrarModalImportar = useCallback(() => {
    setShowImportModal(false);
  }, []);

  const abrirModalExportar = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const cerrarModalExportar = useCallback(() => {
    setShowExportModal(false);
  }, []);

  // ===============================================
  // 🔍 FUNCIONES DE FILTROS PERFECCIONADAS
  // ===============================================

  const manejarBusqueda = useCallback((e) => {
    setFiltros(prev => ({
      ...prev,
      busqueda: e.target.value,
      pagina: 1
    }));
  }, []);

  const filtrarPorPadre = useCallback((codigoPadre) => {
    setFiltros(prev => ({
      ...prev,
      busqueda: '',
      codigo_padre: codigoPadre,
      solo_hijas: true,
      solo_padres: false,
      jerarquia: 'hija'
    }));
  }, []);

  const toggleVistaArbol = useCallback(() => {
    setVistaArbol(!vistaArbol);
  }, [vistaArbol]);

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      busqueda: '',
      estado: 'ACTIVA',
      naturaleza: '',
      tipo_cuenta: '',
      jerarquia: '',
      solo_padres: false,
      solo_hijas: false,
      codigo_padre: '',
      acepta_movimientos: '',
      rango_nivel: { min: '', max: '' },
      fecha_creacion: { desde: '', hasta: '' },
      limite: 50,
      pagina: 1,
      incluir_inactivas: false,
      solo_con_movimientos: false,
      clase_contable: ''
    });
    setOrdenamiento({ campo: 'codigo_completo', direccion: 'asc' });
  }, []);

  const cambiarOrdenamiento = useCallback((campo) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const cambiarPagina = useCallback((nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      cargarDatos(nuevaPagina);
    }
  }, [cargarDatos, paginacion.totalPaginas]);

  const cambiarLimite = useCallback((nuevoLimite) => {
    setFiltros(prev => ({
      ...prev,
      limite: nuevoLimite,
      pagina: 1
    }));
  }, []);

  // ===============================================
  // 🎨 FUNCIONES AUXILIARES
  // ===============================================

  const obtenerIconoTipoCuenta = useCallback((tipo) => {
    const iconos = {
      'CLASE': '🏛️',
      'GRUPO': '📁',
      'CUENTA': '📋',
      'SUBCUENTA': '📄',
      'DETALLE': '🔸'
    };
    return iconos[tipo] || '📌';
  }, []);

  const obtenerColorNaturaleza = useCallback((naturaleza) => {
    return naturaleza === 'DEBITO' 
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  }, []);

  const obtenerColorTipoCuenta = useCallback((tipo) => {
    const colores = {
      'CLASE': 'bg-purple-100 text-purple-800',
      'GRUPO': 'bg-blue-100 text-blue-800',
      'CUENTA': 'bg-green-100 text-green-800',
      'SUBCUENTA': 'bg-yellow-100 text-yellow-800',
      'DETALLE': 'bg-orange-100 text-orange-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  }, []);

  const obtenerIconoOrdenamiento = useCallback((campo) => {
    if (ordenamiento.campo !== campo) return <FaSort className="text-gray-400" />;
    return ordenamiento.direccion === 'asc' 
      ? <FaSortUp className="text-blue-600" />
      : <FaSortDown className="text-blue-600" />;
  }, [ordenamiento]);

  // ===============================================
  // ⚡ EFFECTS OPTIMIZADOS
  // ===============================================

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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
  // 🎨 COMPONENTES DE RENDERIZADO
  // ===============================================

  const EstadisticasHeader = () => (
    estadisticas && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Cuentas</p>
              <p className="text-2xl font-bold text-blue-900">{estadisticas.total || 0}</p>
            </div>
            <FaDatabase className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Activas</p>
              <p className="text-2xl font-bold text-green-900">{estadisticas.activas || 0}</p>
            </div>
            <FaCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Cuentas Padre</p>
              <p className="text-2xl font-bold text-purple-900">{estadisticas.padres || 0}</p>
            </div>
            <FaUsers className="text-purple-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Niveles</p>
              <p className="text-2xl font-bold text-orange-900">{estadisticas.niveles || 0}</p>
            </div>
            <FaChartBar className="text-orange-500 text-2xl" />
          </div>
        </div>
      </div>
    )
  );

  const PaginacionControles = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Mostrar:</span>
        <Select
          value={filtros.limite}
          onChange={(e) => cambiarLimite(e.target.value)}
          options={[
            { value: 10, label: '10 registros' },
            { value: 25, label: '25 registros' },
            { value: 50, label: '50 registros' },
            { value: 100, label: '100 registros' },
            { value: 'todos', label: 'Todos los registros' }
          ]}
          className="min-w-32"
        />
      </div>

      {filtros.limite !== 'todos' && paginacion.totalPaginas > 1 && (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => cambiarPagina(paginacion.paginaActual - 1)}
            disabled={paginacion.paginaActual <= 1}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, paginacion.totalPaginas) }, (_, i) => {
              let pageNum;
              if (paginacion.totalPaginas <= 5) {
                pageNum = i + 1;
              } else if (paginacion.paginaActual <= 3) {
                pageNum = i + 1;
              } else if (paginacion.paginaActual >= paginacion.totalPaginas - 2) {
                pageNum = paginacion.totalPaginas - 4 + i;
              } else {
                pageNum = paginacion.paginaActual - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => cambiarPagina(pageNum)}
                  className={`px-3 py-1 text-sm rounded ${
                    pageNum === paginacion.paginaActual
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <Button
            onClick={() => cambiarPagina(paginacion.paginaActual + 1)}
            disabled={paginacion.paginaActual >= paginacion.totalPaginas}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Siguiente
          </Button>
        </div>
      )}

      <div className="text-sm text-gray-600">
        {filtros.limite === 'todos' 
          ? `Total: ${cuentas.length} registros`
          : `Página ${paginacion.paginaActual} de ${paginacion.totalPaginas} (${paginacion.total} total)`
        }
      </div>
    </div>
  );

  // ===============================================
  // 🎨 RENDERIZADO PRINCIPAL
  // ===============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-6">
        
        {/* Header perfeccionado */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Plan Único de Cuentas (PUC)
            </h1>
            <p className="text-gray-600">
              Sistema perfeccionado de gestión contable con filtros avanzados y vista jerárquica
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => cargarDatos(paginacion.paginaActual)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg"
              icon={FaRedo}
              loading={loadingAction === 'cargando'}
            >
              Actualizar
            </Button>
            
            <Button
              onClick={abrirModalCrear}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              icon={FaPlus}
            >
              Nueva Cuenta
            </Button>
            
            <Button
              onClick={abrirModalImportar}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
              icon={FaUpload}
            >
              Importar Excel
            </Button>
            
            <Button
              onClick={abrirModalExportar}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
              icon={FaDownload}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <EstadisticasHeader />

        {/* Filtros perfeccionados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col space-y-4">
            
            {/* Primera fila - Filtros básicos */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="🔍 Buscar por código, descripción o cualquier campo..."
                  value={filtros.busqueda}
                  onChange={manejarBusqueda}
                  icon={FaSearch}
                />
              </div>
              
              <div className="flex gap-3">
                <Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros(prev => ({...prev, estado: e.target.value, pagina: 1}))}
                  options={[
                    { value: '', label: 'Todos los estados' },
                    { value: 'ACTIVA', label: '✅ Activas' },
                    { value: 'INACTIVA', label: '❌ Inactivas' }
                  ]}
                  className="min-w-40"
                />

                <Select
                  value={filtros.clase_contable}
                  onChange={(e) => setFiltros(prev => ({...prev, clase_contable: e.target.value, pagina: 1}))}
                  options={[
                    { value: '', label: 'Todas las clases' },
                    { value: '1', label: '1 - Activos' },
                    { value: '2', label: '2 - Pasivos' },
                    { value: '3', label: '3 - Patrimonio' },
                    { value: '4', label: '4 - Ingresos' },
                    { value: '5', label: '5 - Gastos' },
                    { value: '6', label: '6 - Costos de Ventas' },
                    { value: '7', label: '7 - Costos de Producción' },
                    { value: '8', label: '8 - Cuentas de Orden Deudoras' },
                    { value: '9', label: '9 - Cuentas de Orden Acreedoras' }
                  ]}
                  className="min-w-48"
                />

                <Button
                  onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-2"
                  icon={mostrarFiltrosAvanzados ? FaChevronUp : FaChevronDown}
                >
                  <span>Filtros Avanzados</span>
                </Button>

                <Button
                  onClick={limpiarFiltros}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                  icon={FaTimes}
                >
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Filtros avanzados (collapsible) */}
            {mostrarFiltrosAvanzados && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FaFilter className="mr-2" />
                  Filtros Avanzados
                </h4>
                
                {/* Segunda fila - Filtros de jerarquía */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <Select
                    value={filtros.naturaleza}
                    onChange={(e) => setFiltros(prev => ({...prev, naturaleza: e.target.value, pagina: 1}))}
                    options={[
                      { value: '', label: 'Todas las naturalezas' },
                      { value: 'DEBITO', label: '📈 Débito' },
                      { value: 'CREDITO', label: '📉 Crédito' }
                    ]}
                  />

                  <Select
                    value={filtros.tipo_cuenta}
                    onChange={(e) => setFiltros(prev => ({...prev, tipo_cuenta: e.target.value, pagina: 1}))}
                    options={[
                      { value: '', label: 'Todos los tipos' },
                      { value: 'CLASE', label: '🏛️ Clase' },
                      { value: 'GRUPO', label: '📁 Grupo' },
                      { value: 'CUENTA', label: '📋 Cuenta' },
                      { value: 'SUBCUENTA', label: '📄 Subcuenta' },
                      { value: 'DETALLE', label: '🔸 Detalle' }
                    ]}
                  />

                  <Select
                    value={filtros.jerarquia}
                    onChange={(e) => setFiltros(prev => ({...prev, jerarquia: e.target.value, pagina: 1}))}
                    options={[
                      { value: '', label: 'Todas las jerarquías' },
                      { value: 'padre', label: '👥 Solo Cuentas Padre' },
                      { value: 'hija', label: '👤 Solo Cuentas Hijas' },
                      { value: 'nivel1', label: '1️⃣ Nivel 1 (Clase)' },
                      { value: 'nivel2', label: '2️⃣ Nivel 2 (Grupo)' },
                      { value: 'nivel3', label: '3️⃣ Nivel 3 (Cuenta)' },
                      { value: 'nivel4', label: '4️⃣ Nivel 4 (Subcuenta)' },
                      { value: 'nivel5', label: '5️⃣ Nivel 5+ (Detalle)' }
                    ]}
                  />

                  <Select
                    value={filtros.acepta_movimientos}
                    onChange={(e) => setFiltros(prev => ({...prev, acepta_movimientos: e.target.value, pagina: 1}))}
                    options={[
                      { value: '', label: 'Movimientos: Todas' },
                      { value: 'true', label: '✅ Acepta movimientos' },
                      { value: 'false', label: '❌ No acepta movimientos' }
                    ]}
                  />

                  <Button
                    onClick={toggleVistaArbol}
                    className={`${
                      vistaArbol 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    } text-white flex items-center space-x-2`}
                    icon={FaSitemap}
                  >
                    <span>{vistaArbol ? 'Vista Tabla' : 'Vista Árbol'}</span>
                  </Button>
                </div>

                {/* Tercera fila - Filtros específicos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nivel min"
                      type="number"
                      min="1"
                      max="5"
                      value={filtros.rango_nivel.min}
                      onChange={(e) => setFiltros(prev => ({
                        ...prev, 
                        rango_nivel: { ...prev.rango_nivel, min: e.target.value },
                        pagina: 1
                      }))}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Nivel max"
                      type="number"
                      min="1"
                      max="5"
                      value={filtros.rango_nivel.max}
                      onChange={(e) => setFiltros(prev => ({
                        ...prev, 
                        rango_nivel: { ...prev.rango_nivel, max: e.target.value },
                        pagina: 1
                      }))}
                      className="flex-1"
                    />
                  </div>

                  <Input
                    placeholder="Código padre específico"
                    value={filtros.codigo_padre}
                    onChange={(e) => setFiltros(prev => ({...prev, codigo_padre: e.target.value, pagina: 1}))}
                  />

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filtros.solo_padres}
                        onChange={(e) => setFiltros(prev => ({
                          ...prev, 
                          solo_padres: e.target.checked,
                          solo_hijas: e.target.checked ? false : prev.solo_hijas,
                          pagina: 1
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Solo Padres</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filtros.solo_hijas}
                        onChange={(e) => setFiltros(prev => ({
                          ...prev, 
                          solo_hijas: e.target.checked,
                          solo_padres: e.target.checked ? false : prev.solo_padres,
                          pagina: 1
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Solo Hijas</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filtros.incluir_inactivas}
                        onChange={(e) => setFiltros(prev => ({
                          ...prev, 
                          incluir_inactivas: e.target.checked,
                          estado: e.target.checked ? '' : 'ACTIVA',
                          pagina: 1
                        }))}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Incluir inactivas</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filtros.solo_con_movimientos}
                        onChange={(e) => setFiltros(prev => ({
                          ...prev, 
                          solo_con_movimientos: e.target.checked,
                          pagina: 1
                        }))}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Solo con movimientos</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <FaCheckCircle className="text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Éxito</p>
              <p className="text-green-600 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Tabla perfeccionada con jerarquía visual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Cuentas del PUC</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {loading ? 'Cargando...' : `${cuentas.length} cuentas mostradas`}
                </span>
                {/* Indicadores de jerarquía */}
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-200 rounded"></div>
                    <span>Padre</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-200 rounded"></div>
                    <span>Hija</span>
                  </div>
                </div>
              </div>
            </div>

            {loading && loadingAction === 'cargando' ? (
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
                <p className="text-gray-400 text-sm">
                  {filtros.busqueda || Object.values(filtros).some(v => v && v !== 'ACTIVA' && v !== 50 && v !== 1)
                    ? 'Intenta ajustar los filtros o crear una nueva cuenta'
                    : 'Haz clic en "Nueva Cuenta" para crear la primera'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => cambiarOrdenamiento('codigo_completo')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Código</span>
                          <span className="text-xs text-gray-500">(Jerarquía)</span>
                          {obtenerIconoOrdenamiento('codigo_completo')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => cambiarOrdenamiento('descripcion')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Descripción</span>
                          {obtenerIconoOrdenamiento('descripcion')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => cambiarOrdenamiento('tipo_cuenta')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Tipo</span>
                          {obtenerIconoOrdenamiento('tipo_cuenta')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => cambiarOrdenamiento('naturaleza')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Naturaleza</span>
                          {obtenerIconoOrdenamiento('naturaleza')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => cambiarOrdenamiento('estado')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Estado</span>
                          {obtenerIconoOrdenamiento('estado')}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Jerarquía</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentas.map((cuenta, index) => {
                      const esPadre = esCuentaPadre(cuenta, cuentasOriginales);
                      const nivel = obtenerNivelJerarquia(cuenta);
                      const indentacion = obtenerIndentacion(cuenta);
                      const cuentasHijas = cuentasOriginales.filter(c => c.codigo_padre === cuenta.codigo_completo);
                      const claseContable = obtenerClaseContable(cuenta.codigo_completo);
                      
                      return (
                        <tr 
                          key={cuenta.id} 
                          className={`
                            border-b border-gray-100 hover:bg-blue-50 transition-all duration-200
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            ${esPadre ? 'border-l-4 border-l-purple-400' : 'border-l-4 border-l-blue-200'}
                          `}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2" style={{ paddingLeft: `${indentacion}px` }}>
                              {/* Indicador visual de jerarquía */}
                              {nivel > 1 && (
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: nivel - 1 }).map((_, i) => (
                                    <div key={i} className="w-px h-4 bg-gray-300"></div>
                                  ))}
                                  <div className="w-3 h-px bg-gray-300"></div>
                                </div>
                              )}
                              
                              {/* Icono de tipo de cuenta */}
                              <span className="text-lg">{obtenerIconoTipoCuenta(cuenta.tipo_cuenta)}</span>
                              
                              {/* Indicador padre/hija */}
                              {esPadre ? (
                                <div className="w-2 h-2 bg-purple-500 rounded-full" title="Cuenta Padre"></div>
                              ) : (
                                <div className="w-2 h-2 bg-blue-400 rounded-full" title="Cuenta Hija"></div>
                              )}
                              
                              {/* Código de la cuenta */}
                              <div className="flex flex-col">
                                <span className={`font-mono font-bold ${
                                  esPadre ? 'text-purple-900' : 'text-gray-900'
                                }`}>
                                  {cuenta.codigo_completo}
                                </span>
                                <span className="text-xs text-gray-500">{claseContable}</span>
                              </div>
                              
                              {/* Badge de nivel */}
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                esPadre 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                N{nivel}
                              </span>
                            </div>
                          </td>
                          
                          <td className="py-3 px-4">
                            <div className={`font-medium ${
                              esPadre ? 'text-purple-900 font-semibold' : 'text-gray-900'
                            }`}>
                              {cuenta.descripcion || 'Sin descripción'}
                            </div>
                            {/* Mostrar código padre si existe */}
                            {cuenta.codigo_padre && (
                              <div className="text-xs text-gray-500 mt-1">
                                Padre: {cuenta.codigo_padre}
                              </div>
                            )}
                            {/* Mostrar si acepta movimientos */}
                            {cuenta.acepta_movimientos !== undefined && (
                              <div className={`text-xs mt-1 ${
                                cuenta.acepta_movimientos ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {cuenta.acepta_movimientos ? '✓ Acepta mov.' : '✗ No acepta mov.'}
                              </div>
                            )}
                          </td>
                          
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorTipoCuenta(cuenta.tipo_cuenta)}`}>
                              {cuenta.tipo_cuenta}
                            </span>
                          </td>
                          
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorNaturaleza(cuenta.naturaleza)}`}>
                              {cuenta.naturaleza}
                            </span>
                          </td>
                          
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              cuenta.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {cuenta.estado}
                            </span>
                          </td>
                          
                          {/* Columna de jerarquía mejorada */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-center space-y-1">
                              {esPadre ? (
                                <>
                                  <span className="text-xs font-medium text-purple-700">PADRE</span>
                                  <div className="flex items-center space-x-1">
                                    <FaUsers className="text-purple-500 text-xs" />
                                    <span className="text-xs text-gray-500">
                                      {cuentasHijas.length} hija{cuentasHijas.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs font-medium text-blue-700">HIJA</span>
                                  <div className="flex items-center space-x-1">
                                    <FaUser className="text-blue-500 text-xs" />
                                    <span className="text-xs text-gray-500">Nivel {nivel}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => abrirModalDetalle(cuenta)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Ver detalles"
                                disabled={loadingAction}
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => abrirModalEditar(cuenta)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Editar"
                                disabled={loadingAction}
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => abrirModalEliminar(cuenta)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Eliminar"
                                disabled={loadingAction}
                              >
                                <FaTrash />
                              </button>
                              
                              {/* Botón especial para cuentas padre */}
                              {esPadre && cuentasHijas.length > 0 && (
                                <button
                                  onClick={() => filtrarPorPadre(cuenta.codigo_completo)}
                                  className="p-2 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                                  title={`Ver ${cuentasHijas.length} cuentas hijas`}
                                  disabled={loadingAction}
                                >
                                  <FaUsers />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Controles de paginación */}
            <PaginacionControles />
          </div>
        </div>

        {/* Indicador de carga global */}
        {loadingAction && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <FaSpinner className="animate-spin" />
            <span>
              {loadingAction === 'creando' && 'Creando cuenta...'}
              {loadingAction === 'actualizando' && 'Actualizando cuenta...'}
              {loadingAction === 'eliminando' && 'Eliminando cuenta...'}
              {loadingAction === 'cargando' && 'Cargando datos...'}
            </span>
          </div>
        )}
      </div>

      {/* =============================================== */}
      {/* 🔥 MODALES CRUD COMPLETOS */}
      {/* =============================================== */}

      {/* Modal Crear Cuenta */}
      <Modal
        show={showCreateModal}
        onClose={cerrarModalCrear}
        title={
          <div className="flex items-center space-x-2">
            <span className="text-2xl">➕</span>
            <span>Nueva Cuenta</span>
          </div>
        }
        maxWidth="3xl"
      >
        <form onSubmit={crearCuenta} className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código Completo *"
                placeholder="Ej: 1105001"
                value={formData.codigo_completo}
                onChange={(e) => setFormData({...formData, codigo_completo: e.target.value})}
                required
                disabled={loadingAction === 'creando'}
              />
              
              <Select
                label="Tipo de Cuenta *"
                value={formData.tipo_cuenta}
                onChange={(e) => setFormData({...formData, tipo_cuenta: e.target.value})}
                options={[
                  { value: 'CLASE', label: '🏛️ Clase' },
                  { value: 'GRUPO', label: '📁 Grupo' },
                  { value: 'CUENTA', label: '📋 Cuenta' },
                  { value: 'SUBCUENTA', label: '📄 Subcuenta' },
                  { value: 'DETALLE', label: '🔸 Detalle' }
                ]}
                required
                disabled={loadingAction === 'creando'}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Descripción *"
                placeholder="Descripción detallada de la cuenta"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
                disabled={loadingAction === 'creando'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select
                label="Naturaleza *"
                value={formData.naturaleza}
                onChange={(e) => setFormData({...formData, naturaleza: e.target.value})}
                options={[
                  { value: 'DEBITO', label: '📈 Débito' },
                  { value: 'CREDITO', label: '📉 Crédito' }
                ]}
                required
                disabled={loadingAction === 'creando'}
              />

              <Input
                label="Código Padre"
                placeholder="Código cuenta padre (opcional)"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
                disabled={loadingAction === 'creando'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select
                label="Estado *"
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                options={[
                  { value: 'ACTIVA', label: '✅ Activa' },
                  { value: 'INACTIVA', label: '❌ Inactiva' }
                ]}
                required
                disabled={loadingAction === 'creando'}
              />

              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="acepta_movimientos_crear"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loadingAction === 'creando'}
                />
                <label htmlFor="acepta_movimientos_crear" className="text-sm text-gray-700">
                  Acepta movimientos contables
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={cerrarModalCrear}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white"
              disabled={loadingAction === 'creando'}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
              loading={loadingAction === 'creando'}
              icon={FaPlus}
            >
              Crear Cuenta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Cuenta */}
      <Modal
        show={showEditModal}
        onClose={cerrarModalEditar}
        title={
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✏️</span>
            <span>Editar Cuenta - {selectedAccount?.codigo_completo}</span>
          </div>
        }
        maxWidth="3xl"
      >
        <form onSubmit={actualizarCuenta} className="space-y-6">
          <div className="bg-amber-50 p-6 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-4 flex items-center">
              <span className="mr-2">✏️</span>
              Modificar Información
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código Completo (No editable)"
                value={formData.codigo_completo}
                disabled
                className="bg-gray-100"
              />
              
              <Select
                label="Tipo de Cuenta *"
                value={formData.tipo_cuenta}
                onChange={(e) => setFormData({...formData, tipo_cuenta: e.target.value})}
                options={[
                  { value: 'CLASE', label: '🏛️ Clase' },
                  { value: 'GRUPO', label: '📁 Grupo' },
                  { value: 'CUENTA', label: '📋 Cuenta' },
                  { value: 'SUBCUENTA', label: '📄 Subcuenta' },
                  { value: 'DETALLE', label: '🔸 Detalle' }
                ]}
                required
                disabled={loadingAction === 'actualizando'}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Descripción *"
                placeholder="Descripción detallada de la cuenta"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
                disabled={loadingAction === 'actualizando'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select
                label="Naturaleza *"
                value={formData.naturaleza}
                onChange={(e) => setFormData({...formData, naturaleza: e.target.value})}
                options={[
                  { value: 'DEBITO', label: '📈 Débito' },
                  { value: 'CREDITO', label: '📉 Crédito' }
                ]}
                required
                disabled={loadingAction === 'actualizando'}
              />

              <Input
                label="Código Padre"
                placeholder="Código cuenta padre (opcional)"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
                disabled={loadingAction === 'actualizando'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select
                label="Estado *"
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                options={[
                  { value: 'ACTIVA', label: '✅ Activa' },
                  { value: 'INACTIVA', label: '❌ Inactiva' }
                ]}
                required
                disabled={loadingAction === 'actualizando'}
              />

              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="acepta_movimientos_editar"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loadingAction === 'actualizando'}
                />
                <label htmlFor="acepta_movimientos_editar" className="text-sm text-gray-700">
                  Acepta movimientos contables
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={cerrarModalEditar}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white"
              disabled={loadingAction === 'actualizando'}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              loading={loadingAction === 'actualizando'}
              icon={FaSave}
            >
              Actualizar Cuenta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar Cuenta */}
      <Modal
        show={showDeleteModal}
        onClose={cerrarModalEliminar}
        title={
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🗑️</span>
            <span>Confirmar Eliminación</span>
          </div>
        }
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
              <h3 className="text-lg font-semibold text-red-800">
                ¿Estás seguro de eliminar esta cuenta?
              </h3>
            </div>
            
            {accountToDelete && (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Código:</strong> {accountToDelete.codigo_completo}
                </p>
                <p className="text-gray-700">
                  <strong>Descripción:</strong> {accountToDelete.descripcion}
                </p>
                <p className="text-gray-700">
                  <strong>Tipo:</strong> {accountToDelete.tipo_cuenta}
                </p>
                <p className="text-gray-700">
                  <strong>Clase:</strong> {obtenerClaseContable(accountToDelete.codigo_completo)}
                </p>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-red-100 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>⚠️ Advertencia:</strong> Esta acción eliminará físicamente la cuenta del sistema. 
                Solo procede si estás completamente seguro.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={cerrarModalEliminar}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white"
              disabled={loadingAction === 'eliminando'}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={confirmarEliminacion}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
              loading={loadingAction === 'eliminando'}
              icon={FaTrash}
            >
              Sí, Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        show={showDetailModal}
        onClose={cerrarModalDetalle}
        title={
          <div className="flex items-center space-x-2">
            <span className="text-2xl">👁️</span>
            <span>Detalles de la Cuenta</span>
          </div>
        }
        maxWidth="2xl"
      >
        {selectedAccount && (
          <div className="space-y-6">
            {/* Header de la cuenta */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{obtenerIconoTipoCuenta(selectedAccount.tipo_cuenta)}</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedAccount.codigo_completo}</h3>
                  <p className="text-gray-600 text-lg">{selectedAccount.descripcion}</p>
                  <p className="text-purple-600 text-sm font-medium">
                    {obtenerClaseContable(selectedAccount.codigo_completo)}
                  </p>
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
                      <span className="font-mono">{selectedAccount.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo de Cuenta:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorTipoCuenta(selectedAccount.tipo_cuenta)}`}>
                        {selectedAccount.tipo_cuenta}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Naturaleza:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorNaturaleza(selectedAccount.naturaleza)}`}>
                        {selectedAccount.naturaleza}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedAccount.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAccount.estado}
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
                        {selectedAccount.codigo_padre || 'Sin padre'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Acepta Movimientos:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedAccount.acepta_movimientos 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAccount.acepta_movimientos ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nivel:</span>
                      <span className="font-medium">
                        {obtenerNivelJerarquia(selectedAccount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Es Padre:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        esCuentaPadre(selectedAccount, cuentasOriginales)
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {esCuentaPadre(selectedAccount, cuentasOriginales) ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas de auditoría */}
            {(selectedAccount.fecha_creacion || selectedAccount.fecha_modificacion || selectedAccount.created_at || selectedAccount.updated_at) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">📅 Información de Auditoría</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {(selectedAccount.fecha_creacion || selectedAccount.created_at) && (
                    <div>
                      <span className="text-gray-600">Fecha de Creación:</span>
                      <p className="font-medium">
                        {new Date(selectedAccount.fecha_creacion || selectedAccount.created_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {(selectedAccount.fecha_modificacion || selectedAccount.updated_at) && (
                    <div>
                      <span className="text-gray-600">Última Modificación:</span>
                      <p className="font-medium">
                        {new Date(selectedAccount.fecha_modificacion || selectedAccount.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mostrar cuentas hijas si es padre */}
            {esCuentaPadre(selectedAccount, cuentasOriginales) && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <FaUsers className="mr-2" />
                  Cuentas Hijas ({cuentasOriginales.filter(c => c.codigo_padre === selectedAccount.codigo_completo).length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {cuentasOriginales
                    .filter(c => c.codigo_padre === selectedAccount.codigo_completo)
                    .map(hija => (
                      <div key={hija.id} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                        <span className="font-mono">{hija.codigo_completo}</span>
                        <span className="text-gray-600 flex-1 px-2">{hija.descripcion}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          hija.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {hija.estado}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  cerrarModalDetalle();
                  abrirModalEditar(selectedAccount);
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                icon={FaEdit}
              >
                Editar
              </Button>
              
              {esCuentaPadre(selectedAccount, cuentasOriginales) && (
                <Button
                  onClick={() => {
                    cerrarModalDetalle();
                    filtrarPorPadre(selectedAccount.codigo_completo);
                  }}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                  icon={FaUsers}
                >
                  Ver Hijas
                </Button>
              )}
              
              <Button
                onClick={cerrarModalDetalle}
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
        onClose={cerrarModalImportar}
        onImport={(result) => {
          setSuccess(`✅ Importación completada: ${result.resumen?.insertadas || 0} cuentas insertadas`);
          cargarDatos(paginacion.paginaActual);
          cerrarModalImportar();
        }}
        loading={loadingAction === 'importando'}
      />

      {/* Modal Exportar */}
      <ExportPucModal
        visible={showExportModal}
        onCancel={cerrarModalExportar}
      />
    </div>
  );
};

export default PucPage;

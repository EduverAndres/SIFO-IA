// frontend-react/src/pages/PucPage.jsx - VERSIÓN FINAL COMPLETA CON JERARQUÍA
import React, { useState, useEffect, useCallback } from 'react';
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
  FaSitemap
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
  const [cuentasOriginales, setCuentasOriginales] = useState([]); // Para filtros locales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  // Estado para vista de árbol
  const [vistaArbol, setVistaArbol] = useState(false);

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

  // Filtros actualizados con jerarquía
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'ACTIVA',
    naturaleza: '',
    tipo_cuenta: '',
    jerarquia: '',
    solo_padres: false,
    solo_hijas: false,
    codigo_padre: '',
    limite: 50,
    pagina: 1
  });

  // ===============================================
  // 🔧 FUNCIONES DE JERARQUÍA
  // ===============================================

  // Función para determinar si una cuenta es padre
  const esCuentaPadre = (cuenta, todasLasCuentas) => {
    return todasLasCuentas.some(c => c.codigo_padre === cuenta.codigo_completo);
  };

  // Función para determinar el nivel de jerarquía
  const obtenerNivelJerarquia = (cuenta) => {
    const codigo = cuenta.codigo_completo;
    if (!codigo) return 0;
    
    // Basado en la longitud del código (estándar PUC Colombia)
    if (codigo.length === 1) return 1; // Clase
    if (codigo.length === 2) return 2; // Grupo  
    if (codigo.length === 4) return 3; // Cuenta
    if (codigo.length === 6) return 4; // Subcuenta
    if (codigo.length >= 8) return 5; // Detalle
    
    return 0;
  };

  // Función para obtener indentación visual
  const obtenerIndentacion = (cuenta) => {
    const nivel = obtenerNivelJerarquia(cuenta);
    return nivel * 20; // 20px por cada nivel
  };

  // ===============================================
  // 🔧 FUNCIONES PRINCIPALES
  // ===============================================

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pucApi.obtenerCuentas(filtros);
      const cuentasData = response.data || [];
      setCuentasOriginales(cuentasData);
      setCuentas(aplicarFiltrosLocales(cuentasData));
    } catch (err) {
      setError('Error cargando cuentas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Aplicar filtros locales (jerarquía)
  const aplicarFiltrosLocales = useCallback((cuentasRaw) => {
    return cuentasRaw.filter(cuenta => {
      const esPadre = esCuentaPadre(cuenta, cuentasRaw);
      const nivel = obtenerNivelJerarquia(cuenta);
      
      // Filtro por jerarquía
      if (filtros.jerarquia) {
        switch (filtros.jerarquia) {
          case 'padre':
            if (!esPadre) return false;
            break;
          case 'hija':
            if (esPadre) return false;
            break;
          case 'nivel1':
            if (nivel !== 1) return false;
            break;
          case 'nivel2':
            if (nivel !== 2) return false;
            break;
          case 'nivel3':
            if (nivel !== 3) return false;
            break;
          case 'nivel4':
            if (nivel !== 4) return false;
            break;
          case 'nivel5':
            if (nivel < 5) return false;
            break;
        }
      }
      
      // Filtros de checkbox
      if (filtros.solo_padres && !esPadre) return false;
      if (filtros.solo_hijas && esPadre) return false;
      
      // Filtro por código padre específico
      if (filtros.codigo_padre && cuenta.codigo_padre !== filtros.codigo_padre) return false;
      
      return true;
    });
  }, [filtros]);

  // Actualizar filtros y aplicar
  useEffect(() => {
    if (cuentasOriginales.length > 0) {
      setCuentas(aplicarFiltrosLocales(cuentasOriginales));
    }
  }, [cuentasOriginales, aplicarFiltrosLocales]);

  // Reset form
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

  // ===============================================
  // 🎯 FUNCIONES PARA CREAR CUENTA
  // ===============================================

  const abrirModalCrear = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const cerrarModalCrear = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const crearCuenta = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.codigo_completo || !formData.descripcion) {
        setError('Por favor complete todos los campos requeridos');
        return;
      }

      await pucApi.crearCuenta(formData);
      setSuccess('Cuenta creada exitosamente');
      setShowCreateModal(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // ===============================================
  // ✏️ FUNCIONES PARA EDITAR CUENTA
  // ===============================================

  const abrirModalEditar = (cuenta) => {
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
  };

  const cerrarModalEditar = () => {
    setShowEditModal(false);
    setSelectedAccount(null);
    resetForm();
  };

  const actualizarCuenta = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;
    
    setLoading(true);
    
    try {
      if (!formData.codigo_completo || !formData.descripcion) {
        setError('Por favor complete todos los campos requeridos');
        return;
      }

      await pucApi.actualizarCuenta(selectedAccount.id, formData);
      setSuccess('Cuenta actualizada exitosamente');
      setShowEditModal(false);
      setSelectedAccount(null);
      resetForm();
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al actualizar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // ===============================================
  // 🗑️ FUNCIONES PARA ELIMINAR CUENTA
  // ===============================================

  const abrirModalEliminar = (cuenta) => {
    setAccountToDelete(cuenta);
    setShowDeleteModal(true);
  };

  const cerrarModalEliminar = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  const confirmarEliminacion = async () => {
    if (!accountToDelete) return;
    
    setLoading(true);
    try {
      await pucApi.eliminarCuenta(accountToDelete.id);
      setSuccess('Cuenta eliminada exitosamente');
      setShowDeleteModal(false);
      setAccountToDelete(null);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al eliminar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // ===============================================
  // 👁️ FUNCIONES PARA VER DETALLE
  // ===============================================

  const abrirModalDetalle = (cuenta) => {
    setSelectedAccount(cuenta);
    setShowDetailModal(true);
  };

  const cerrarModalDetalle = () => {
    setShowDetailModal(false);
    setSelectedAccount(null);
  };

  // ===============================================
  // 📊 FUNCIONES PARA IMPORTAR/EXPORTAR
  // ===============================================

  const abrirModalImportar = () => {
    setShowImportModal(true);
  };

  const cerrarModalImportar = () => {
    setShowImportModal(false);
  };

  const abrirModalExportar = () => {
    setShowExportModal(true);
  };

  const cerrarModalExportar = () => {
    setShowExportModal(false);
  };

  // ===============================================
  // 🔍 FUNCIONES DE FILTROS
  // ===============================================

  const manejarBusqueda = (e) => {
    setFiltros(prev => ({
      ...prev,
      busqueda: e.target.value,
      pagina: 1
    }));
  };

  // Función para filtrar por cuenta padre
  const filtrarPorPadre = (codigoPadre) => {
    setFiltros(prev => ({
      ...prev,
      busqueda: '',
      codigo_padre: codigoPadre,
      solo_hijas: true,
      solo_padres: false,
      jerarquia: 'hija'
    }));
  };

  // Función para toggle vista árbol
  const toggleVistaArbol = () => {
    setVistaArbol(!vistaArbol);
  };

  // Función para limpiar filtros actualizada
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: 'ACTIVA',
      naturaleza: '',
      tipo_cuenta: '',
      jerarquia: '',
      solo_padres: false,
      solo_hijas: false,
      codigo_padre: '',
      limite: 50,
      pagina: 1
    });
  };

  // ===============================================
  // 🎨 FUNCIONES AUXILIARES
  // ===============================================

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

  // ===============================================
  // ⚡ EFFECTS
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
  // 🎨 RENDERIZADO
  // ===============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Plan Único de Cuentas (PUC)
            </h1>
            <p className="text-gray-600">
              Gestiona la estructura contable con importación/exportación Excel y vista jerárquica
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
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

        {/* Filtros con opciones de jerarquía */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col space-y-4">
            
            {/* Primera fila de filtros básicos */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por código o descripción..."
                  value={filtros.busqueda}
                  onChange={manejarBusqueda}
                  icon={FaSearch}
                />
              </div>
              
              <div className="flex gap-3">
                <Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros(prev => ({...prev, estado: e.target.value}))}
                  options={[
                    { value: '', label: 'Todos los estados' },
                    { value: 'ACTIVA', label: 'Activas' },
                    { value: 'INACTIVA', label: 'Inactivas' }
                  ]}
                  className="min-w-40"
                />

                <Select
                  value={filtros.naturaleza}
                  onChange={(e) => setFiltros(prev => ({...prev, naturaleza: e.target.value}))}
                  options={[
                    { value: '', label: 'Todas las naturalezas' },
                    { value: 'DEBITO', label: 'Débito' },
                    { value: 'CREDITO', label: 'Crédito' }
                  ]}
                  className="min-w-40"
                />

                <Button
                  onClick={limpiarFiltros}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Segunda fila - Filtros de jerarquía */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FaSitemap className="mr-2" />
                Filtros de Jerarquía
              </h4>
              
              <div className="flex flex-wrap gap-3">
                {/* Filtro por tipo de jerarquía */}
                <Select
                  value={filtros.jerarquia}
                  onChange={(e) => setFiltros(prev => ({...prev, jerarquia: e.target.value}))}
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
                  className="min-w-48"
                />

                {/* Filtro por tipo de cuenta */}
                <Select
                  value={filtros.tipo_cuenta}
                  onChange={(e) => setFiltros(prev => ({...prev, tipo_cuenta: e.target.value}))}
                  options={[
                    { value: '', label: 'Todos los tipos' },
                    { value: 'CLASE', label: '🏛️ Clase' },
                    { value: 'GRUPO', label: '📁 Grupo' },
                    { value: 'CUENTA', label: '📋 Cuenta' },
                    { value: 'SUBCUENTA', label: '📄 Subcuenta' },
                    { value: 'DETALLE', label: '🔸 Detalle' }
                  ]}
                  className="min-w-40"
                />

                {/* Checkboxes para filtros rápidos */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filtros.solo_padres}
                      onChange={(e) => setFiltros(prev => ({
                        ...prev, 
                        solo_padres: e.target.checked,
                        solo_hijas: e.target.checked ? false : prev.solo_hijas
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
                        solo_padres: e.target.checked ? false : prev.solo_padres
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Solo Hijas</span>
                  </label>
                </div>

                {/* Botón para mostrar árbol jerárquico */}
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
            </div>
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

        {/* Tabla de cuentas con jerarquía visual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Cuentas del PUC</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{cuentas.length} cuentas</span>
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
                <p className="text-gray-400 text-sm">Haz clic en "Nueva Cuenta" para crear la primera</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        <div className="flex items-center space-x-2">
                          <span>Código</span>
                          <span className="text-xs text-gray-500">(Jerarquía)</span>
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Descripción</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Naturaleza</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
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
                      
                      return (
                        <tr 
                          key={cuenta.id} 
                          className={`
                            border-b border-gray-100 hover:bg-blue-50 transition-colors
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
                              <span className={`font-mono font-bold ${
                                esPadre ? 'text-purple-900' : 'text-gray-900'
                              }`}>
                                {cuenta.codigo_completo}
                              </span>
                              
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
                          
                          {/* Nueva columna de jerarquía */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-center space-y-1">
                              {esPadre ? (
                                <>
                                  <span className="text-xs font-medium text-purple-700">PADRE</span>
                                  <div className="flex items-center space-x-1">
                                    <FaUsers className="text-purple-500 text-xs" />
                                    <span className="text-xs text-gray-500">
                                      {cuentasHijas.length} hijas
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
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => abrirModalEditar(cuenta)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Editar"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => abrirModalEliminar(cuenta)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Eliminar"
                              >
                                <FaTrash />
                              </button>
                              
                              {/* Botón especial para cuentas padre */}
                              {esPadre && cuentasHijas.length > 0 && (
                                <button
                                  onClick={() => filtrarPorPadre(cuenta.codigo_completo)}
                                  className="p-2 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                                  title={`Ver ${cuentasHijas.length} cuentas hijas`}
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
          </div>
        </div>
      </div>

      {/* =============================================== */}
      {/* 🔥 MODALES CRUD COMPLETOS */}
      {/* =============================================== */}

      {/* 1️⃣ Modal Crear Cuenta */}
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
              />
            </div>

            <div className="mt-4">
              <Input
                label="Descripción *"
                placeholder="Descripción detallada de la cuenta"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
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
              />

              <Input
                label="Código Padre"
                placeholder="Código cuenta padre"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
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
              />

              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="acepta_movimientos_crear"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
              loading={loading}
              icon={FaPlus}
            >
              Crear Cuenta
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2️⃣ Modal Editar Cuenta */}
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
              />
            </div>

            <div className="mt-4">
              <Input
                label="Descripción *"
                placeholder="Descripción detallada de la cuenta"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
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
              />

              <Input
                label="Código Padre"
                placeholder="Código cuenta padre"
                value={formData.codigo_padre}
                onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
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
              />

              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="acepta_movimientos_editar"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              loading={loading}
              icon={FaSave}
            >
              Actualizar Cuenta
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3️⃣ Modal Eliminar Cuenta */}
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
            >
              Cancelar
            </Button>
            
            <Button
              onClick={confirmarEliminacion}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
              loading={loading}
              icon={FaTrash}
            >
              Sí, Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4️⃣ Modal Ver Detalle */}
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
                        <span className="text-gray-600">{hija.descripcion}</span>
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

      {/* 5️⃣ Modal Importar Excel */}
      <ImportPucExcelModal
        isOpen={showImportModal}
        onClose={cerrarModalImportar}
        onImport={(result) => {
          setSuccess(`Importación completada: ${result.resumen?.insertadas || 0} cuentas insertadas`);
          cargarDatos();
          cerrarModalImportar();
        }}
        loading={loading}
      />

      {/* 6️⃣ Modal Exportar */}
      <ExportPucModal
        visible={showExportModal}
        onCancel={cerrarModalExportar}
      />
    </div>
  );
};

export default PucPage;

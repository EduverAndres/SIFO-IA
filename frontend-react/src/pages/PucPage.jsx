// frontend-react/src/pages/PucPage.jsx - VISTA OPTIMIZADA CON JERARQUÍA INTELIGENTE
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
  FaCompress,
  FaSortAmountDown,
  FaLayerGroup,
  FaInfoCircle
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
    descripcion: '',
    naturaleza: 'DEBITO',
    tipo_cuenta: 'DETALLE',
    acepta_movimientos: true,
    codigo_padre: ''
  });

  // Estados de filtros y vista - MEJORADO CON ORDENAMIENTO POR DEFECTO
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'ACTIVA',
    tipo: '',
    naturaleza: '',
    codigo_padre: '',
    limite: 50,
    pagina: 1,
    ordenar_por: 'codigo_completo', // ✅ ORDENAMIENTO POR DEFECTO
    orden: 'ASC' // ✅ ASCENDENTE POR DEFECTO PARA MANTENER JERARQUÍA
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
  // 🧮 FUNCIONES UTILITARIAS PARA JERARQUÍA PUC
  // ===============================================
  
  /**
   * Determina el tipo de cuenta basado en la longitud del código
   */
  const determinarTipoPorCodigo = (codigo) => {
    if (!codigo) return '';
    const longitud = codigo.length;
    switch(longitud) {
      case 1: return 'CLASE';
      case 2: return 'GRUPO'; 
      case 4: return 'CUENTA';
      case 6: return 'SUBCUENTA';
      default: return longitud > 6 ? 'DETALLE' : '';
    }
  };

  /**
   * Determina el nivel jerárquico basado en la longitud del código
   */
  const determinarNivelPorCodigo = (codigo) => {
    if (!codigo) return 0;
    const longitud = codigo.length;
    if (longitud === 1) return 1; // Clase
    if (longitud === 2) return 2; // Grupo
    if (longitud === 4) return 3; // Cuenta
    if (longitud === 6) return 4; // Subcuenta
    if (longitud >= 7) return 5; // Detalle
    return 0;
  };

  /**
   * Determina la naturaleza automáticamente por clase
   */
  const determinarNaturalezaPorClase = (codigo) => {
    if (!codigo) return 'DEBITO';
    const clase = codigo.charAt(0);
    return ['1', '5', '6', '7', '8'].includes(clase) ? 'DEBITO' : 'CREDITO';
  };

  /**
   * Valida que el código cumpla con las reglas jerárquicas
   */
  const validarCodigoJerarquia = (codigo, tipo, codigoPadre = '') => {
    const errores = [];
    
    if (!codigo) {
      errores.push('El código es requerido');
      return { valido: false, errores };
    }

    // Validar que solo contenga números
    if (!/^\d+$/.test(codigo)) {
      errores.push('El código debe contener solo números');
    }

    // Validar longitud según tipo
    const longitudEsperada = {
      'CLASE': 1,
      'GRUPO': 2,
      'CUENTA': 4,
      'SUBCUENTA': 6,
      'DETALLE': 7 // mínimo para detalle
    };

    const longitud = codigo.length;
    const longitudRequerida = longitudEsperada[tipo];

    if (tipo !== 'DETALLE' && longitud !== longitudRequerida) {
      errores.push(`${tipo} debe tener exactamente ${longitudRequerida} dígito(s). Actual: ${longitud}`);
    } else if (tipo === 'DETALLE' && longitud < longitudRequerida) {
      errores.push(`${tipo} debe tener al menos ${longitudRequerida} dígitos. Actual: ${longitud}`);
    }

    // Validar jerarquía con código padre
    if (codigoPadre) {
      if (!codigo.startsWith(codigoPadre)) {
        errores.push(`El código debe comenzar con el código padre: ${codigoPadre}`);
      }
      
      if (codigo.length <= codigoPadre.length) {
        errores.push(`El código hijo debe ser más largo que el código padre`);
      }
    } else if (tipo !== 'CLASE') {
      errores.push(`${tipo} requiere un código padre`);
    }

    return {
      valido: errores.length === 0,
      errores
    };
  };

  /**
   * Encuentra el código padre sugerido para un código dado
   */
  const sugerirCodigoPadre = (codigo) => {
    if (!codigo || codigo.length <= 1) return '';
    
    const longitud = codigo.length;
    if (longitud === 2) return codigo.charAt(0); // Grupo -> Clase
    if (longitud === 4) return codigo.substring(0, 2); // Cuenta -> Grupo
    if (longitud === 6) return codigo.substring(0, 4); // Subcuenta -> Cuenta
    if (longitud > 6) return codigo.substring(0, 6); // Detalle -> Subcuenta
    
    return '';
  };

  /**
   * Extrae los códigos jerárquicos de un código completo
   */
  const extraerCodigosJerarquia = (codigo) => {
    if (!codigo) return {};
    
    return {
      codigo_clase: codigo.length >= 1 ? codigo.substring(0, 1) : '',
      codigo_grupo: codigo.length >= 2 ? codigo.substring(0, 2) : '',
      codigo_cuenta: codigo.length >= 4 ? codigo.substring(0, 4) : '',
      codigo_subcuenta: codigo.length >= 6 ? codigo.substring(0, 6) : '',
      codigo_detalle: codigo.length > 6 ? codigo : ''
    };
  };

  // ===============================================
  // 🔄 EFECTOS Y CARGA INICIAL
  // ===============================================
  
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pucApi.obtenerCuentas(filtros);
      let cuentasData = response.data || [];
      
      // ✅ PROCESAR DATOS PARA ENRIQUECER CON INFORMACIÓN JERÁRQUICA
      cuentasData = cuentasData.map(cuenta => ({
        ...cuenta,
        ...extraerCodigosJerarquia(cuenta.codigo_completo),
        nivel_calculado: determinarNivelPorCodigo(cuenta.codigo_completo),
        tipo_sugerido: determinarTipoPorCodigo(cuenta.codigo_completo),
        naturaleza_sugerida: determinarNaturalezaPorClase(cuenta.codigo_completo)
      }));

      setCuentas(cuentasData);
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
  // 📝 FUNCIONES CRUD MEJORADAS
  // ===============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ VALIDAR JERARQUÍA ANTES DE ENVIAR
      const validacion = validarCodigoJerarquia(
        formData.codigo_completo, 
        formData.tipo_cuenta, 
        formData.codigo_padre
      );

      if (!validacion.valido) {
        setError(`Errores de validación:\n${validacion.errores.join('\n')}`);
        setLoading(false);
        return;
      }

      // ✅ ENRIQUECER DATOS CON INFORMACIÓN CALCULADA
      const datosEnriquecidos = {
        ...formData,
        nivel: determinarNivelPorCodigo(formData.codigo_completo),
        naturaleza: formData.naturaleza || determinarNaturalezaPorClase(formData.codigo_completo),
        ...extraerCodigosJerarquia(formData.codigo_completo)
      };
      
      if (editingAccount) {
        await pucApi.actualizarCuenta(editingAccount.id, datosEnriquecidos);
        setSuccess('Cuenta actualizada exitosamente');
      } else {
        await pucApi.crearCuenta(datosEnriquecidos);
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
      descripcion: '',
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
  // 🔧 FUNCIONES AUXILIARES MEJORADAS
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
      pagina: 1,
      ordenar_por: 'codigo_completo', // ✅ MANTENER ORDENAMIENTO JERÁRQUICO
      orden: 'ASC'
    });
  };

  // ✅ FILTRO INTELIGENTE POR TIPO CON VALIDACIÓN DE DÍGITOS
  const aplicarFiltroInteligentePorTipo = (tipoSeleccionado) => {
    const filtrosActualizados = { ...filtros, tipo: tipoSeleccionado, pagina: 1 };
    
    // Limpiar filtros específicos anteriores
    delete filtrosActualizados.codigo_clase;
    delete filtrosActualizados.codigo_grupo;
    delete filtrosActualizados.nivel;
    
    // Aplicar filtro específico por longitud de código
    switch(tipoSeleccionado) {
      case 'CLASE':
        filtrosActualizados.longitud_codigo = 1;
        filtrosActualizados.nivel = 1;
        break;
      case 'GRUPO':
        filtrosActualizados.longitud_codigo = 2;
        filtrosActualizados.nivel = 2;
        break;
      case 'CUENTA':
        filtrosActualizados.longitud_codigo = 4;
        filtrosActualizados.nivel = 3;
        break;
      case 'SUBCUENTA':
        filtrosActualizados.longitud_codigo = 6;
        filtrosActualizados.nivel = 4;
        break;
      case 'DETALLE':
        filtrosActualizados.longitud_codigo_min = 7;
        filtrosActualizados.nivel = 5;
        break;
    }
    
    setFiltros(filtrosActualizados);
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

  // ✅ FUNCIÓN PARA RENDERIZAR VISTA JERÁRQUICA
  const renderizarVistaArbol = (cuentas) => {
    return cuentas.map((cuenta, index) => {
      const nivel = cuenta.nivel_calculado || cuenta.nivel || 1;
      const indentacion = '  '.repeat(nivel - 1);
      
      return (
        <tr 
          key={cuenta.id} 
          className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
            index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
          }`}
        >
          {/* Columna jerárquica con indentación */}
          <td className="py-3 px-4 border-r border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-mono">{indentacion}</span>
              <span className="text-lg">{obtenerIconoTipoCuenta(cuenta.tipo_cuenta)}</span>
              <div>
                <div className="font-mono font-bold text-gray-900">{cuenta.codigo_completo}</div>
                <div className="text-sm text-gray-600 truncate max-w-xs" title={cuenta.descripcion}>
                  {cuenta.descripcion || 'Sin descripción'}
                </div>
              </div>
            </div>
          </td>
          
          {/* Información de clasificación */}
          <td className="py-3 px-4 border-r border-gray-100">
            <div className="space-y-1">
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
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorNivel(nivel)}`}>
                  Nivel {nivel}
                </span>
              </div>
            </div>
          </td>
          
          {/* Naturaleza y estado */}
          <td className="py-3 px-4 border-r border-gray-100">
            <div className="space-y-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorNaturaleza(cuenta.naturaleza)}`}>
                {cuenta.naturaleza}
              </span>
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
            </div>
          </td>
          
          {/* Saldos */}
          <td className="py-3 px-4 border-r border-gray-100 text-right">
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-500">Inicial:</span>
                <span className="ml-1 font-mono text-blue-600">
                  {formatearSaldo(cuenta.saldo_inicial)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Final:</span>
                <span className={`ml-1 font-mono ${
                  (cuenta.saldo_final || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatearSaldo(cuenta.saldo_final)}
                </span>
              </div>
            </div>
          </td>
          
          {/* Configuración */}
          <td className="py-3 px-4 border-r border-gray-100 text-center">
            <div className="space-y-1">
              <div>
                <span className={`text-xs ${cuenta.acepta_movimientos ? 'text-green-600' : 'text-red-600'}`}>
                  {cuenta.acepta_movimientos ? '✓ Mov' : '✗ Mov'}
                </span>
              </div>
              <div>
                <span className={`text-xs ${cuenta.requiere_tercero ? 'text-green-600' : 'text-red-600'}`}>
                  {cuenta.requiere_tercero ? '✓ Ter' : '✗ Ter'}
                </span>
              </div>
            </div>
          </td>
          
          {/* Acciones */}
          <td className="py-3 px-4">
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
      );
    });
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
              Gestión inteligente con jerarquía automática y validaciones PUC estándar colombiano
            </p>
            
            {/* ✅ ESTADÍSTICAS MEJORADAS CON INFORMACIÓN JERÁRQUICA */}
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
                  <FaLayerGroup className="text-purple-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Clases</span>
                    <span className="font-bold text-purple-600">{estadisticas.por_tipo?.clases || 0}</span>
                  </div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
                  <FaBuilding className="text-orange-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Grupos</span>
                    <span className="font-bold text-orange-600">{estadisticas.por_tipo?.grupos || 0}</span>
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
                  <FaMoneyBillWave className="text-red-600" />
                  <div>
                    <span className="text-xs text-gray-600 block">Débito</span>
                    <span className="font-bold text-red-600">{estadisticas.por_naturaleza?.debito || 0}</span>
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
              <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
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

        {/* ✅ PANEL DE FILTROS MEJORADO CON JERARQUÍA INTELIGENTE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <FaFilter className="text-blue-600" />
              <span>Filtros Inteligentes PUC</span>
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
                {vistaArbol ? 'Vista Árbol' : 'Vista Lista'}
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
          
          {/* ✅ SECCIÓN 1: FILTROS BÁSICOS Y JERARQUÍA INTELIGENTE */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <FaSearch className="mr-2 text-blue-600" />
              Búsqueda y Jerarquía PUC
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="xl:col-span-2">
                <Input
                  label="Buscar"
                  placeholder="Código, descripción..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({...filtros, busqueda: e.target.value, pagina: 1})}
                  icon={FaSearch}
                />
              </div>
              
              {/* ✅ FILTRO INTELIGENTE POR TIPO */}
              <Select
                label="Tipo de Cuenta (Inteligente)"
                value={filtros.tipo}
                onChange={(e) => aplicarFiltroInteligentePorTipo(e.target.value)}
                options={[
                  { value: '', label: 'Todos los tipos' },
                  { value: 'CLASE', label: '🏛️ Clase (1 dígito)' },
                  { value: 'GRUPO', label: '📁 Grupo (2 dígitos)' },
                  { value: 'CUENTA', label: '📋 Cuenta (4 dígitos)' },
                  { value: 'SUBCUENTA', label: '📄 Subcuenta (6 dígitos)' },
                  { value: 'DETALLE', label: '🔸 Detalle (7+ dígitos)' }
                ]}
              />
              
              <Select
                label="Nivel Jerárquico"
                value={filtros.nivel}
                onChange={(e) => setFiltros({...filtros, nivel: e.target.value, pagina: 1})}
                options={[
                  { value: '', label: 'Todos los niveles' },
                  { value: '1', label: 'Nivel 1 - Clase' },
                  { value: '2', label: 'Nivel 2 - Grupo' },
                  { value: '3', label: 'Nivel 3 - Cuenta' },
                  { value: '4', label: 'Nivel 4 - Subcuenta' },
                  { value: '5', label: 'Nivel 5 - Detalle' }
                ]}
              />
              
              <Select
                label="Naturaleza"
                value={filtros.naturaleza}
                onChange={(e) => setFiltros({...filtros, naturaleza: e.target.value, pagina: 1})}
                options={[
                  { value: '', label: 'Todas las naturalezas' },
                  { value: 'DEBITO', label: 'Débito (1,5,6,7,8)' },
                  { value: 'CREDITO', label: 'Crédito (2,3,4,9)' }
                ]}
              />
              
              <Select
                label="Estado"
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value, pagina: 1})}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'ACTIVA', label: 'Activa' },
                  { value: 'INACTIVA', label: 'Inactiva' }
                ]}
              />
              
              <Input
                label="Cuenta Padre"
                placeholder="Código padre..."
                value={filtros.codigo_padre}
                onChange={(e) => setFiltros({...filtros, codigo_padre: e.target.value, pagina: 1})}
              />
            </div>
          </div>

          {/* ✅ FILTROS RÁPIDOS POR CLASE */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <FaLayerGroup className="mr-2 text-purple-600" />
              Filtros Rápidos por Clase PUC
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {[
                { codigo: '1', nombre: 'ACTIVOS', color: 'bg-green-100 text-green-800' },
                { codigo: '2', nombre: 'PASIVOS', color: 'bg-red-100 text-red-800' },
                { codigo: '3', nombre: 'PATRIMONIO', color: 'bg-blue-100 text-blue-800' },
                { codigo: '4', nombre: 'INGRESOS', color: 'bg-purple-100 text-purple-800' },
                { codigo: '5', nombre: 'GASTOS', color: 'bg-orange-100 text-orange-800' },
                { codigo: '6', nombre: 'COSTOS', color: 'bg-yellow-100 text-yellow-800' },
                { codigo: '7', nombre: 'COSTOS PROD.', color: 'bg-indigo-100 text-indigo-800' },
                { codigo: '8', nombre: 'CTA ORD. DEUD.', color: 'bg-pink-100 text-pink-800' },
                { codigo: '9', nombre: 'CTA ORD. ACRE.', color: 'bg-teal-100 text-teal-800' }
              ].map(clase => (
                <button
                  key={clase.codigo}
                  onClick={() => setFiltros({...filtros, codigo_clase: clase.codigo, pagina: 1})}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-80 ${
                    filtros.codigo_clase === clase.codigo 
                      ? clase.color + ' ring-2 ring-offset-1 ring-blue-500' 
                      : clase.color
                  }`}
                  title={`Filtrar por ${clase.nombre}`}
                >
                  {clase.codigo} - {clase.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Configuración de Vista y Ordenamiento */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <FaSortAmountDown className="mr-2 text-blue-600" />
              Configuración de Vista
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <Select
                label="Registros por página"
                value={filtros.limite}
                onChange={(e) => setFiltros({...filtros, limite: parseInt(e.target.value), pagina: 1})}
                options={[
                  { value: 25, label: '25 registros' },
                  { value: 50, label: '50 registros' },
                  { value: 100, label: '100 registros' },
                  { value: 200, label: '200 registros' },
                  { value: 500, label: '500 registros' },
                  { value: 999999, label: 'Todos los registros' }
                ]}
              />
              
              <Select
                label="Ordenar por"
                value={filtros.ordenar_por}
                onChange={(e) => setFiltros({...filtros, ordenar_por: e.target.value, pagina: 1})}
                options={[
                  { value: 'codigo_completo', label: '🏗️ Código (Jerárquico)' },
                  { value: 'descripcion', label: 'Descripción' },
                  { value: 'nivel', label: 'Nivel' },
                  { value: 'tipo_cuenta', label: 'Tipo Cuenta' },
                  { value: 'saldo_inicial', label: 'Saldo Inicial' },
                  { value: 'fecha_creacion', label: 'Fecha Creación' }
                ]}
              />
              
              <Select
                label="Orden"
                value={filtros.orden}
                onChange={(e) => setFiltros({...filtros, orden: e.target.value, pagina: 1})}
                options={[
                  { value: 'ASC', label: '↑ Ascendente (recomendado)' },
                  { value: 'DESC', label: '↓ Descendente' }
                ]}
              />
              
              <div className="flex flex-col space-y-2 pt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filtros.solo_movimiento}
                    onChange={(e) => setFiltros({...filtros, solo_movimiento: e.target.checked, pagina: 1})}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Solo con movimientos</span>
                </label>
              </div>
              
              <div className="flex flex-col justify-center">
                <Button
                  onClick={() => cargarDatos()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  icon={FaSearch}
                >
                  Aplicar Filtros
                </Button>
              </div>
              
              <div className="flex flex-col justify-center">
                <Button
                  onClick={() => setShowExportModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm"
                  icon={FaDownload}
                >
                  Exportar Filtrados
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ TABLA MEJORADA CON VISTA JERÁRQUICA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                {vistaArbol ? <FaTree className="text-green-600" /> : <FaList className="text-blue-600" />}
                <span>
                  {vistaArbol ? 'Vista Árbol Jerárquico' : 'Vista Lista Detallada'} - Cuentas PUC
                </span>
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
                        {vistaArbol ? (
                          // ✅ CABECERAS PARA VISTA ÁRBOL
                          <>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 min-w-[400px]">
                              Estructura Jerárquica
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 min-w-[150px]">
                              Clasificación
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                              Naturaleza/Estado
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 min-w-[150px]">
                              Saldos
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">
                              Config
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[120px]">
                              Acciones
                            </th>
                          </>
                        ) : (
                          // ✅ CABECERAS PARA VISTA LISTA (ORIGINAL)
                          <>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">ID</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Código</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[250px]">Descripción</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">Tipo</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[90px]">Naturaleza</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[60px]">Nivel</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Saldo Final</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Estado</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700 min-w-[120px]">Acciones</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {vistaArbol ? (
                        // ✅ RENDERIZAR VISTA ÁRBOL
                        renderizarVistaArbol(cuentas)
                      ) : (
                        // ✅ RENDERIZAR VISTA LISTA
                        cuentas.map((cuenta, index) => (
                          <tr 
                            key={cuenta.id} 
                            className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                            }`}
                          >
                            <td className="py-2 px-2 border-r border-gray-100 text-xs">
                              <span className="font-mono font-bold text-blue-600">#{cuenta.id}</span>
                            </td>
                            <td className="py-2 px-2 border-r border-gray-100 text-xs">
                              <div className="flex items-center space-x-1">
                                <span className="text-sm">{obtenerIconoTipoCuenta(cuenta.tipo_cuenta)}</span>
                                <span className="font-mono font-bold text-gray-900">{cuenta.codigo_completo}</span>
                                {/* ✅ INDICADOR DE JERARQUÍA */}
                                <span className={`px-1 py-0.5 rounded text-xs ${obtenerColorNivel(cuenta.nivel_calculado || cuenta.nivel)}`}>
                                  N{cuenta.nivel_calculado || cuenta.nivel}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-2 border-r border-gray-100 text-xs">
                              <div className="max-w-xs">
                                <div className="font-medium text-gray-900 truncate" title={cuenta.descripcion}>
                                  {cuenta.descripcion || 'Sin descripción'}
                                </div>
                                {/* ✅ MOSTRAR CÓDIGO PADRE SI EXISTE */}
                                {cuenta.codigo_padre && (
                                  <div className="text-xs text-gray-500">
                                    Padre: {cuenta.codigo_padre}
                                  </div>
                                )}
                              </div>
                            </td>
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorNivel(cuenta.nivel_calculado || cuenta.nivel)}`}>
                                {cuenta.nivel_calculado || cuenta.nivel}
                              </span>
                            </td>
                            <td className="py-2 px-2 border-r border-gray-100 text-xs text-right">
                              <span className={`font-mono ${
                                (cuenta.saldo_final || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatearSaldo(cuenta.saldo_final)}
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
                            <td className="py-2 px-2">
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Controles de Paginación */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    
                    {/* Información de registros */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        Mostrando {((paginacion.paginaActual - 1) * filtros.limite) + 1} - {Math.min(paginacion.paginaActual * filtros.limite, paginacion.total)} de {paginacion.total} resultados
                      </span>
                      
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
                          <option value={paginacion.total}>Todos ({paginacion.total})</option>
                        </select>
                        <span>por página</span>
                      </div>
                    </div>

                    {/* Controles de navegación */}
                    {paginacion.totalPaginas > 1 && (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => cambiarPagina(1)}
                          disabled={paginacion.paginaActual === 1}
                          className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          ««
                        </Button>
                        
                        <Button
                          onClick={() => cambiarPagina(paginacion.paginaActual - 1)}
                          disabled={paginacion.paginaActual === 1}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          « Anterior
                        </Button>

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

                        <Button
                          onClick={() => cambiarPagina(paginacion.paginaActual + 1)}
                          disabled={paginacion.paginaActual === paginacion.totalPaginas}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Siguiente »
                        </Button>
                        
                        <Button
                          onClick={() => cambiarPagina(paginacion.totalPaginas)}
                          disabled={paginacion.paginaActual === paginacion.totalPaginas}
                          className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          »»
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ✅ MODAL CREAR/EDITAR CUENTA MEJORADO CON VALIDACIONES */}
        <Modal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingAccount ? 'Editar Cuenta PUC' : 'Nueva Cuenta PUC'}
          maxWidth="3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ✅ INFORMACIÓN JERÁRQUICA EN TIEMPO REAL */}
            {formData.codigo_completo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <FaInfoCircle className="mr-2" />
                  Análisis Jerárquico Automático
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Tipo sugerido:</span>
                    <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${
                      determinarTipoPorCodigo(formData.codigo_completo) === 'CLASE' ? 'bg-purple-100 text-purple-800' :
                      determinarTipoPorCodigo(formData.codigo_completo) === 'GRUPO' ? 'bg-blue-100 text-blue-800' :
                      determinarTipoPorCodigo(formData.codigo_completo) === 'CUENTA' ? 'bg-green-100 text-green-800' :
                      determinarTipoPorCodigo(formData.codigo_completo) === 'SUBCUENTA' ? 'bg-yellow-100 text-yellow-800' :
                      determinarTipoPorCodigo(formData.codigo_completo) === 'DETALLE' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {determinarTipoPorCodigo(formData.codigo_completo) || 'INDEFINIDO'}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Nivel:</span>
                    <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${obtenerColorNivel(determinarNivelPorCodigo(formData.codigo_completo))}`}>
                      Nivel {determinarNivelPorCodigo(formData.codigo_completo)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Naturaleza sugerida:</span>
                    <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${obtenerColorNaturaleza(determinarNaturalezaPorClase(formData.codigo_completo))}`}>
                      {determinarNaturalezaPorClase(formData.codigo_completo)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Padre sugerido:</span>
                    <div className="mt-1 font-mono text-xs text-gray-700">
                      {sugerirCodigoPadre(formData.codigo_completo) || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ✅ CÓDIGO CON AUTOCOMPLETADO Y VALIDACIÓN */}
              <div>
                <Input
                  label="Código Completo *"
                  value={formData.codigo_completo}
                  onChange={(e) => {
                    const codigo = e.target.value;
                    const tipoSugerido = determinarTipoPorCodigo(codigo);
                    const naturalezaSugerida = determinarNaturalezaPorClase(codigo);
                    const padreSugerido = sugerirCodigoPadre(codigo);
                    
                    setFormData({
                      ...formData, 
                      codigo_completo: codigo,
                      tipo_cuenta: tipoSugerido || formData.tipo_cuenta,
                      naturaleza: naturalezaSugerida || formData.naturaleza,
                      codigo_padre: padreSugerido || formData.codigo_padre
                    });
                  }}
                  placeholder="ej: 110501 (automático: tipo, nivel, naturaleza)"
                  required
                  disabled={editingAccount}
                />
                {formData.codigo_completo && (
                  <div className="mt-1 text-xs text-gray-500">
                    Longitud: {formData.codigo_completo.length} dígitos
                  </div>
                )}
              </div>
              
              {/* ✅ TIPO CON VALIDACIÓN AUTOMÁTICA */}
              <Select
                label="Tipo de Cuenta"
                value={formData.tipo_cuenta}
                onChange={(e) => setFormData({...formData, tipo_cuenta: e.target.value})}
                options={[
                  { value: 'CLASE', label: '🏛️ Clase (1 dígito)' },
                  { value: 'GRUPO', label: '📁 Grupo (2 dígitos)' },
                  { value: 'CUENTA', label: '📋 Cuenta (4 dígitos)' },
                  { value: 'SUBCUENTA', label: '📄 Subcuenta (6 dígitos)' },
                  { value: 'DETALLE', label: '🔸 Detalle (7+ dígitos)' }
                ]}
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Descripción *"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción clara y completa de la cuenta"
                  required
                />
              </div>
              
              <Select
                label="Naturaleza"
                value={formData.naturaleza}
                onChange={(e) => setFormData({...formData, naturaleza: e.target.value})}
                options={[
                  { value: 'DEBITO', label: 'Débito (Clases 1,5,6,7,8)' },
                  { value: 'CREDITO', label: 'Crédito (Clases 2,3,4,9)' }
                ]}
              />
              
              {/* ✅ CÓDIGO PADRE CON AYUDA */}
              <div>
                <Input
                  label="Código Padre"
                  value={formData.codigo_padre}
                  onChange={(e) => setFormData({...formData, codigo_padre: e.target.value})}
                  placeholder={sugerirCodigoPadre(formData.codigo_completo) || "ej: 1105"}
                />
                {sugerirCodigoPadre(formData.codigo_completo) && (
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, codigo_padre: sugerirCodigoPadre(formData.codigo_completo)})}
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Usar sugerido: {sugerirCodigoPadre(formData.codigo_completo)}
                  </button>
                )}
              </div>
              
              <div className="md:col-span-2 flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="acepta_movimientos"
                  checked={formData.acepta_movimientos}
                  onChange={(e) => setFormData({...formData, acepta_movimientos: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="acepta_movimientos" className="text-sm font-medium text-gray-700">
                  Acepta movimientos contables
                </label>
              </div>
            </div>

            {/* ✅ VALIDACIONES EN TIEMPO REAL */}
            {formData.codigo_completo && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Validaciones:</h4>
                {(() => {
                  const validacion = validarCodigoJerarquia(
                    formData.codigo_completo, 
                    formData.tipo_cuenta, 
                    formData.codigo_padre
                  );
                  
                  return validacion.valido ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <FaCheckCircle />
                      <span className="text-sm">Código válido para la jerarquía PUC</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {validacion.errores.map((error, index) => (
                        <div key={index} className="flex items-center space-x-2 text-red-600">
                          <FaExclamationTriangle />
                          <span className="text-sm">{error}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

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
        
        {/* Modal Detalle Completo - SIN CAMBIOS MAYORES */}
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

              {/* Grid con información jerárquica */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* ✅ INFORMACIÓN JERÁRQUICA MEJORADA */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaTree className="mr-2 text-green-600" />
                    Jerarquía PUC
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> #{selectedAccount.id}</div>
                    <div><strong>Código Completo:</strong> <span className="font-mono">{selectedAccount.codigo_completo}</span></div>
                    <div><strong>Longitud:</strong> {selectedAccount.codigo_completo?.length} dígitos</div>
                    <div><strong>Nivel Calculado:</strong> {selectedAccount.nivel_calculado || selectedAccount.nivel}</div>
                    <div><strong>Código Padre:</strong> <span className="font-mono">{selectedAccount.codigo_padre || 'N/A'}</span></div>
                    
                    {/* Mostrar jerarquía completa */}
                    {selectedAccount.codigo_clase && (
                      <div><strong>Clase:</strong> <span className="px-1 py-0.5 bg-red-100 text-red-700 rounded font-mono text-xs">{selectedAccount.codigo_clase}</span></div>
                    )}
                    {selectedAccount.codigo_grupo && (
                      <div><strong>Grupo:</strong> <span className="px-1 py-0.5 bg-orange-100 text-orange-700 rounded font-mono text-xs">{selectedAccount.codigo_grupo}</span></div>
                    )}
                    {selectedAccount.codigo_cuenta && (
                      <div><strong>Cuenta:</strong> <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded font-mono text-xs">{selectedAccount.codigo_cuenta}</span></div>
                    )}
                    {selectedAccount.codigo_subcuenta && (
                      <div><strong>Subcuenta:</strong> <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded font-mono text-xs">{selectedAccount.codigo_subcuenta}</span></div>
                    )}
                  </div>
                </div>

                {/* Resto de las secciones sin cambios mayores... */}
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
                    <div><strong>Acepta Movimientos:</strong> 
                      <span className={`ml-1 ${selectedAccount.acepta_movimientos ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedAccount.acepta_movimientos ? '✓ Sí' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>

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
                  </div>
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

        {/* Modales de importación y exportación - SIN CAMBIOS */}
        <ImportPucExcelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportSuccess}
          loading={loading}
        />

        <ExportPucModal
          visible={showExportModal}
          onCancel={() => setShowExportModal(false)}
        />

        {/* ✅ AYUDA MEJORADA CON INFORMACIÓN JERÁRQUICA */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative group">
            <Button
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              icon={FaQuestion}
            />
            <div className="absolute bottom-full right-0 mb-2 w-96 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 mb-2">💡 Ayuda - PUC Jerárquico Inteligente</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>🏗️ Jerarquía Automática:</strong> Los tipos se determinan automáticamente por dígitos.</p>
                  <p><strong>🔍 Validaciones Inteligentes:</strong> Validación en tiempo real de códigos PUC.</p>
                  <p><strong>🌳 Vista Árbol:</strong> Visualización jerárquica con indentación por niveles.</p>
                  <p><strong>🎯 Filtros Rápidos:</strong> Filtros por clase (1-9) con un click.</p>
                  <p><strong>⚡ Autocompletado:</strong> Sugerencias automáticas de tipo, naturaleza y padre.</p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>Estructura PUC:</strong></div>
                    <div>• Clase: 1 dígito (ej: 1, 2, 3)</div>
                    <div>• Grupo: 2 dígitos (ej: 11, 21)</div>
                    <div>• Cuenta: 4 dígitos (ej: 1105)</div>
                    <div>• Subcuenta: 6 dígitos (ej: 110501)</div>
                    <div>• Detalle: 7+ dígitos (ej: 11050101)</div>
                  </div>
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
// components/puc/PucFilters.jsx - VERSIÓN MODIFICADA PARA VISTA TABLA POR DEFECTO
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaFilter, 
  FaTimes, 
  FaTree, 
  FaList, 
  FaExpand, 
  FaCompress,
  FaSearch,
  FaLayerGroup,
  FaSortAmountDown,
  FaDownload,
  FaBullseye,
  FaCodeBranch,
  FaMagic,
  FaHistory,
  FaBookmark,
  FaCog,
  FaDatabase,
  FaRocket,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { 
  PUC_CLASSES, 
  ACCOUNT_TYPES, 
  NATURE_TYPES, 
  STATUS_OPTIONS,
  PAGINATION_OPTIONS,
  SORT_OPTIONS,
  ORDER_OPTIONS,
  DEFAULT_FILTERS,
  BUSQUEDA_ESPECIFICA_CONFIG,
  FILTER_UTILS
} from '../../constants/pucConstants';

const PucFilters = ({
  filtros = DEFAULT_FILTERS,
  setFiltros = () => {},
  vistaArbol = false, // Por defecto false (vista tabla)
  setVistaArbol = () => {},
  vistaExpandida = false,
  setVistaExpandida = () => {},
  onLimpiarFiltros = () => {},
  onAplicarFiltros = () => {},
  onExportar = () => {},
  onExpandirTodos = () => {},
  onContraerTodos = () => {},
  onExpandirSoloClases = () => {},
  onCargarTodasLasCuentas,
  estadisticas = null,
  loading = false,
  cuentas = [],
  todasCargadas = false,
  forzarCargaCompleta = () => {},
}) => {
  // 🔧 MODIFICACIÓN: Estados locales - vistaArbol empieza en false por defecto
  const [filtrosLocales, setFiltrosLocales] = useState(filtros);
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);
  const [mostrarBusquedaEspecifica, setMostrarBusquedaEspecifica] = useState(true);
  const [historialBusquedas, setHistorialBusquedas] = useState([]);
  const [favoritosBusqueda, setFavoritosBusqueda] = useState([]);
  const [sugerenciasVisibles, setSugerenciasVisibles] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  
  // 🔧 MODIFICACIÓN: Estado local para controlar la vista, inicia en false (tabla)
  const [vistaArbolLocal, setVistaArbolLocal] = useState(false);

  // 🔧 MODIFICACIÓN: useEffect para inicializar la vista tabla por defecto
  useEffect(() => {
    // Al montar el componente, asegurar que la vista sea tabla (false)
    setVistaArbolLocal(false);
    setVistaArbol(false);
    
    // Si hay un valor guardado en localStorage y quieres respetarlo, descomenta esto:
    // try {
    //   const vistaGuardada = localStorage.getItem('puc_vista_preferida');
    //   const vista = vistaGuardada === 'true' ? true : false; // Por defecto tabla
    //   setVistaArbolLocal(vista);
    //   setVistaArbol(vista);
    // } catch (error) {
    //   console.warn('Error cargando vista guardada:', error);
    //   setVistaArbolLocal(false);
    //   setVistaArbol(false);
    // }
  }, []); // Solo se ejecuta al montar

  // 🔧 MODIFICACIÓN: Sincronizar con prop vistaArbol solo si cambia externamente
  useEffect(() => {
    setVistaArbolLocal(vistaArbol);
  }, [vistaArbol]);

  // 🔧 MODIFICACIÓN: Función para cambiar vista y persistir en localStorage (opcional)
  const cambiarVista = useCallback((nuevaVista) => {
    setVistaArbolLocal(nuevaVista);
    setVistaArbol(nuevaVista);
    
    // Opcional: Guardar preferencia en localStorage
    // try {
    //   localStorage.setItem('puc_vista_preferida', nuevaVista.toString());
    // } catch (error) {
    //   console.warn('Error guardando vista:', error);
    // }
  }, [setVistaArbol]);

  // 📊 CÁLCULOS MEMOIZADOS
  const estadisticasCalculadas = useMemo(() => {
    const tieneActivosFiltros = FILTER_UTILS.tieneActivosFiltros(filtros);
    const filtrosActivos = FILTER_UTILS.obtenerFiltrosActivos(filtros);
    const porcentajeCobertura = estadisticas?.total 
      ? (((cuentas?.length || 0) / estadisticas.total) * 100).toFixed(1)
      : '0';
    
    return { tieneActivosFiltros, filtrosActivos, porcentajeCobertura };
  }, [filtros, cuentas, estadisticas]);

  // Cargar historial y favoritos del localStorage
  useEffect(() => {
    try {
      const historial = JSON.parse(localStorage.getItem('puc_historial_busquedas') || '[]');
      const favoritos = JSON.parse(localStorage.getItem('puc_favoritos_busqueda') || '[]');
      setHistorialBusquedas(historial.slice(0, 5));
      setFavoritosBusqueda(favoritos.slice(0, 10));
    } catch (error) {
      console.warn('Error cargando datos del localStorage:', error);
    }
  }, []);

  // Sincronizar filtros locales con props
  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);

  // 🎯 HANDLERS OPTIMIZADOS CON USECALLBACK
  const [debounceTimer, setDebounceTimer] = useState(null);
  const debounceBusqueda = useCallback((valor, tipo = 'busqueda') => {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    const newTimer = setTimeout(() => {
      setFiltros({
        ...filtrosLocales,
        [tipo]: valor,
        pagina: 1
      });
    }, 300);
    
    setDebounceTimer(newTimer);
  }, [filtrosLocales, setFiltros, debounceTimer]);

  const aplicarBusquedaEspecifica = useCallback((codigo) => {
    if (!codigo || !codigo.trim()) {
      setFiltros({
        ...filtrosLocales, 
        busqueda_especifica: '',
        pagina: 1
      });
      return;
    }

    const codigoLimpio = codigo.trim().replace(/[^0-9]/g, '');
    
    if (codigoLimpio.length === 0) {
      alert('Por favor ingresa un código válido (solo números)');
      return;
    }

    // Guardar en historial
    try {
      const nuevoHistorial = [
        codigoLimpio,
        ...historialBusquedas.filter(h => h !== codigoLimpio)
      ].slice(0, 5);
      
      setHistorialBusquedas(nuevoHistorial);
      localStorage.setItem('puc_historial_busquedas', JSON.stringify(nuevoHistorial));
    } catch (error) {
      console.warn('Error guardando historial:', error);
    }

    const nuevosFiltros = {
      ...DEFAULT_FILTERS,
      busqueda_especifica: codigoLimpio,
      estado: filtrosLocales.estado || 'ACTIVA',
      limite: filtrosLocales.limite || 50,
      ordenar_por: 'codigo_completo',
      orden: 'ASC',
      pagina: 1
    };

    setFiltros(nuevosFiltros);
    setFiltrosLocales(nuevosFiltros);
    setSugerenciasVisibles(false);
  }, [filtrosLocales, setFiltros, historialBusquedas]);

  const aplicarFiltroClase = useCallback((codigoClase) => {
    const clase = PUC_CLASSES.find(c => c.codigo === codigoClase);
    if (!clase) return;

    const nuevosFiltros = {
      ...filtrosLocales,
      codigo_clase: codigoClase,
      naturaleza: clase.naturaleza,
      busqueda_especifica: '',
      busqueda: '',
      pagina: 1
    };

    setFiltros(nuevosFiltros);
    setFiltrosLocales(nuevosFiltros);
  }, [filtrosLocales, setFiltros]);

  const handleCargarTodasLasCuentas = useCallback(async () => {
    try {
      const totalEsperado = estadisticas?.total || 0;
      
      const confirmar = window.confirm(
        `🚀 ¿Cargar TODAS las ${totalEsperado.toLocaleString()} cuentas del sistema?\n\n` +
        `✅ Esto te permitirá:\n` +
        `• Ver todas las cuentas sin paginación\n` +
        `• Tener la estructura completa del árbol\n` +
        `• Realizar búsquedas más rápidas\n\n` +
        `⚠️ Nota: Puede tomar unos segundos dependiendo de la cantidad de datos.\n\n` +
        `¿Continuar?`
      );
      
      if (!confirmar) return;
      
      await (forzarCargaCompleta || onCargarTodasLasCuentas)();
      
      setFiltrosLocales(prev => ({
        ...prev,
        limite: 99999,
        pagina: 1
      }));
      
      setFiltros({
        ...filtrosLocales,
        limite: 99999,
        pagina: 1
      });
      
    } catch (error) {
      console.error('❌ Error en carga completa:', error);
      alert(`Error cargando todas las cuentas:\n${error.message}\n\nIntenta de nuevo o contacta al administrador.`);
    }
  }, [estadisticas, forzarCargaCompleta, onCargarTodasLasCuentas, filtrosLocales, setFiltros]);

  const validarFiltros = useCallback(() => {
    const errores = [];
    
    if (filtrosLocales.saldo_minimo && filtrosLocales.saldo_maximo) {
      const min = parseFloat(filtrosLocales.saldo_minimo);
      const max = parseFloat(filtrosLocales.saldo_maximo);
      if (min > max) {
        errores.push('El saldo mínimo no puede ser mayor al máximo');
      }
    }

    if (filtrosLocales.fecha_desde && filtrosLocales.fecha_hasta) {
      const desde = new Date(filtrosLocales.fecha_desde);
      const hasta = new Date(filtrosLocales.fecha_hasta);
      if (desde > hasta) {
        errores.push('La fecha desde no puede ser posterior a la fecha hasta');
      }
    }

    return errores;
  }, [filtrosLocales]);

  const erroresValidacion = validarFiltros();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header moderno con glassmorphism */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Título y estadísticas */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaFilter className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Filtros Inteligentes
                </h2>
                <p className="text-sm text-gray-500 font-medium">Plan Único de Cuentas</p>
              </div>
            </div>
            
            {estadisticasCalculadas.tieneActivosFiltros && (
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                <FaCheckCircle className="text-sm" />
                <span className="text-sm font-medium">
                  {estadisticasCalculadas.filtrosActivos.length} filtros activos
                </span>
              </div>
            )}
            
            {estadisticas && (
              <div className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                <FaDatabase className="text-sm" />
                <span className="text-sm font-medium">
                  {estadisticas.total_encontrados?.toLocaleString()} encontrados
                </span>
              </div>
            )}
          </div>
          
          {/* 🔧 MODIFICACIÓN: Controles principales con vista tabla por defecto */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onLimpiarFiltros}
              variant="ghost"
              size="sm"
              icon={FaTimes}
              disabled={loading}
            >
              Limpiar
            </Button>
            
            {/* 🔧 MODIFICACIÓN: Botón de vista actualizado con estado local */}
            <Button
              onClick={() => cambiarVista(!vistaArbolLocal)}
              variant={vistaArbolLocal ? "primary" : "secondary"}
              size="sm"
              icon={vistaArbolLocal ? FaTree : FaList}
            >
              {vistaArbolLocal ? 'Vista Árbol' : 'Vista Tabla'}
            </Button>
            
            <Button
              onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
              variant={mostrarAvanzados ? "info" : "ghost"}
              size="sm"
              icon={FaCog}
            >
              Avanzado
            </Button>
          </div>
        </div>

        {/* Estado de datos cargados - Compacto */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-blue-700">{cuentas?.length?.toLocaleString() || 0}</div>
            <div className="text-xs text-blue-600">En memoria</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-purple-700">{estadisticas?.total?.toLocaleString() || '?'}</div>
            <div className="text-xs text-purple-600">Total BD</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-green-700">{estadisticasCalculadas.porcentajeCobertura}%</div>
            <div className="text-xs text-green-600">Cobertura</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-orange-700">{filtros.limite || 50}</div>
            <div className="text-xs text-orange-600">Por página</div>
          </div>
        </div>

        {/* 🔧 MODIFICACIÓN: Indicador de vista activa */}
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
            {vistaArbolLocal ? <FaTree className="text-green-600" /> : <FaList className="text-blue-600" />}
            <span className="text-sm font-medium text-gray-700">
              Vista {vistaArbolLocal ? 'Jerárquica' : 'Tabla'} activa
            </span>
          </div>
        </div>
      </div>

      {/* Búsqueda Específica Moderna */}
      {mostrarBusquedaEspecifica && (
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <FaBullseye className="text-white text-sm" />
              </div>
              Búsqueda Inteligente de Cuenta
            </h3>
            <button
              onClick={() => setMostrarBusquedaEspecifica(false)}
              className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <FaChevronUp />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Input
                  label="Código de Cuenta"
                  placeholder="Ej: 1105, 11, 1 (solo números)"
                  value={filtrosLocales.busqueda_especifica || ''}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^0-9]/g, '');
                    setFiltrosLocales({...filtrosLocales, busqueda_especifica: valor});
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      aplicarBusquedaEspecifica(filtrosLocales.busqueda_especifica);
                    }
                  }}
                  icon={FaBullseye}
                  size="lg"
                  className="text-lg font-mono"
                  disabled={loading}
                />
              </div>

              {/* Historial de búsquedas - Modernizado */}
              {historialBusquedas.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-emerald-700 mb-2 block flex items-center">
                    <FaHistory className="mr-1" />
                    Búsquedas recientes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {historialBusquedas.map((codigo, index) => (
                      <button
                        key={index}
                        onClick={() => aplicarBusquedaEspecifica(codigo)}
                        className="px-3 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg text-sm font-mono transition-all duration-200 hover:scale-105 shadow-sm"
                        disabled={loading}
                      >
                        {codigo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => aplicarBusquedaEspecifica(filtrosLocales.busqueda_especifica)}
                disabled={!filtrosLocales.busqueda_especifica || loading}
                variant="success"
                size="lg"
                gradient
                icon={FaSearch}
              >
                Buscar
              </Button>
              
              <Button
                onClick={() => {
                  setFiltrosLocales({...filtrosLocales, busqueda_especifica: ''});
                  setFiltros({...filtros, busqueda_especifica: '', pagina: 1});
                }}
                disabled={!filtros.busqueda_especifica || loading}
                variant="secondary"
                size="lg"
                icon={FaTimes}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Información de la búsqueda activa */}
          {filtros.busqueda_especifica && (
            <div className="mt-4 p-4 bg-white border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaBullseye className="text-emerald-600" />
                  <span className="text-emerald-800 font-medium">Mostrando:</span>
                  <code className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-mono font-bold">
                    {filtros.busqueda_especifica}*
                  </code>
                  <span className="text-emerald-600">(cuenta + subcuentas)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Si búsqueda específica está colapsada */}
      {!mostrarBusquedaEspecifica && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <button
            onClick={() => setMostrarBusquedaEspecifica(true)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <FaBullseye className="text-emerald-600" />
              <span className="text-emerald-800 font-medium">Búsqueda Inteligente</span>
              {filtros.busqueda_especifica && (
                <code className="px-2 py-1 bg-emerald-100 text-emerald-900 rounded font-mono text-sm">
                  {filtros.busqueda_especifica}*
                </code>
              )}
            </div>
            <FaChevronDown className="text-emerald-600" />
          </button>
        </div>
      )}

      {/* Filtros Generales - Solo cuando no hay búsqueda específica */}
      {!filtros.busqueda_especifica && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <FaSearch className="text-white text-sm" />
            </div>
            Filtros Generales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Input
              label="Búsqueda General"
              placeholder="Descripción, código..."
              value={filtrosLocales.busqueda || ''}
              onChange={(e) => {
                setFiltrosLocales({...filtrosLocales, busqueda: e.target.value});
                debounceBusqueda(e.target.value, 'busqueda');
              }}
              icon={FaSearch}
              disabled={loading}
            />
            
            <Select
              label="Tipo de Cuenta"
              value={filtrosLocales.tipo || ''}
              onChange={(e) => setFiltrosLocales({...filtrosLocales, tipo: e.target.value})}
              options={[
                { value: '', label: 'Todos los tipos' },
                ...ACCOUNT_TYPES.map(type => ({
                  value: type.value,
                  label: type.label
                }))
              ]}
              disabled={loading}
            />
            
            <Select
              label="Naturaleza"
              value={filtrosLocales.naturaleza || ''}
              onChange={(e) => setFiltrosLocales({...filtrosLocales, naturaleza: e.target.value})}
              options={[
                { value: '', label: 'Todas las naturalezas' },
                ...NATURE_TYPES.map(nature => ({
                  value: nature.value,
                  label: nature.label
                }))
              ]}
              disabled={loading}
            />
            
            <Select
              label="Estado"
              value={filtrosLocales.estado || ''}
              onChange={(e) => setFiltrosLocales({...filtrosLocales, estado: e.target.value})}
              options={STATUS_OPTIONS}
              disabled={loading}
            />
          </div>

          {/* Filtros rápidos por clase - Rediseñados */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-3 block flex items-center">
              <FaLayerGroup className="mr-2 text-purple-600" />
              Filtros Rápidos por Clase PUC
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
              {PUC_CLASSES.map(clase => (
                <button
                  key={clase.codigo}
                  onClick={() => aplicarFiltroClase(clase.codigo)}
                  className={`
                    group relative p-3 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 border-2
                    ${filtros.codigo_clase === clase.codigo 
                      ? `${clase.color} ring-4 ring-blue-300 ring-offset-2 shadow-lg` 
                      : `${clase.color} hover:shadow-md border-transparent`
                    }
                  `}
                  title={`Filtrar por ${clase.nombre} (${clase.naturaleza})`}
                  disabled={loading}
                >
                  <div className="text-center space-y-1">
                    <div className="font-bold text-xl">{clase.codigo}</div>
                    <div className="text-xs leading-tight">{clase.nombre}</div>
                    <div className="text-xs opacity-75 font-medium">{clase.naturaleza}</div>
                  </div>
                  {filtros.codigo_clase === clase.codigo && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-white text-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Configuración de Vista y Ordenamiento */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
            <FaSortAmountDown className="text-white text-sm" />
          </div>
          Vista y Configuración
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <Select
            label="Registros por página"
            value={filtrosLocales.limite || 50}
            onChange={(e) => {
              const nuevoLimite = parseInt(e.target.value);
              
              if (nuevoLimite >= 99999) {
                setFiltrosLocales({...filtrosLocales, limite: nuevoLimite, pagina: 1});
                setTimeout(() => {
                  handleCargarTodasLasCuentas();
                }, 100);
              } else {
                setFiltrosLocales({...filtrosLocales, limite: nuevoLimite, pagina: 1});
              }
            }}
            options={[
              { value: 25, label: '25 registros' },
              { value: 50, label: '50 registros' },
              { value: 100, label: '100 registros' },
              { value: 500, label: '500 registros' },
              { value: 1000, label: '1,000 registros' },
              { value: 5000, label: '5,000 registros' },
              { value: 10000, label: '10,000 registros' },
              { value: 25000, label: '25,000 registros' },
              { value: 99999, label: `🚀 TODAS (${estadisticas?.total?.toLocaleString() || '?'})` }
            ]}
            disabled={loading}
          />
          
          <Select
            label="Ordenar por"
            value={filtrosLocales.ordenar_por || 'codigo_completo'}
            onChange={(e) => setFiltrosLocales({...filtrosLocales, ordenar_por: e.target.value})}
            options={SORT_OPTIONS}
            disabled={loading}
          />
          
          <Select
            label="Orden"
            value={filtrosLocales.orden || 'ASC'}
            onChange={(e) => setFiltrosLocales({...filtrosLocales, orden: e.target.value})}
            options={ORDER_OPTIONS}
            disabled={loading}
          />
          
          {/* Botón cargar todas las cuentas */}
          <Button
            onClick={handleCargarTodasLasCuentas}
            variant="primary"
            gradient
            glow
            icon={FaRocket}
            disabled={loading}
            title={`Cargar TODAS las ${estadisticas?.total?.toLocaleString() || '?'} cuentas del sistema`}
          >
            🚀 TODAS
          </Button>
          
          <Button
            onClick={() => {
              const filtrosValidados = {...filtrosLocales};
              if (erroresValidacion.length === 0) {
                setFiltros(filtrosValidados);
                onAplicarFiltros();
              } else {
                alert('Por favor corrige los errores de validación:\n' + erroresValidacion.join('\n'));
              }
            }}
            variant={erroresValidacion.length > 0 ? "danger" : "success"}
            gradient
            icon={erroresValidacion.length > 0 ? FaExclamationTriangle : FaSearch}
            disabled={loading}
          >
            {erroresValidacion.length > 0 ? 'Errores' : 'Aplicar'}
          </Button>
          
          <Button
            onClick={onExportar}
            variant="info"
            gradient
            icon={FaDownload}
            disabled={loading}
          >
            Exportar
          </Button>
        </div>

        {/* 🔧 MODIFICACIÓN: Controles específicos del árbol usando vistaArbolLocal */}
        {vistaArbolLocal && (
          <div className="mt-4 flex justify-center">
            <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <Button
                onClick={onExpandirTodos}
                variant="ghost"
                size="sm"
                icon={FaExpand}
                disabled={loading}
                className="text-green-600 hover:bg-green-50"
              >
                Expandir Todo
              </Button>
              <Button
                onClick={onContraerTodos}
                variant="ghost"
                size="sm"
                icon={FaCompress}
                disabled={loading}
                className="text-red-600 hover:bg-red-50"
              >
                Contraer Todo
              </Button>
              <Button
                onClick={onExpandirSoloClases}
                variant="ghost"
                size="sm"
                icon={FaLayerGroup}
                disabled={loading}
                className="text-purple-600 hover:bg-purple-50"
              >
                Solo Clases
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filtros Avanzados */}
      {mostrarAvanzados && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-purple-200 shadow-lg p-6 animate-fade-in-down">
          <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <FaCog className="text-white text-sm" />
            </div>
            Filtros Avanzados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Input
              label="Cuenta Padre"
              placeholder="Código padre..."
              value={filtrosLocales.codigo_padre || ''}
              onChange={(e) => setFiltrosLocales({...filtrosLocales, codigo_padre: e.target.value})}
              disabled={loading}
            />
            
            <Select
              label="Nivel Específico"
              value={filtrosLocales.nivel || ''}
              onChange={(e) => setFiltrosLocales({...filtrosLocales, nivel: e.target.value})}
              options={[
                { value: '', label: 'Todos los niveles' },
                { value: '1', label: 'Nivel 1 - Clase' },
                { value: '2', label: 'Nivel 2 - Grupo' },
                { value: '3', label: 'Nivel 3 - Cuenta' },
                { value: '4', label: 'Nivel 4 - Subcuenta' },
                { value: '5', label: 'Nivel 5 - Detalle' }
              ]}
              disabled={loading}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Saldo Mínimo"
                type="number"
                placeholder="0"
                value={filtrosLocales.saldo_minimo || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, saldo_minimo: e.target.value})}
                disabled={loading}
              />
              <Input
                label="Saldo Máximo"
                type="number"
                placeholder="Sin límite"
                value={filtrosLocales.saldo_maximo || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, saldo_maximo: e.target.value})}
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Fecha Desde"
                type="date"
                value={filtrosLocales.fecha_desde || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, fecha_desde: e.target.value})}
                disabled={loading}
              />
              <Input
                label="Fecha Hasta"
                type="date"
                value={filtrosLocales.fecha_hasta || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, fecha_hasta: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>

          {/* Checkboxes para filtros especiales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-purple-200">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filtrosLocales.solo_movimiento || false}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, solo_movimiento: e.target.checked})}
                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                Solo con movimientos
              </span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filtrosLocales.solo_con_saldo || false}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, solo_con_saldo: e.target.checked})}
                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                Solo con saldo
              </span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filtrosLocales.incluir_inactivas || false}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, incluir_inactivas: e.target.checked})}
                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                Incluir inactivas
              </span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filtrosLocales.solo_con_movimientos || false}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, solo_con_movimientos: e.target.checked})}
                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                Con movimientos período
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Filtros Activos - Modernizados */}
      {estadisticasCalculadas.tieneActivosFiltros && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
            <FaFilter className="mr-2" />
            Filtros Activos ({estadisticasCalculadas.filtrosActivos.length})
          </h4>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {estadisticasCalculadas.filtrosActivos.map((filtro, index) => (
              <span
                key={index}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-sm
                  ${filtro.tipo === 'especifica' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : filtro.tipo === 'clase'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }
                `}
              >
                {filtro.etiqueta}
              </span>
            ))}
          </div>
          
          {/* Botones para limpiar filtros específicos */}
          <div className="flex flex-wrap gap-2">
            {filtros.busqueda_especifica && (
              <Button
                onClick={() => {
                  setFiltros({...filtros, busqueda_especifica: '', pagina: 1});
                  setFiltrosLocales({...filtrosLocales, busqueda_especifica: ''});
                }}
                variant="ghost"
                size="sm"
                className="text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                disabled={loading}
              >
                ✕ Quitar búsqueda específica
              </Button>
            )}
            
            {filtros.codigo_clase && (
              <Button
                onClick={() => {
                  setFiltros({...filtros, codigo_clase: '', naturaleza: '', pagina: 1});
                  setFiltrosLocales({...filtrosLocales, codigo_clase: '', naturaleza: ''});
                }}
                variant="ghost"
                size="sm"
                className="text-purple-700 hover:bg-purple-50 border border-purple-200"
                disabled={loading}
              >
                ✕ Quitar filtro de clase
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Favoritos de búsqueda - Rediseñados */}
      {favoritosBusqueda.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 shadow-sm">
          <h4 className="text-sm font-bold text-yellow-800 mb-3 flex items-center">
            <FaBookmark className="mr-2" />
            Búsquedas Guardadas ({favoritosBusqueda.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoritosBusqueda.map(favorito => (
              <div key={favorito.id} className="relative group">
                <button
                  onClick={() => {
                    setFiltros(favorito.filtros);
                    setFiltrosLocales(favorito.filtros);
                  }}
                  className="w-full text-left p-3 bg-white border border-yellow-200 rounded-xl hover:bg-yellow-50 transition-all duration-200 hover:scale-105 shadow-sm"
                  disabled={loading}
                >
                  <div className="font-medium text-sm text-yellow-800">{favorito.nombre}</div>
                  <div className="text-xs text-yellow-600">
                    {new Date(favorito.fecha).toLocaleDateString()}
                  </div>
                  {favorito.filtros.busqueda_especifica && (
                    <div className="text-xs font-mono text-yellow-700 mt-1">
                      🎯 {favorito.filtros.busqueda_especifica}
                    </div>
                  )}
                </button>
                <button
                  onClick={() => {
                    const nuevosFavoritos = favoritosBusqueda.filter(f => f.id !== favorito.id);
                    setFavoritosBusqueda(nuevosFavoritos);
                    try {
                      localStorage.setItem('puc_favoritos_busqueda', JSON.stringify(nuevosFavoritos));
                    } catch (error) {
                      console.warn('Error eliminando favorito:', error);
                    }
                  }}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm"
                  title="Eliminar favorito"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas y validaciones */}
      {estadisticas?.total && (cuentas?.length || 0) < estadisticas.total && !filtros.busqueda_especifica && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="text-white text-sm" />
            </div>
            <div>
              <h4 className="font-bold text-yellow-800">Datos incompletos</h4>
              <p className="text-yellow-700 text-sm">
                Solo tienes <strong>{cuentas?.length?.toLocaleString() || 0}</strong> de <strong>{estadisticas.total.toLocaleString()}</strong> cuentas cargadas.
              </p>
              <p className="text-yellow-600 text-xs mt-1">
                Para ver la estructura completa del árbol, carga todas las cuentas.
              </p>
              <Button
                onClick={handleCargarTodasLasCuentas}
                variant="warning"
                size="sm"
                icon={FaRocket}
                className="mt-2"
              >
                🚀 Cargar Todas Ahora
              </Button>
            </div>
          </div>
        </div>
      )}

      {estadisticas?.total && (cuentas?.length || 0) >= estadisticas.total && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-white text-sm" />
            </div>
            <div>
              <h4 className="font-bold text-green-800">¡Datos completos!</h4>
              <p className="text-green-700 text-sm">
                Todas las <strong>{estadisticas.total.toLocaleString()}</strong> cuentas están cargadas en memoria.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validaciones y errores */}
      {erroresValidacion.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-300 rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="text-white text-sm" />
            </div>
            <div>
              <h4 className="font-bold text-red-800">Errores de Validación</h4>
              <ul className="text-sm text-red-700 space-y-1 mt-2">
                {erroresValidacion.map((error, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-center">
              <div className="text-base font-medium text-gray-700">Aplicando filtros...</div>
              <div className="text-sm text-gray-500">Procesando solicitud</div>
            </div>
          </div>
        </div>
      )}

      {/* Tips y ayuda - Modernizados */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <div className="w-6 h-6 bg-gray-500 rounded-lg flex items-center justify-center mr-2">
            <span className="text-white text-xs">💡</span>
          </div>
          Tips de Uso
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="flex items-start space-x-2">
            <FaBullseye className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <span><strong>Búsqueda específica:</strong> Ingresa un código (ej: 1105) para ver esa cuenta + todas sus subcuentas</span>
          </div>
          <div className="flex items-start space-x-2">
            <FaSearch className="text-blue-500 mt-0.5 flex-shrink-0" />
            <span><strong>Búsqueda general:</strong> Busca por nombre o código parcial en todas las cuentas</span>
          </div>
          <div className="flex items-start space-x-2">
            <FaLayerGroup className="text-purple-500 mt-0.5 flex-shrink-0" />
            <span><strong>Filtros rápidos:</strong> Haz click en las clases (1-9) para filtrar rápidamente</span>
          </div>
          <div className="flex items-start space-x-2">
            <FaBookmark className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <span><strong>Favoritos:</strong> Guarda tus búsquedas frecuentes para reutilizarlas</span>
          </div>
          <div className="flex items-start space-x-2">
            <FaList className="text-blue-500 mt-0.5 flex-shrink-0" />
            <span><strong>Vista tabla (defecto):</strong> Vista por defecto al cargar la página, ideal para análisis rápido</span>
          </div>
          <div className="flex items-start space-x-2">
            <FaTree className="text-green-500 mt-0.5 flex-shrink-0" />
            <span><strong>Vista árbol:</strong> Cambia manualmente para ver la estructura jerárquica del PUC</span>
          </div>
          <div className="flex items-start space-x-2">
            <FaRocket className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <span><strong>Carga completa:</strong> Usa "🚀 TODAS" para cargar todas las cuentas de una vez</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PucFilters;

// components/puc/PucFilters.jsx - VERSIÓN ULTRA PERFECCIONADA Y CORREGIDA
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
  FaChevronUp,
  FaEye,
  FaBolt,
  FaSync,
  FaStopwatch,
  FaStar,
  FaLightbulb,
  FaPlay,
  FaHashtag,
  FaSlidersH // ✅ Correcto: FaSlidersH en lugar de FaSliders
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
  vistaArbol = false,
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
  // Estados locales
  const [filtrosLocales, setFiltrosLocales] = useState(filtros);
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);
  const [mostrarBusquedaEspecifica, setMostrarBusquedaEspecifica] = useState(false);
  const [vistaArbolLocal, setVistaArbolLocal] = useState(false);
  const [historialBusquedas, setHistorialBusquedas] = useState([]);
  const [filtroInteligente, setFiltroInteligente] = useState('');
  const [sugerenciasActivas, setSugerenciasActivas] = useState(false);

  // Inicializar vista tabla por defecto
  useEffect(() => {
    setVistaArbolLocal(false);
    setVistaArbol(false);
  }, []);

  useEffect(() => {
    setVistaArbolLocal(vistaArbol);
  }, [vistaArbol]);

  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);

  // Cargar historial del localStorage
  useEffect(() => {
    try {
      const historial = JSON.parse(localStorage.getItem('puc_historial_busquedas') || '[]');
      setHistorialBusquedas(historial.slice(0, 5));
    } catch (error) {
      console.warn('Error cargando historial:', error);
    }
  }, []);

  // Cálculos memoizados avanzados
  const estadisticasCalculadas = useMemo(() => {
    const tieneActivosFiltros = FILTER_UTILS.tieneActivosFiltros(filtros);
    const filtrosActivos = FILTER_UTILS.obtenerFiltrosActivos(filtros);
    const porcentajeCobertura = estadisticas?.total 
      ? (((cuentas?.length || 0) / estadisticas.total) * 100).toFixed(1)
      : '0';
    
    const eficienciaFiltros = filtrosActivos.length > 0 ? 
      Math.min(100, (parseFloat(porcentajeCobertura) / filtrosActivos.length) * 20).toFixed(0) : 100;
    
    return { 
      tieneActivosFiltros, 
      filtrosActivos, 
      porcentajeCobertura,
      eficienciaFiltros,
      totalCargadas: cuentas?.length || 0,
      esCompleto: (cuentas?.length || 0) >= (estadisticas?.total || 0)
    };
  }, [filtros, cuentas, estadisticas]);

  // Handlers avanzados
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

  const cambiarVista = useCallback((nuevaVista) => {
    setVistaArbolLocal(nuevaVista);
    setVistaArbol(nuevaVista);
  }, [setVistaArbol]);

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
    setMostrarBusquedaEspecifica(false);
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
      
      if (!window.confirm(`🚀 ¿Cargar TODAS las ${totalEsperado.toLocaleString()} cuentas?\n\nEsto mejorará la velocidad de búsqueda y mostrará la estructura completa.`)) return;
      
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
      console.error('Error en carga completa:', error);
      alert(`❌ Error cargando todas las cuentas: ${error.message}`);
    }
  }, [estadisticas, forzarCargaCompleta, onCargarTodasLasCuentas, filtrosLocales, setFiltros]);

  // Función para aplicar filtros inteligentes
  const aplicarFiltroInteligente = useCallback(() => {
    if (!filtroInteligente.trim()) return;

    const termino = filtroInteligente.toLowerCase().trim();
    
    // Detectar tipo de búsqueda inteligente
    if (/^\d+$/.test(termino)) {
      // Es un código numérico
      aplicarBusquedaEspecifica(termino);
    } else if (termino.includes('debito') || termino.includes('credito')) {
      // Búsqueda por naturaleza
      setFiltrosLocales({
        ...filtrosLocales,
        naturaleza: termino.includes('debito') ? 'DEBITO' : 'CREDITO',
        busqueda: '',
        pagina: 1
      });
    } else {
      // Búsqueda general
      setFiltrosLocales({
        ...filtrosLocales,
        busqueda: termino,
        pagina: 1
      });
      debounceBusqueda(termino, 'busqueda');
    }
    
    setFiltroInteligente('');
  }, [filtroInteligente, aplicarBusquedaEspecifica, filtrosLocales, debounceBusqueda]);

  return (
    <div className="space-y-3">
      {/* HEADER PRINCIPAL ULTRA AVANZADO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-blue-50/30 to-white rounded-2xl border border-gray-200/80 shadow-lg backdrop-blur-sm">
        {/* Efectos decorativos */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        <div className="relative p-5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            
            {/* Título y Métricas Avanzadas */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                    <FaSlidersH className="text-white text-xl group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent">
                    Centro de Filtros Inteligente
                  </h2>
                  <p className="text-sm font-medium text-gray-500">Plan Único de Cuentas • Sistema Avanzado</p>
                </div>
              </div>
              
              {/* Métricas Ultra Avanzadas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Cuentas en memoria */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/60 rounded-xl p-3 hover:shadow-md transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  <div className="relative flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <FaEye className="text-blue-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-800">{estadisticasCalculadas.totalCargadas.toLocaleString()}</div>
                      <div className="text-xs font-medium text-blue-600">En Memoria</div>
                    </div>
                  </div>
                </div>

                {/* Total en BD */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-200/60 rounded-xl p-3 hover:shadow-md transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  <div className="relative flex items-center gap-2">
                    <div className="p-1.5 bg-gray-500/20 rounded-lg">
                      <FaDatabase className="text-gray-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-800">{estadisticas?.total?.toLocaleString() || '?'}</div>
                      <div className="text-xs font-medium text-gray-600">Total BD</div>
                    </div>
                  </div>
                </div>

                {/* Cobertura */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200/60 rounded-xl p-3 hover:shadow-md transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  <div className="relative flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                      <FaCheckCircle className="text-emerald-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-800">{estadisticasCalculadas.porcentajeCobertura}%</div>
                      <div className="text-xs font-medium text-emerald-600">Cobertura</div>
                    </div>
                  </div>
                </div>

                {/* Filtros activos */}
                {estadisticasCalculadas.tieneActivosFiltros && (
                  <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200/60 rounded-xl p-3 hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                    <div className="relative flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/20 rounded-lg">
                        <FaFilter className="text-amber-600 text-sm" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-amber-800">{estadisticasCalculadas.filtrosActivos.length}</div>
                        <div className="text-xs font-medium text-amber-600">Filtros</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Controles Principales Avanzados */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => cambiarVista(!vistaArbolLocal)}
                variant={vistaArbolLocal ? "primary" : "secondary"}
                size="sm"
                icon={vistaArbolLocal ? FaTree : FaList}
                className="relative overflow-hidden group"
              >
                <span className="relative z-10">{vistaArbolLocal ? 'Vista Árbol' : 'Vista Tabla'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </Button>
              
              <Button
                onClick={() => setMostrarBusquedaEspecifica(!mostrarBusquedaEspecifica)}
                variant={mostrarBusquedaEspecifica ? "success" : "ghost"}
                size="sm"
                icon={FaBullseye}
                className="relative overflow-hidden group"
              >
                <span className="relative z-10">Específica</span>
              </Button>
              
              <Button
                onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
                variant={mostrarAvanzados ? "info" : "ghost"}
                size="sm"
                icon={FaCog}
                className="relative overflow-hidden group"
              >
                <span className="relative z-10">Avanzado</span>
              </Button>
              
              <Button
                onClick={onLimpiarFiltros}
                variant="ghost"
                size="sm"
                icon={FaTimes}
                disabled={loading}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Indicador de estado del sistema */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                estadisticasCalculadas.esCompleto 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  estadisticasCalculadas.esCompleto ? 'bg-green-500' : 'bg-yellow-500'
                } animate-pulse`}></div>
                {estadisticasCalculadas.esCompleto ? 'Datos Completos' : 'Datos Parciales'}
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                <FaBolt className="text-xs" />
                Eficiencia: {estadisticasCalculadas.eficienciaFiltros}%
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaStopwatch />
              <span>Vista {vistaArbolLocal ? 'Jerárquica' : 'Tabular'} • {loading ? 'Actualizando...' : 'Listo'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA INTELIGENTE UNIVERSAL */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500 rounded-lg shadow-sm">
            <FaLightbulb className="text-white text-sm" />
          </div>
          <h3 className="font-semibold text-emerald-800">Búsqueda Inteligente Universal</h3>
          <div className="px-2 py-1 bg-emerald-200 text-emerald-700 rounded-full text-xs font-medium">
            IA Powered
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Escribe cualquier cosa: código (1105), naturaleza (debito), nombre (caja)..."
              value={filtroInteligente}
              onChange={(e) => setFiltroInteligente(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  aplicarFiltroInteligente();
                }
              }}
              icon={FaMagic}
              className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-emerald-600">
              {filtroInteligente && (
                <span className="bg-emerald-100 px-2 py-1 rounded-full">
                  {/^\d+$/.test(filtroInteligente) ? 'Código' : 
                   filtroInteligente.includes('debito') || filtroInteligente.includes('credito') ? 'Naturaleza' : 'Texto'}
                </span>
              )}
            </div>
          </div>
          
          <Button
            onClick={aplicarFiltroInteligente}
            disabled={!filtroInteligente.trim() || loading}
            variant="success"
            size="md"
            icon={FaPlay}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-emerald-500/25"
          >
            Buscar IA
          </Button>
        </div>

        {/* Sugerencias rápidas */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-emerald-600 font-medium">Prueba:</span>
          {['1105', 'caja', 'debito', 'banco', '4'].map(sugerencia => (
            <button
              key={sugerencia}
              onClick={() => {
                setFiltroInteligente(sugerencia);
                setTimeout(() => aplicarFiltroInteligente(), 100);
              }}
              className="px-2 py-1 bg-white/80 hover:bg-emerald-100 border border-emerald-200 rounded-md text-xs font-mono text-emerald-700 transition-all duration-200 hover:scale-105"
              disabled={loading}
            >
              {sugerencia}
            </button>
          ))}
        </div>
      </div>

      {/* BÚSQUEDA ESPECÍFICA AVANZADA */}
      {mostrarBusquedaEspecifica && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                <FaBullseye className="text-white text-sm" />
              </div>
              <h3 className="font-semibold text-blue-800">Búsqueda por Código Específico</h3>
            </div>
            <button
              onClick={() => setMostrarBusquedaEspecifica(false)}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <FaChevronUp className="text-sm" />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Código específico (ej: 1105, 11, 1)"
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
                icon={FaHashtag}
                className="font-mono text-lg bg-white/80 border-blue-200 focus:border-blue-400"
                disabled={loading}
              />
              
              {/* Historial mejorado */}
              {historialBusquedas.length > 0 && (
                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-200/60">
                  <div className="flex items-center gap-2 mb-2">
                    <FaHistory className="text-blue-600 text-sm" />
                    <span className="text-sm font-medium text-blue-700">Búsquedas Recientes</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {historialBusquedas.map((codigo, index) => (
                      <button
                        key={index}
                        onClick={() => aplicarBusquedaEspecifica(codigo)}
                        className="group px-3 py-1.5 bg-gradient-to-r from-white to-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg text-sm font-mono text-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-sm"
                        disabled={loading}
                      >
                        <span className="group-hover:text-blue-800">{codigo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => aplicarBusquedaEspecifica(filtrosLocales.busqueda_especifica)}
                disabled={!filtrosLocales.busqueda_especifica || loading}
                variant="primary"
                size="md"
                icon={FaSearch}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Buscar Código
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FILTROS GENERALES ULTRA REFINADOS */}
      {!filtros.busqueda_especifica && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-500 rounded-lg shadow-sm">
                <FaSearch className="text-white text-sm" />
              </div>
              <h3 className="font-semibold text-gray-800">Filtros Generales</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <Input
                placeholder="Buscar descripción, código..."
                value={filtrosLocales.busqueda || ''}
                onChange={(e) => {
                  setFiltrosLocales({...filtrosLocales, busqueda: e.target.value});
                  debounceBusqueda(e.target.value, 'busqueda');
                }}
                icon={FaSearch}
                className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                disabled={loading}
              />
              
              <Select
                value={filtrosLocales.tipo || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, tipo: e.target.value})}
                options={[
                  { value: '', label: '🔸 Todos los tipos' },
                  ...ACCOUNT_TYPES.map(type => ({
                    value: type.value,
                    label: `${type.icon || '▫️'} ${type.label}`
                  }))
                ]}
                className="bg-white border-gray-200 focus:border-blue-400"
                disabled={loading}
              />
              
              <Select
                value={filtrosLocales.naturaleza || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, naturaleza: e.target.value})}
                options={[
                  { value: '', label: '⚖️ Todas las naturalezas' },
                  ...NATURE_TYPES.map(nature => ({
                    value: nature.value,
                    label: `${nature.value === 'DEBITO' ? '➕' : '➖'} ${nature.label}`
                  }))
                ]}
                className="bg-white border-gray-200 focus:border-blue-400"
                disabled={loading}
              />
              
              <Select
                value={filtrosLocales.estado || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, estado: e.target.value})}
                options={STATUS_OPTIONS.map(option => ({
                  ...option,
                  label: `${option.value === 'ACTIVA' ? '✅' : option.value === 'INACTIVA' ? '❌' : '🔸'} ${option.label}`
                }))}
                className="bg-white border-gray-200 focus:border-blue-400"
                disabled={loading}
              />
            </div>

            {/* Filtros por Clase Ultra Modernos */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaLayerGroup className="text-purple-600" />
                  Filtros Rápidos por Clase PUC
                </label>
                {filtros.codigo_clase && (
                  <button
                    onClick={() => {
                      setFiltros({...filtros, codigo_clase: '', naturaleza: ''});
                      setFiltrosLocales({...filtrosLocales, codigo_clase: '', naturaleza: ''});
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    ✕ Quitar filtro
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {PUC_CLASSES.map(clase => (
                  <button
                    key={clase.codigo}
                    onClick={() => aplicarFiltroClase(clase.codigo)}
                    className={`
                      group relative p-3 rounded-xl text-xs font-medium transition-all duration-300 hover:scale-105 border-2 overflow-hidden
                      ${filtros.codigo_clase === clase.codigo 
                        ? `${clase.color} ring-2 ring-blue-400 ring-offset-2 shadow-lg scale-105` 
                        : `${clase.color} hover:shadow-md border-transparent`
                      }
                    `}
                    title={`${clase.nombre} • ${clase.naturaleza}`}
                    disabled={loading}
                  >
                    <div className="relative z-10 text-center space-y-1">
                      <div className="font-bold text-xl">{clase.codigo}</div>
                      <div className="text-xs leading-tight opacity-90">{clase.nombre.slice(0, 8)}</div>
                      <div className="text-xs font-bold opacity-75">{clase.naturaleza.slice(0, 3)}</div>
                    </div>
                    
                    {filtros.codigo_clase === clase.codigo && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <FaCheckCircle className="text-white text-sm" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN Y ACCIONES PREMIUM */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200/80 shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
              <FaSortAmountDown className="text-white text-sm" />
            </div>
            <h3 className="font-semibold text-gray-800">Configuración y Acciones</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 items-end">
            <Select
              label="📄 Registros"
              value={filtrosLocales.limite || 50}
              onChange={(e) => {
                const nuevoLimite = parseInt(e.target.value);
                if (nuevoLimite >= 99999) {
                  handleCargarTodasLasCuentas();
                } else {
                  setFiltrosLocales({...filtrosLocales, limite: nuevoLimite, pagina: 1});
                }
              }}
              options={[
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
                { value: 500, label: '500' },
                { value: 1000, label: '1K' },
                { value: 99999, label: `🚀 TODAS (${estadisticas?.total?.toLocaleString() || '?'})` }
              ]}
              className="bg-white border-gray-200"
              disabled={loading}
            />
            
            <Select
              label="📊 Ordenar por"
              value={filtrosLocales.ordenar_por || 'codigo_completo'}
              onChange={(e) => setFiltrosLocales({...filtrosLocales, ordenar_por: e.target.value})}
              options={SORT_OPTIONS.map(option => ({
                ...option,
                label: option.label.replace('Código', '🔢').replace('Descripción', '📝').replace('Saldo', '💰')
              }))}
              className="bg-white border-gray-200"
              disabled={loading}
            />
            
            <Select
              label="🔄 Dirección"
              value={filtrosLocales.orden || 'ASC'}
              onChange={(e) => setFiltrosLocales({...filtrosLocales, orden: e.target.value})}
              options={ORDER_OPTIONS.map(option => ({
                ...option,
                label: option.value === 'ASC' ? '⬆️ Ascendente' : '⬇️ Descendente'
              }))}
              className="bg-white border-gray-200"
              disabled={loading}
            />
            
            <Button
              onClick={handleCargarTodasLasCuentas}
              variant="primary"
              size="sm"
              icon={FaRocket}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25"
            >
              🚀 TODAS
            </Button>
            
            <Button
              onClick={() => {
                setFiltros(filtrosLocales);
                onAplicarFiltros();
              }}
              variant="success"
              size="sm"
              icon={FaPlay}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25"
            >
              ✨ Aplicar
            </Button>
            
            <Button
              onClick={onExportar}
              variant="info"
              size="sm"
              icon={FaDownload}
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/25"
            >
              📥 Exportar
            </Button>
            
            {/* Controles del árbol premium */}
            {vistaArbolLocal && (
              <>
                <Button
                  onClick={onExpandirTodos}
                  variant="ghost"
                  size="sm"
                  icon={FaExpand}
                  disabled={loading}
                  className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200 hover:border-green-300"
                >
                  🌿 Expandir
                </Button>
                
                <Button
                  onClick={onContraerTodos}
                  variant="ghost"
                  size="sm"
                  icon={FaCompress}
                  disabled={loading}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  🍂 Contraer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FILTROS AVANZADOS ULTRA PROFESIONALES */}
      {mostrarAvanzados && (
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 rounded-xl shadow-lg">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                  <FaCog className="text-white text-sm animate-spin-slow" />
                </div>
                <h3 className="font-bold text-purple-800">Filtros Avanzados y Precisión</h3>
                <div className="px-2 py-1 bg-purple-200 text-purple-700 rounded-full text-xs font-medium">
                  Pro Mode
                </div>
              </div>
              <button
                onClick={() => setMostrarAvanzados(false)}
                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <FaChevronUp />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <Input
                label="🔗 Cuenta Padre"
                placeholder="Código del padre..."
                value={filtrosLocales.codigo_padre || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, codigo_padre: e.target.value})}
                className="bg-white/80 border-purple-200 focus:border-purple-400"
                disabled={loading}
              />
              
              <Select
                label="📊 Nivel Jerárquico"
                value={filtrosLocales.nivel || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, nivel: e.target.value})}
                options={[
                  { value: '', label: '🔸 Todos los niveles' },
                  { value: '1', label: '1️⃣ Clase' },
                  { value: '2', label: '2️⃣ Grupo' },
                  { value: '3', label: '3️⃣ Cuenta' },
                  { value: '4', label: '4️⃣ Subcuenta' },
                  { value: '5', label: '5️⃣ Detalle' }
                ]}
                className="bg-white/80 border-purple-200 focus:border-purple-400"
                disabled={loading}
              />
              
              <Input
                label="💰 Saldo Mínimo"
                type="number"
                placeholder="0.00"
                value={filtrosLocales.saldo_minimo || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, saldo_minimo: e.target.value})}
                className="bg-white/80 border-purple-200 focus:border-purple-400"
                disabled={loading}
              />
              
              <Input
                label="💎 Saldo Máximo"
                type="number"
                placeholder="Sin límite"
                value={filtrosLocales.saldo_maximo || ''}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, saldo_maximo: e.target.value})}
                className="bg-white/80 border-purple-200 focus:border-purple-400"
                disabled={loading}
              />
            </div>
            
            {/* Opciones avanzadas con mejor UX */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200/60">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <FaStopwatch className="text-purple-600" />
                Opciones de Filtrado Avanzado
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtrosLocales.solo_movimiento || false}
                    onChange={(e) => setFiltrosLocales({...filtrosLocales, solo_movimiento: e.target.checked})}
                    className="w-5 h-5 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="text-sm font-medium text-purple-800">Solo con movimientos</div>
                      <div className="text-xs text-purple-600">Cuentas que tienen transacciones</div>
                    </div>
                  </div>
                </label>
                
                <label className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtrosLocales.solo_con_saldo || false}
                    onChange={(e) => setFiltrosLocales({...filtrosLocales, solo_con_saldo: e.target.checked})}
                    className="w-5 h-5 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="text-sm font-medium text-purple-800">Solo con saldo</div>
                      <div className="text-xs text-purple-600">Cuentas con saldo 0</div>
                    </div>
                  </div>
                </label>
                
                <label className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtrosLocales.incluir_inactivas || false}
                    onChange={(e) => setFiltrosLocales({...filtrosLocales, incluir_inactivas: e.target.checked})}
                    className="w-5 h-5 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">❌</span>
                    <div>
                      <div className="text-sm font-medium text-purple-800">Incluir inactivas</div>
                      <div className="text-xs text-purple-600">Mostrar cuentas deshabilitadas</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTADO DE FILTROS ULTRA AVANZADO */}
      {estadisticasCalculadas.tieneActivosFiltros && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                <FaFilter className="text-white text-sm" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">
                  {estadisticasCalculadas.filtrosActivos.length} Filtros Activos
                </h4>
                <p className="text-xs text-blue-600">
                  Eficiencia: {estadisticasCalculadas.eficienciaFiltros}% • 
                  Cobertura: {estadisticasCalculadas.porcentajeCobertura}%
                </p>
              </div>
            </div>
            
            <Button
              onClick={onLimpiarFiltros}
              variant="ghost"
              size="sm"
              icon={FaTimes}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Limpiar Todo
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {estadisticasCalculadas.filtrosActivos.map((filtro, index) => (
              <div
                key={index}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border
                  ${filtro.tipo === 'especifica' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : filtro.tipo === 'clase'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                  }
                `}
              >
                <span className="text-xs">
                  {filtro.tipo === 'especifica' ? '🎯' : 
                   filtro.tipo === 'clase' ? '📊' : '🔍'}
                </span>
                {filtro.etiqueta}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALERTAS INTELIGENTES */}
      {estadisticas?.total && (cuentas?.length || 0) < estadisticas.total && !filtros.busqueda_especifica && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg shadow-sm animate-pulse">
                <FaExclamationTriangle className="text-white text-sm" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800">Datos Incompletos Detectados</h4>
                <p className="text-sm text-amber-700">
                  Solo {cuentas?.length?.toLocaleString() || 0} de {estadisticas.total.toLocaleString()} cuentas en memoria
                  • Para mejor rendimiento, carga el dataset completo
                </p>
              </div>
            </div>
            <Button
              onClick={handleCargarTodasLasCuentas}
              variant="warning"
              size="sm"
              icon={FaRocket}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg"
            >
              🚀 Cargar Todo
            </Button>
          </div>
        </div>
      )}

      {/* ESTADO DE CARGA PREMIUM */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200"></div>
              <div className="absolute inset-0 animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
              <div className="absolute inset-2 animate-pulse rounded-full h-4 w-4 bg-blue-600/20"></div>
            </div>
            <div>
              <div className="text-base font-semibold text-gray-800">Procesando filtros inteligentes...</div>
              <div className="text-sm text-gray-600">Optimizando resultados para mejor experiencia</div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS PERSONALIZADOS */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default PucFilters;

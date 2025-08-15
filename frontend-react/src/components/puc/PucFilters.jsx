// components/puc/PucFilters.jsx - VERSIÓN FINAL CORREGIDA
import React, { useState, useEffect, useCallback } from 'react';
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
  FaExclamationTriangle
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
  onCargarTodasLasCuentas, // ✅ NUEVO PROP
  estadisticas = null,
  loading = false,
  cuentas = [], // ✅ NUEVO PROP para mostrar stats
  todasCargadas = false, // ✅ NUEVO PROP
  forzarCargaCompleta = () => {}, // ✅ NUEVO PROP opcional
}) => {
  // Estados locales para mejor UX
  const [filtrosLocales, setFiltrosLocales] = useState(filtros);
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);
  const [historialBusquedas, setHistorialBusquedas] = useState([]);
  const [favoritosBusqueda, setFavoritosBusqueda] = useState([]);
  const [sugerenciasVisibles, setSugerenciasVisibles] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);

  // Cargar historial y favoritos del localStorage
  useEffect(() => {
    try {
      const historial = JSON.parse(localStorage.getItem('puc_historial_busquedas') || '[]');
      const favoritos = JSON.parse(localStorage.getItem('puc_favoritos_busqueda') || '[]');
      setHistorialBusquedas(historial.slice(0, 5)); // Solo los últimos 5
      setFavoritosBusqueda(favoritos.slice(0, 10)); // Solo los primeros 10
    } catch (error) {
      console.warn('Error cargando datos del localStorage:', error);
    }
  }, []);

  // Sincronizar filtros locales con props
  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);

  // Debounce para búsquedas
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

  // Función mejorada para búsqueda específica
  const aplicarBusquedaEspecifica = useCallback((codigo) => {
    if (!codigo || !codigo.trim()) {
      setFiltros({
        ...filtrosLocales, 
        busqueda_especifica: '',
        pagina: 1
      });
      return;
    }

    const codigoLimpio = codigo.trim().replace(/[^0-9]/g, ''); // Solo números
    
    // Validar formato de código PUC
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

    // Aplicar filtro con lógica inteligente
    const nuevosFiltros = {
      ...DEFAULT_FILTERS, // Limpiar todos los filtros
      busqueda_especifica: codigoLimpio,
      estado: filtrosLocales.estado || 'ACTIVA', // Mantener estado
      limite: filtrosLocales.limite || 50,
      ordenar_por: 'codigo_completo',
      orden: 'ASC',
      pagina: 1
    };

    setFiltros(nuevosFiltros);
    setFiltrosLocales(nuevosFiltros);
    setSugerenciasVisibles(false);
  }, [filtrosLocales, setFiltros, historialBusquedas]);

  // Función para aplicar filtro por clase con lógica inteligente
  const aplicarFiltroClase = useCallback((codigoClase) => {
    const clase = PUC_CLASSES.find(c => c.codigo === codigoClase);
    if (!clase) return;

    const nuevosFiltros = {
      ...filtrosLocales,
      codigo_clase: codigoClase,
      naturaleza: clase.naturaleza, // Auto-completar naturaleza
      busqueda_especifica: '', // Limpiar búsqueda específica
      busqueda: '',
      pagina: 1
    };

    setFiltros(nuevosFiltros);
    setFiltrosLocales(nuevosFiltros);
  }, [filtrosLocales, setFiltros]);

  // Función para filtros inteligentes por tipo
  const aplicarFiltroInteligentePorTipo = useCallback((tipo) => {
    const tipoConfig = ACCOUNT_TYPES.find(t => t.value === tipo);
    if (!tipoConfig) {
      setFiltros({...filtrosLocales, tipo: tipo, pagina: 1});
      return;
    }

    // Configurar filtros inteligentes basados en el tipo
    let nuevosFiltros = {
      ...filtrosLocales,
      tipo: tipo,
      pagina: 1
    };

    // Lógica específica por tipo
    switch (tipo) {
      case 'CLASE':
        nuevosFiltros.nivel = '1';
        break;
      case 'GRUPO':
        nuevosFiltros.nivel = '2';
        break;
      case 'CUENTA':
        nuevosFiltros.nivel = '3';
        break;
      case 'SUBCUENTA':
        nuevosFiltros.nivel = '4';
        break;
      case 'DETALLE':
        nuevosFiltros.nivel = '5';
        break;
    }

    setFiltros(nuevosFiltros);
    setFiltrosLocales(nuevosFiltros);
  }, [filtrosLocales, setFiltros]);

  // Función para obtener sugerencias
  const obtenerSugerencias = useCallback(async (termino) => {
    if (!termino || termino.length < 2) {
      setSugerencias([]);
      setSugerenciasVisibles(false);
      return;
    }

    try {
      // Aquí harías la llamada a tu API para obtener sugerencias
      // const response = await api.get(`/puc/sugerencias?termino=${termino}`);
      // setSugerencias(response.data.data);
      
      // Por ahora, sugerencias basadas en las clases PUC
      const sugerenciasClases = PUC_CLASSES
        .filter(clase => 
          clase.codigo.startsWith(termino) || 
          clase.nombre.toLowerCase().includes(termino.toLowerCase())
        )
        .map(clase => ({
          codigo: clase.codigo,
          descripcion: clase.nombre,
          tipo: 'CLASE',
          naturaleza: clase.naturaleza,
          coincidencia: 'codigo'
        }));
      
      setSugerencias(sugerenciasClases);
      setSugerenciasVisibles(sugerenciasClases.length > 0);
    } catch (error) {
      console.warn('Error obteniendo sugerencias:', error);
      setSugerencias([]);
      setSugerenciasVisibles(false);
    }
  }, []);

  // Función para guardar búsqueda como favorita
  const guardarEnFavoritos = useCallback((filtros, nombre) => {
    try {
      const nuevoFavorito = {
        id: Date.now().toString(),
        nombre: nombre || `Búsqueda ${new Date().toLocaleDateString()}`,
        filtros: {...filtros},
        fecha: new Date().toISOString()
      };

      const nuevosFavoritos = [nuevoFavorito, ...favoritosBusqueda].slice(0, 10);
      setFavoritosBusqueda(nuevosFavoritos);
      localStorage.setItem('puc_favoritos_busqueda', JSON.stringify(nuevosFavoritos));
    } catch (error) {
      console.warn('Error guardando favorito:', error);
    }
  }, [favoritosBusqueda]);

  // Función para aplicar favorito
  const aplicarFavorito = useCallback((favorito) => {
    setFiltros(favorito.filtros);
    setFiltrosLocales(favorito.filtros);
  }, [setFiltros]);

  // Validaciones en tiempo real
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
  const tieneActivosFiltros = FILTER_UTILS.tieneActivosFiltros(filtros);

  // ✅ NUEVO: Función para cargar todas las cuentas
  const handleCargarTodasLasCuentas = async () => {
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
      
      console.log('🚀 Usuario confirmó carga completa, iniciando...');
      
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
      
      console.log('✅ Carga completa finalizada exitosamente');
      
    } catch (error) {
      console.error('❌ Error en carga completa:', error);
      alert(`Error cargando todas las cuentas:\n${error.message}\n\nIntenta de nuevo o contacta al administrador.`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <FaFilter className="text-blue-600" />
            <span>Filtros PUC</span>
            {tieneActivosFiltros && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                Activos
              </span>
            )}
          </h2>
          
          {estadisticas && (
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
              📊 {estadisticas.total_encontrados?.toLocaleString()} encontrados
              {estadisticas.total_filtrados !== estadisticas.total_encontrados && (
                <span className="text-blue-600 ml-1">
                  / {estadisticas.total_filtrados?.toLocaleString()} filtrados
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onLimpiarFiltros}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
            icon={FaTimes}
            disabled={loading}
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
          
          <Button
            onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
            className={`px-3 py-1 text-sm transition-colors ${
              mostrarAvanzados 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            icon={FaCog}
          >
            Avanzado
          </Button>
        </div>
      </div>

      {/* Búsqueda Específica Mejorada */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
          <FaBullseye className="mr-2 text-green-600" />
          🎯 Búsqueda Inteligente de Cuenta
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <Input
                label="Código de Cuenta"
                placeholder="Ej: 1105, 11, 1 (solo números)"
                value={filtrosLocales.busqueda_especifica || ''}
                onChange={(e) => {
                  const valor = e.target.value.replace(/[^0-9]/g, '');
                  setFiltrosLocales({...filtrosLocales, busqueda_especifica: valor});
                  obtenerSugerencias(valor);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    aplicarBusquedaEspecifica(filtrosLocales.busqueda_especifica);
                  }
                }}
                onFocus={() => {
                  if (filtrosLocales.busqueda_especifica) {
                    obtenerSugerencias(filtrosLocales.busqueda_especifica);
                  }
                }}
                onBlur={() => {
                  // Pequeño delay para permitir clicks en sugerencias
                  setTimeout(() => setSugerenciasVisibles(false), 200);
                }}
                icon={FaBullseye}
                className="text-lg font-mono"
                disabled={loading}
              />
              
              {/* Sugerencias en tiempo real */}
              {sugerenciasVisibles && sugerencias.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {sugerencias.map((sugerencia, index) => (
                    <button
                      key={index}
                      onClick={() => aplicarBusquedaEspecifica(sugerencia.codigo)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-green-600">{sugerencia.codigo}</span>
                          <span className="ml-2">{sugerencia.descripcion}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {sugerencia.tipo}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Historial de búsquedas */}
            {historialBusquedas.length > 0 && (
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  <FaHistory className="inline mr-1" />
                  Búsquedas recientes:
                </label>
                <div className="flex flex-wrap gap-1">
                  {historialBusquedas.map((codigo, index) => (
                    <button
                      key={index}
                      onClick={() => aplicarBusquedaEspecifica(codigo)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-mono transition-colors"
                      disabled={loading}
                    >
                      {codigo}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => aplicarBusquedaEspecifica(filtrosLocales.busqueda_especifica)}
              disabled={!filtrosLocales.busqueda_especifica || loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              icon={FaSearch}
            >
              Buscar
            </Button>
            
            <Button
              onClick={() => {
                setFiltrosLocales({...filtrosLocales, busqueda_especifica: ''});
                setFiltros({...filtros, busqueda_especifica: '', pagina: 1});
                setSugerenciasVisibles(false);
              }}
              disabled={!filtros.busqueda_especifica || loading}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-50"
              icon={FaTimes}
            >
              Limpiar
            </Button>

            {filtros.busqueda_especifica && (
              <Button
                onClick={() => {
                  const nombre = prompt('Nombre para esta búsqueda:');
                  if (nombre) guardarEnFavoritos(filtros, nombre);
                }}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                icon={FaBookmark}
                disabled={loading}
              >
                Guardar
              </Button>
            )}
          </div>
        </div>

        {/* Información de la búsqueda activa */}
        {filtros.busqueda_especifica && (
          <div className="mt-3 p-3 bg-white border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-800 font-medium">🎯 Mostrando:</span>
                <code className="px-2 py-1 bg-green-100 text-green-900 rounded font-mono font-bold">
                  {filtros.busqueda_especifica}*
                </code>
                <span className="text-green-600">(cuenta + subcuentas)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros Generales */}
      {!filtros.busqueda_especifica && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaSearch className="mr-2 text-blue-600" />
            Filtros Generales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onChange={(e) => aplicarFiltroInteligentePorTipo(e.target.value)}
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

          {/* Filtros rápidos por clase */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center">
              <FaLayerGroup className="mr-2 text-purple-600" />
              Filtros Rápidos por Clase PUC
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
              {PUC_CLASSES.map(clase => (
                <button
                  key={clase.codigo}
                  onClick={() => aplicarFiltroClase(clase.codigo)}
                  className={`px-2 py-2 rounded text-xs font-medium transition-all hover:scale-105 border ${
                    filtros.codigo_clase === clase.codigo 
                      ? `${clase.color} ring-2 ring-blue-500 ring-offset-1` 
                      : `${clase.color} hover:opacity-80`
                  }`}
                  title={`Filtrar por ${clase.nombre} (${clase.naturaleza})`}
                  disabled={loading}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg">{clase.codigo}</div>
                    <div className="text-xs truncate">{clase.nombre}</div>
                    <div className="text-xs opacity-75">{clase.naturaleza}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resto del componente - Filtros Avanzados, Configuración, etc. */}
      {/* ... (mantener el resto del código anterior) ... */}

      {/* Configuración de Vista y Ordenamiento - SECCIÓN ACTUALIZADA */}
      <div className="border-t border-gray-200 pt-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <FaSortAmountDown className="mr-2 text-blue-600" />
          Vista y Ordenamiento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <Select
            label="Registros por página"
            value={filtrosLocales.limite || 50}
            onChange={(e) => {
              const nuevoLimite = parseInt(e.target.value);
              
              if (nuevoLimite >= 99999) {
                console.log('🚀 Límite TODAS seleccionado, ejecutando carga completa...');
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
              { value: 99999, label: `🚀 TODAS (${estadisticas?.total?.toLocaleString() || '?'}) - Carga completa` }
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
          
          {/* ✅ NUEVO BOTÓN: Cargar todas las cuentas */}
          <Button
            onClick={handleCargarTodasLasCuentas}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium"
            icon={FaRocket}
            disabled={loading}
            title={`Cargar TODAS las ${estadisticas?.total?.toLocaleString() || '?'} cuentas del sistema de una sola vez`}
          >
            🚀 TODAS ({estadisticas?.total?.toLocaleString() || '?'})
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
            className={`px-4 py-2 text-sm ${
              erroresValidacion.length > 0 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            icon={erroresValidacion.length > 0 ? FaTimes : FaSearch}
            disabled={loading}
          >
            {erroresValidacion.length > 0 ? 'Errores' : 'Aplicar'}
          </Button>
          
          <Button
            onClick={onExportar}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm"
            icon={FaDownload}
            disabled={loading}
          >
            Exportar
          </Button>

          {/* Controles específicos del árbol */}
          {vistaArbol && (
            <div className="flex gap-1">
              <Button
                onClick={onExpandirTodos}
                className="px-2 py-2 text-xs bg-green-100 hover:bg-green-200 text-green-700"
                icon={FaExpand}
                disabled={loading}
                title="Expandir todos los nodos"
              >
                Exp
              </Button>
              <Button
                onClick={onContraerTodos}
                className="px-2 py-2 text-xs bg-red-100 hover:bg-red-200 text-red-700"
                icon={FaCompress}
                disabled={loading}
                title="Contraer todos los nodos"
              >
                Con
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ NUEVA SECCIÓN: Información de datos cargados */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
          <FaDatabase className="mr-1" />
          Estado de Datos Cargados
        </h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">📊 En memoria:</span>
              <br />
              <span className="text-blue-900 font-mono">{cuentas?.length?.toLocaleString() || 0}</span>
            </div>
            <div>
              <span className="font-medium">🗄️ Total BD:</span>
              <br />
              <span className="text-blue-900 font-mono">{estadisticas?.total?.toLocaleString() || '?'}</span>
            </div>
            <div>
              <span className="font-medium">📄 Por página:</span>
              <br />
              <span className="text-blue-900 font-mono">{filtros.limite || 50}</span>
            </div>
            <div>
              <span className="font-medium">📈 Cobertura:</span>
              <br />
              <span className={`font-mono ${
                (cuentas?.length || 0) >= (estadisticas?.total || 1) ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {estadisticas?.total 
                  ? `${(((cuentas?.length || 0) / estadisticas.total) * 100).toFixed(1)}%`
                  : '?%'
                }
              </span>
            </div>
          </div>
          
          {/* Advertencia si no se han cargado todas las cuentas */}
          {estadisticas?.total && (cuentas?.length || 0) < estadisticas.total && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
              ⚠️ <strong>Advertencia:</strong> Solo tienes {cuentas?.length?.toLocaleString() || 0} de {estadisticas.total.toLocaleString()} cuentas cargadas.
              <br />
              Para ver la estructura completa del árbol, haz clic en "🚀 Todas" o aumenta el límite por página.
            </div>
          )}
          
          {/* Confirmación si se han cargado todas */}
          {estadisticas?.total && (cuentas?.length || 0) >= estadisticas.total && (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-800">
              ✅ <strong>Completo:</strong> Todas las cuentas están cargadas en memoria. 
              La vista de árbol mostrará la estructura completa.
            </div>
          )}
        </div>
      </div>

      {/* Filtros Avanzados (Solo cuando mostrarAvanzados es true) */}
      {mostrarAvanzados && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaCog className="mr-2 text-purple-600" />
            Filtros Avanzados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtrosLocales.solo_movimiento || false}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, solo_movimiento: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Solo con movimientos</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtrosLocales.solo_con_saldo || false}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, solo_con_saldo: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Solo con saldo</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtrosLocales.incluir_inactivas || false}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, incluir_inactivas: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Incluir inactivas</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtrosLocales.solo_con_movimientos || false}
                onChange={(e) => setFiltrosLocales({...filtrosLocales, solo_con_movimientos: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Con movimientos período</span>
            </label>
          </div>
        </div>
      )}

      {/* Favoritos de búsqueda */}
      {favoritosBusqueda.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
            <FaBookmark className="mr-2" />
            Búsquedas Guardadas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {favoritosBusqueda.map(favorito => (
              <div key={favorito.id} className="relative">
                <button
                  onClick={() => aplicarFavorito(favorito)}
                  className="w-full text-left p-2 bg-white border border-yellow-200 rounded hover:bg-yellow-50 transition-colors"
                  disabled={loading}
                >
                  <div className="font-medium text-sm text-yellow-800">{favorito.nombre}</div>
                  <div className="text-xs text-yellow-600">
                    {new Date(favorito.fecha).toLocaleDateString()}
                  </div>
                  {favorito.filtros.busqueda_especifica && (
                    <div className="text-xs font-mono text-yellow-700">
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
                  className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 text-xs"
                  title="Eliminar favorito"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validaciones y errores */}
      {erroresValidacion.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-red-800 mb-1">⚠️ Errores de Validación:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {erroresValidacion.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Información de filtros activos */}
      {tieneActivosFiltros && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <FaFilter className="mr-1" />
            Filtros Activos
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {FILTER_UTILS.obtenerFiltrosActivos(filtros).map((filtro, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full font-medium ${
                  filtro.tipo === 'especifica' 
                    ? 'bg-green-100 text-green-800' 
                    : filtro.tipo === 'clase'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {filtro.etiqueta}
              </span>
            ))}
          </div>
          
          {/* Botón para limpiar filtros específicos */}
          <div className="mt-2 flex gap-2">
            {filtros.busqueda_especifica && (
              <button
                onClick={() => {
                  setFiltros({...filtros, busqueda_especifica: '', pagina: 1});
                  setFiltrosLocales({...filtrosLocales, busqueda_especifica: ''});
                }}
                className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded hover:bg-green-50"
                disabled={loading}
              >
                ✕ Quitar búsqueda específica
              </button>
            )}
            
            {filtros.codigo_clase && (
              <button
                onClick={() => {
                  setFiltros({...filtros, codigo_clase: '', naturaleza: '', pagina: 1});
                  setFiltrosLocales({...filtrosLocales, codigo_clase: '', naturaleza: ''});
                }}
                className="text-xs bg-white border border-purple-200 text-purple-700 px-2 py-1 rounded hover:bg-purple-50"
                disabled={loading}
              >
                ✕ Quitar filtro de clase
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Aplicando filtros...</span>
        </div>
      )}

      {/* Tips y ayuda */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Tips de Uso:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>🎯 <strong>Búsqueda específica:</strong> Ingresa un código (ej: 1105) para ver esa cuenta + todas sus subcuentas</div>
          <div>🔍 <strong>Búsqueda general:</strong> Busca por nombre o código parcial en todas las cuentas</div>
          <div>⚡ <strong>Filtros rápidos:</strong> Haz click en las clases (1-9) para filtrar rápidamente</div>
          <div>💾 <strong>Favoritos:</strong> Guarda tus búsquedas frecuentes para reutilizarlas</div>
          <div>📊 <strong>Vista árbol:</strong> Cambia a vista jerárquica para ver la estructura del PUC</div>
        </div>
      </div>
    </div>
  );
};

export default PucFilters;
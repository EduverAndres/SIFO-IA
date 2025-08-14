// hooks/usePucData.js - VERSIÓN CORREGIDA
import { useState, useCallback, useEffect } from 'react';
import { pucApi } from '../api/pucApi';
import { extraerCodigosJerarquia, determinarNivelPorCodigo, determinarTipoPorCodigo, determinarNaturalezaPorClase } from '../utils/pucUtils';
import { DEFAULT_FILTERS } from '../constants/pucConstants';

export const usePucData = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [filtros, setFiltros] = useState(DEFAULT_FILTERS);
  const [paginacion, setPaginacion] = useState({
    total: 0,
    totalPaginas: 0,
    paginaActual: 1
  });
  const [todasCargadas, setTodasCargadas] = useState(false);

  // ✅ NUEVA FUNCIÓN MEJORADA: Cargar todas las cuentas con paginación interna si es necesario
  const cargarTodasLasCuentas = useCallback(async () => {
    setLoading(true);
    setTodasCargadas(false);
    
    try {
      console.log('🔄 Iniciando carga completa de TODAS las cuentas...');
      
      // Primero obtener las estadísticas para saber el total real
      const stats = await pucApi.obtenerEstadisticas();
      const totalReal = stats.data?.total || 0;
      console.log(`📊 Total de cuentas en BD: ${totalReal}`);
      
      if (totalReal === 0) {
        console.warn('⚠️ No hay cuentas en la base de datos');
        setCuentas([]);
        setPaginacion({
          total: 0,
          totalPaginas: 0,
          paginaActual: 1
        });
        setTodasCargadas(true);
        return [];
      }
      
      // Estrategia 1: Intentar cargar todas de una vez con límite muy alto
      const limiteMaximo = Math.max(totalReal, 999999);
      console.log(`🚀 Intentando cargar ${limiteMaximo} cuentas de una vez...`);
      
      const filtrosCompletos = {
        limite: String(limiteMaximo), // Usar el total real como límite
        pagina: '1',
        estado: 'ACTIVA',
        ordenar_por: 'codigo_completo',
        orden: 'ASC',
        incluir_inactivas: false
      };

      const response = await pucApi.obtenerCuentas(filtrosCompletos);
      let cuentasData = response.data || [];
      
      console.log(`✅ Primera carga: ${cuentasData.length} de ${response.total || totalReal} cuentas`);
      
      // Si no se cargaron todas, usar estrategia de paginación
      if (cuentasData.length < totalReal) {
        console.log('⚠️ No se cargaron todas las cuentas, usando estrategia de paginación...');
        
        // Estrategia 2: Cargar por lotes si el backend tiene límite
        const limitePorPagina = 1000; // Límite seguro
        const totalPaginas = Math.ceil(totalReal / limitePorPagina);
        let todasLasCuentas = [...cuentasData]; // Empezar con lo que ya tenemos
        
        // Si ya tenemos algunas, empezar desde la página 2
        const paginaInicio = cuentasData.length > 0 ? 2 : 1;
        
        for (let pagina = paginaInicio; pagina <= totalPaginas; pagina++) {
          console.log(`📄 Cargando página ${pagina} de ${totalPaginas}...`);
          
          const filtrosPagina = {
            ...filtrosCompletos,
            limite: String(limitePorPagina),
            pagina: String(pagina)
          };
          
          try {
            const respuestaPagina = await pucApi.obtenerCuentas(filtrosPagina);
            const cuentasPagina = respuestaPagina.data || [];
            
            if (cuentasPagina.length > 0) {
              // Evitar duplicados
              const codigosExistentes = new Set(todasLasCuentas.map(c => c.codigo_completo));
              const cuentasNuevas = cuentasPagina.filter(c => !codigosExistentes.has(c.codigo_completo));
              todasLasCuentas = [...todasLasCuentas, ...cuentasNuevas];
              
              console.log(`✅ Página ${pagina}: ${cuentasPagina.length} cuentas (Total acumulado: ${todasLasCuentas.length})`);
            } else {
              console.log(`⚠️ Página ${pagina} vacía, terminando...`);
              break;
            }
            
            // Si ya tenemos todas las cuentas esperadas, salir
            if (todasLasCuentas.length >= totalReal) {
              console.log('✅ Se han cargado todas las cuentas esperadas');
              break;
            }
          } catch (errorPagina) {
            console.error(`❌ Error cargando página ${pagina}:`, errorPagina);
            // Continuar con la siguiente página
          }
        }
        
        cuentasData = todasLasCuentas;
      }
      
      // Enriquecer los datos
      console.log('🔄 Enriqueciendo datos...');
      cuentasData = cuentasData.map(cuenta => ({
        ...cuenta,
        ...extraerCodigosJerarquia(cuenta.codigo_completo),
        nivel_calculado: determinarNivelPorCodigo(cuenta.codigo_completo),
        tipo_sugerido: determinarTipoPorCodigo(cuenta.codigo_completo),
        naturaleza_sugerida: determinarNaturalezaPorClase(cuenta.codigo_completo)
      }));

      // Ordenar por código
      cuentasData.sort((a, b) => a.codigo_completo.localeCompare(b.codigo_completo));
      
      console.log(`✅ CARGA COMPLETA: ${cuentasData.length} cuentas procesadas de ${totalReal} esperadas`);
      
      // Verificar si realmente tenemos todas
      const porcentajeCargado = (cuentasData.length / totalReal) * 100;
      if (porcentajeCargado < 100) {
        console.warn(`⚠️ ADVERTENCIA: Solo se cargó el ${porcentajeCargado.toFixed(1)}% de las cuentas`);
        console.warn(`   Esperadas: ${totalReal}`);
        console.warn(`   Cargadas: ${cuentasData.length}`);
        console.warn(`   Faltantes: ${totalReal - cuentasData.length}`);
      }

      setCuentas(cuentasData);
      setPaginacion({
        total: cuentasData.length,
        totalPaginas: 1,
        paginaActual: 1
      });
      setTodasCargadas(cuentasData.length >= totalReal);
      setError(null);
      
      return cuentasData;
      
    } catch (err) {
      const errorMsg = `Error cargando todas las cuentas: ${err.message}`;
      console.error('❌', errorMsg);
      setError(errorMsg);
      setTodasCargadas(false);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FUNCIÓN ACTUALIZADA: Cargar datos con detección automática
  const cargarDatos = useCallback(async (soloParaArbol = false) => {
    if (soloParaArbol) {
      return await cargarTodasLasCuentas();
    }
    
    setLoading(true);
    setTodasCargadas(false);
    
    try {
      console.log('🔄 Cargando cuentas con filtros:', filtros);
      
      // Si el límite es muy alto (99999), usar la función de carga completa
      if (filtros.limite && parseInt(filtros.limite) >= 99999) {
        console.log('📊 Límite alto detectado, usando carga completa...');
        return await cargarTodasLasCuentas();
      }
      
      const response = await pucApi.obtenerCuentas(filtros);
      let cuentasData = response.data || [];
      
      console.log(`📊 Resultado: ${cuentasData.length} cuentas de ${response.total || 0} totales`);
      
      if (response.total > cuentasData.length) {
        console.warn(`⚠️ ADVERTENCIA: Solo se cargaron ${cuentasData.length} de ${response.total} cuentas disponibles`);
        console.warn(`💡 Para ver todas las cuentas, usa el botón "🚀 Cargar Todas"`);
      }
      
      // Enriquecer datos
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
      setTodasCargadas(cuentasData.length >= (response.total || 0));
      setError(null);
      
    } catch (err) {
      setError('Error cargando cuentas: ' + err.message);
      setTodasCargadas(false);
    } finally {
      setLoading(false);
    }
  }, [filtros, cargarTodasLasCuentas]);

  // Crear cuenta
  const crearCuenta = useCallback(async (datosEnriquecidos) => {
    setLoading(true);
    try {
      await pucApi.crearCuenta(datosEnriquecidos);
      setSuccess('Cuenta creada exitosamente');
      await cargarDatos();
      await cargarEstadisticas();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarDatos]);

  // Actualizar cuenta
  const actualizarCuenta = useCallback(async (id, datosEnriquecidos) => {
    setLoading(true);
    try {
      await pucApi.actualizarCuenta(id, datosEnriquecidos);
      setSuccess('Cuenta actualizada exitosamente');
      await cargarDatos();
      await cargarEstadisticas();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarDatos]);

  // Eliminar cuenta
  const eliminarCuenta = useCallback(async (id) => {
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
  }, [cargarDatos]);

  // Cambiar página
  const cambiarPagina = useCallback((nuevaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: nuevaPagina }));
  }, []);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros(DEFAULT_FILTERS);
    setTodasCargadas(false);
  }, []);

  // Aplicar filtro inteligente por tipo
  const aplicarFiltroInteligentePorTipo = useCallback((tipoSeleccionado) => {
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
    setTodasCargadas(false);
  }, [filtros]);

  // Descargar template
  const descargarTemplate = useCallback(async () => {
    setLoading(true);
    try {
      await pucApi.descargarTemplate(true);
      setSuccess('Template descargado exitosamente');
    } catch (err) {
      setError('Error descargando template: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar mensajes
  const limpiarError = useCallback(() => setError(null), []);
  const limpiarSuccess = useCallback(() => setSuccess(null), []);

  // ✅ Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await pucApi.obtenerEstadisticas();
      setEstadisticas(response.data);
      return response.data;
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError('Error cargando estadísticas: ' + error.message);
      return null;
    }
  }, []);

  // ✅ Verificar total de cuentas
  const verificarTotalCuentas = useCallback(async () => {
    try {
      const stats = await pucApi.obtenerEstadisticas();
      console.log('📊 Total de cuentas en BD:', stats.data.total);
      return stats.data;
    } catch (error) {
      console.error('Error verificando total de cuentas:', error);
      return null;
    }
  }, []);

  // Efecto para cargar datos al cambiar filtros
  useEffect(() => {
    cargarDatos();
    cargarEstadisticas();
  }, [filtros]); // Solo depender de filtros, no de cargarDatos para evitar loop

  // Auto-limpiar mensajes
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

  return {
    // Estados
    cuentas,
    loading,
    error,
    success,
    estadisticas,
    filtros,
    paginacion,
    todasCargadas, // ✅ NUEVO
    
    // Setters
    setFiltros,
    
    // Acciones
    cargarDatos,
    cargarEstadisticas,
    crearCuenta,
    actualizarCuenta,
    eliminarCuenta,
    cambiarPagina,
    limpiarFiltros,
    aplicarFiltroInteligentePorTipo,
    descargarTemplate,
    limpiarError,
    limpiarSuccess,
    
    // Métodos mejorados
    cargarTodasLasCuentas,
    verificarTotalCuentas
  };
};
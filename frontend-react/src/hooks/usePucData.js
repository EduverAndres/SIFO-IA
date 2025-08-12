// hooks/usePucData.js
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

  // Cargar datos con filtros
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pucApi.obtenerCuentas(filtros);
      let cuentasData = response.data || [];
      
      // Procesar datos para enriquecer con información jerárquica
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
      setError(null);
    } catch (err) {
      setError('Error cargando cuentas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await pucApi.obtenerEstadisticas();
      setEstadisticas(response.data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, []);

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
  }, [cargarDatos, cargarEstadisticas]);

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
  }, [cargarDatos, cargarEstadisticas]);

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
  }, [cargarDatos, cargarEstadisticas]);

  // Cambiar página
  const cambiarPagina = useCallback((nuevaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: nuevaPagina }));
  }, []);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros(DEFAULT_FILTERS);
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

  // Efecto para cargar datos al cambiar filtros
  useEffect(() => {
    cargarDatos();
    cargarEstadisticas();
  }, [cargarDatos, cargarEstadisticas]);

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
    limpiarSuccess
  };
};
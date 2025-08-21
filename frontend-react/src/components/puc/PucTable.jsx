// components/puc/PucTable.jsx - VERSIÓN OPTIMIZADA PARA PERFORMANCE
import React, { useState, useMemo, useCallback } from 'react';
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaArrowUp, 
  FaArrowDown, 
  FaBullseye, 
  FaDatabase, 
  FaRocket,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExpand,
  FaCompress,
  FaDownload,
  FaCheckCircle
} from 'react-icons/fa';
import { 
  formatearSaldo, 
  formatearMovimientos, 
  obtenerColorNivel, 
  obtenerColorNaturaleza, 
  obtenerColorTipoCuenta 
} from '../../utils/formatters';
import { obtenerIconoTipoCuenta } from '../../utils/pucUtils';
import { FILTER_UTILS } from '../../constants/pucConstants';
import Button from '../ui/Button';

// 🚀 COMPONENTE OPTIMIZADO DE FILA (MEMOIZADO)
const PucTableRow = React.memo(({ 
  cuenta, 
  index, 
  vistaCompacta, 
  esCoincidenciaEspecifica, 
  esCuentaExacta, 
  estaSeleccionada,
  filtros,
  onVerDetalle,
  onEditar,
  onEliminar,
  onToggleSeleccion
}) => {
  const coincideEspecifica = esCoincidenciaEspecifica(cuenta);
  const esExacta = esCuentaExacta(cuenta);

  // 🎯 HANDLERS MEMOIZADOS
  const handleVerDetalle = useCallback(() => onVerDetalle(cuenta), [cuenta, onVerDetalle]);
  const handleEditar = useCallback(() => onEditar(cuenta), [cuenta, onEditar]);
  const handleEliminar = useCallback(() => {
    const confirmar = window.confirm(
      `¿Eliminar cuenta ${cuenta.codigo_completo}?\n${cuenta.descripcion}`
    );
    if (confirmar) onEliminar(cuenta.id);
  }, [cuenta, onEliminar]);
  const handleToggle = useCallback(() => onToggleSeleccion(cuenta.id), [cuenta.id, onToggleSeleccion]);

  return (
    <tr 
      className={`
        group transition-colors duration-200 hover:bg-blue-50/50
        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
        ${esExacta 
          ? 'bg-gradient-to-r from-emerald-100 to-green-50 border-l-4 border-emerald-500' 
          : coincideEspecifica 
          ? 'bg-gradient-to-r from-emerald-50 to-green-25 border-l-2 border-emerald-300' 
          : ''
        }
        ${estaSeleccionada ? 'bg-blue-100 ring-2 ring-blue-300' : ''}
      `}
    >
      {/* Checkbox */}
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={estaSeleccionada}
          onChange={handleToggle}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
      </td>

      {/* ID */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
          #{cuenta.id}
        </span>
      </td>

      {/* Código */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-sm
            ${cuenta.nivel === 1 ? 'bg-purple-100 text-purple-600' :
              cuenta.nivel === 2 ? 'bg-blue-100 text-blue-600' :
              cuenta.nivel === 3 ? 'bg-green-100 text-green-600' :
              cuenta.nivel === 4 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}
          `}>
            {obtenerIconoTipoCuenta(cuenta.tipo_cuenta)}
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-gray-900">
                {cuenta.codigo_completo}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorNivel(cuenta.nivel_calculado || cuenta.nivel)}`}>
                N{cuenta.nivel_calculado || cuenta.nivel}
              </span>
              
              {esExacta && (
                <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  <FaBullseye className="inline mr-1" />
                  EXACTA
                </span>
              )}
              {coincideEspecifica && !esExacta && (
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                  SUBCUENTA
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Descripción */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className={`
            font-medium
            ${esExacta ? 'text-emerald-800' : 
              coincideEspecifica ? 'text-emerald-700' : 'text-gray-900'}
          `}>
            {cuenta.descripcion || (
              <span className="italic text-gray-400">Sin descripción</span>
            )}
          </div>
          
          {!vistaCompacta && cuenta.codigo_padre && (
            <div className="text-xs text-gray-500">
              Padre: <span className="font-mono bg-gray-100 px-1 rounded">{cuenta.codigo_padre}</span>
            </div>
          )}
          
          {filtros.busqueda_especifica && coincideEspecifica && (
            <div className="text-xs">
              {esExacta ? (
                <span className="text-emerald-700 font-medium">🎯 Cuenta buscada</span>
              ) : (
                <span className="text-emerald-600">🌿 Subcuenta de {filtros.busqueda_especifica}</span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Columnas adicionales en vista normal */}
      {!vistaCompacta && (
        <>
          {/* Tipo */}
          <td className="px-4 py-3">
            <span className={`px-3 py-1 rounded text-xs font-medium ${obtenerColorTipoCuenta(cuenta.tipo_cuenta)}`}>
              {cuenta.tipo_cuenta}
            </span>
          </td>

          {/* Naturaleza */}
          <td className="px-4 py-3">
            <span className={`px-3 py-1 rounded text-xs font-medium ${obtenerColorNaturaleza(cuenta.naturaleza)}`}>
              {cuenta.naturaleza}
            </span>
          </td>

          {/* Nivel */}
          <td className="px-4 py-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${obtenerColorNivel(cuenta.nivel_calculado || cuenta.nivel)}`}>
              {cuenta.nivel_calculado || cuenta.nivel}
            </span>
          </td>

          {/* Saldo Inicial */}
          <td className="px-4 py-3 text-right">
            <span className={`font-mono text-sm ${
              (cuenta.saldo_inicial || 0) > 0 ? 'text-blue-600' : 
              (cuenta.saldo_inicial || 0) < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {formatearSaldo(cuenta.saldo_inicial)}
            </span>
          </td>

          {/* Saldo Final */}
          <td className="px-4 py-3 text-right">
            <span className={`font-mono text-sm ${
              (cuenta.saldo_final || 0) > 0 ? 'text-green-600' : 
              (cuenta.saldo_final || 0) < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {formatearSaldo(cuenta.saldo_final)}
            </span>
          </td>

          {/* Movimientos Débitos */}
          <td className="px-4 py-3 text-right">
            <span className="font-mono text-sm text-red-600">
              {formatearMovimientos(cuenta.movimientos_debitos)}
            </span>
          </td>

          {/* Movimientos Créditos */}
          <td className="px-4 py-3 text-right">
            <span className="font-mono text-sm text-green-600">
              {formatearMovimientos(cuenta.movimientos_creditos)}
            </span>
          </td>

          {/* Estado */}
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                cuenta.estado === 'ACTIVA' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                cuenta.estado === 'ACTIVA' ? 'text-green-700' : 'text-red-700'
              }`}>
                {cuenta.estado}
              </span>
            </div>
          </td>
        </>
      )}

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleVerDetalle}
            className="p-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 border border-blue-200/50"
            title="Ver detalles"
          >
            <FaEye className="text-sm" />
          </button>
          <button
            onClick={handleEditar}
            className="p-2 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200 border border-green-200/50"
            title="Editar"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={handleEliminar}
            className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 border border-red-200/50"
            title="Eliminar"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </td>
    </tr>
  );
});

// 🚀 COMPONENTE PRINCIPAL OPTIMIZADO
const PucTable = ({ 
  cuentas, 
  paginacion, 
  filtros, 
  onVerDetalle, 
  onEditar, 
  onEliminar, 
  onCambiarPagina,
  setFiltros,
  estadisticas = null,
  resumenDatos = {},
  todasCargadas = false,
  onCargarTodasLasCuentas = null
}) => {
  // Estados locales para la tabla
  const [vistaCompacta, setVistaCompacta] = useState(false);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState('asc');
  const [filasSeleccionadas, setFilasSeleccionadas] = useState(new Set());

  // 🎯 FUNCIONES MEMOIZADAS
  const esCoincidenciaEspecifica = useCallback((cuenta) => {
    return filtros.busqueda_especifica && 
           cuenta.codigo_completo.startsWith(filtros.busqueda_especifica);
  }, [filtros.busqueda_especifica]);

  const esCuentaExacta = useCallback((cuenta) => {
    return filtros.busqueda_especifica && 
           cuenta.codigo_completo === filtros.busqueda_especifica;
  }, [filtros.busqueda_especifica]);

  // 📊 CÁLCULOS MEMOIZADOS
  const estadisticasCalculadas = useMemo(() => {
    const totalRealCuentas = resumenDatos?.totalBD || estadisticas?.total || paginacion.total;
    const cuentasEnMemoria = resumenDatos?.enMemoria || cuentas.length;
    const porcentajeCobertura = FILTER_UTILS.calcularCobertura(cuentasEnMemoria, totalRealCuentas);
    
    return { totalRealCuentas, cuentasEnMemoria, porcentajeCobertura };
  }, [resumenDatos, estadisticas, paginacion.total, cuentas.length]);

  // 🎯 HANDLERS OPTIMIZADOS
  const handleCargarTodasDesdeTabla = useCallback(async () => {
    if (!onCargarTodasLasCuentas) return;
    
    const confirmar = window.confirm(
      `¿Cargar TODAS las ${estadisticasCalculadas.totalRealCuentas.toLocaleString()} cuentas del sistema?\n\n` +
      `Esto te permitirá ver todos los datos sin paginación.`
    );
    
    if (confirmar) {
      await onCargarTodasLasCuentas();
    }
  }, [onCargarTodasLasCuentas, estadisticasCalculadas.totalRealCuentas]);

  const handleSort = useCallback((columna) => {
    if (columnaOrden === columna) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnaOrden(columna);
      setDireccionOrden('asc');
    }
  }, [columnaOrden, direccionOrden]);

  const getSortIcon = useCallback((columna) => {
    if (columnaOrden !== columna) return <FaSort className="text-gray-400 text-xs" />;
    return direccionOrden === 'asc' 
      ? <FaSortUp className="text-blue-500 text-xs" />
      : <FaSortDown className="text-blue-500 text-xs" />;
  }, [columnaOrden, direccionOrden]);

  const toggleSeleccionFila = useCallback((id) => {
    setFilasSeleccionadas(prev => {
      const nuevas = new Set(prev);
      if (nuevas.has(id)) {
        nuevas.delete(id);
      } else {
        nuevas.add(id);
      }
      return nuevas;
    });
  }, []);

  const seleccionarTodas = useCallback(() => {
    setFilasSeleccionadas(prev => {
      if (prev.size === cuentas.length) {
        return new Set();
      } else {
        return new Set(cuentas.map(c => c.id));
      }
    });
  }, [cuentas]);

  return (
    <div className="space-y-6">
      {/* Header simplificado */}
      <div className="space-y-4">
        {/* Banner de búsqueda específica */}
        {filtros.busqueda_especifica && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <FaBullseye className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-800">Filtro específico activo</h3>
                <p className="text-sm text-emerald-600">
                  Mostrando solo cuentas que empiecen con 
                  <code className="mx-1 px-2 py-1 bg-emerald-100 rounded font-mono font-bold text-emerald-700">
                    {filtros.busqueda_especifica}
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Panel de información simplificado */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Estadísticas principales */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border">
                <FaDatabase className="text-blue-500" />
                <div>
                  <div className="text-sm font-semibold text-blue-800">
                    {cuentas.length.toLocaleString()} / {paginacion.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600">Mostrando</div>
                </div>
              </div>

              <div className={`
                flex items-center space-x-3 px-4 py-2 rounded-lg border
                ${estadisticasCalculadas.porcentajeCobertura >= 100 
                  ? 'bg-green-100 border-green-200 text-green-800' 
                  : 'bg-yellow-100 border-yellow-200 text-yellow-800'
                }
              `}>
                <div className="text-sm font-semibold">
                  {estadisticasCalculadas.porcentajeCobertura}% cargado
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setVistaCompacta(!vistaCompacta)}
                className={`
                  p-2 rounded border transition-colors duration-200
                  ${vistaCompacta 
                    ? 'bg-purple-100 border-purple-300 text-purple-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }
                `}
                title={vistaCompacta ? 'Vista normal' : 'Vista compacta'}
              >
                {vistaCompacta ? <FaExpand /> : <FaCompress />}
              </button>

              {!todasCargadas && onCargarTodasLasCuentas && estadisticasCalculadas.porcentajeCobertura < 100 && (
                <Button
                  onClick={handleCargarTodasDesdeTabla}
                  variant="primary"
                  size="sm"
                  icon={FaRocket}
                >
                  Cargar Todas
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla optimizada */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header de la tabla */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-gray-800">Plan de Cuentas</h3>
              {filasSeleccionadas.size > 0 && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {filasSeleccionadas.size} seleccionadas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabla con scroll optimizado */}
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <tr>
                <th className="w-12 px-3 py-4">
                  <input
                    type="checkbox"
                    checked={filasSeleccionadas.size === cuentas.length && cuentas.length > 0}
                    onChange={seleccionarTodas}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>

                <th className="px-4 py-4 text-left">
                  <button 
                    onClick={() => handleSort('id')}
                    className="flex items-center space-x-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>ID</span>
                    {getSortIcon('id')}
                  </button>
                </th>

                <th className="px-4 py-4 text-left min-w-[150px]">
                  <button 
                    onClick={() => handleSort('codigo_completo')}
                    className="flex items-center space-x-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>Código</span>
                    {getSortIcon('codigo_completo')}
                  </button>
                </th>

                <th className="px-4 py-4 text-left min-w-[250px]">
                  <span className="font-semibold text-gray-700">Descripción</span>
                </th>

                {!vistaCompacta && (
                  <>
                    <th className="px-4 py-4 text-left">
                      <span className="font-semibold text-gray-700">Tipo</span>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <span className="font-semibold text-gray-700">Naturaleza</span>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <span className="font-semibold text-gray-700">Nivel</span>
                    </th>
                    <th className="px-4 py-4 text-right">
                      <span className="font-semibold text-gray-700">Saldo Inicial</span>
                    </th>
                    <th className="px-4 py-4 text-right">
                      <span className="font-semibold text-gray-700">Saldo Final</span>
                    </th>
                    <th className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 font-semibold text-gray-700">
                        <FaArrowDown className="text-red-500" />
                        <span>Débitos</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 font-semibold text-gray-700">
                        <FaArrowUp className="text-green-500" />
                        <span>Créditos</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <span className="font-semibold text-gray-700">Estado</span>
                    </th>
                  </>
                )}

                <th className="px-4 py-4 text-center">
                  <span className="font-semibold text-gray-700">Acciones</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {cuentas.map((cuenta, index) => (
                <PucTableRow
                  key={cuenta.id}
                  cuenta={cuenta}
                  index={index}
                  vistaCompacta={vistaCompacta}
                  esCoincidenciaEspecifica={esCoincidenciaEspecifica}
                  esCuentaExacta={esCuentaExacta}
                  estaSeleccionada={filasSeleccionadas.has(cuenta.id)}
                  filtros={filtros}
                  onVerDetalle={onVerDetalle}
                  onEditar={onEditar}
                  onEliminar={onEliminar}
                  onToggleSeleccion={toggleSeleccionFila}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación simplificada */}
      {paginacion.totalPaginas > 1 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Mostrando {cuentas.length === 0 ? 0 : ((paginacion.paginaActual - 1) * parseInt(filtros.limite || '100')) + 1} - {Math.min(paginacion.paginaActual * parseInt(filtros.limite || '100'), paginacion.total)} de {paginacion.total.toLocaleString()} resultados
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => onCambiarPagina(paginacion.paginaActual - 1)}
                disabled={paginacion.paginaActual === 1}
                variant="ghost"
                size="sm"
              >
                Anterior
              </Button>

              <span className="px-3 py-1 bg-white border rounded text-sm">
                {paginacion.paginaActual} / {paginacion.totalPaginas}
              </span>

              <Button
                onClick={() => onCambiarPagina(paginacion.paginaActual + 1)}
                disabled={paginacion.paginaActual === paginacion.totalPaginas}
                variant="ghost"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PucTable;
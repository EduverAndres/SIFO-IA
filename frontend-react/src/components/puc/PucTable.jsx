// components/puc/PucTable.jsx - VERSIÓN COMPLETA Y ACTUALIZADA
import React from 'react';
import { FaEye, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaBullseye, FaDatabase, FaRocket } from 'react-icons/fa';
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
  // ✅ NUEVOS PROPS
  resumenDatos = {},
  todasCargadas = false,
  onCargarTodasLasCuentas = null
}) => {
  // Función para determinar si una cuenta coincide con la búsqueda específica
  const esCoincidenciaEspecifica = (cuenta) => {
    return filtros.busqueda_especifica && 
           cuenta.codigo_completo.startsWith(filtros.busqueda_especifica);
  };

  // Función para determinar si es la cuenta exacta buscada
  const esCuentaExacta = (cuenta) => {
    return filtros.busqueda_especifica && 
           cuenta.codigo_completo === filtros.busqueda_especifica;
  };

  // ✅ CÁLCULOS MEJORADOS
  const totalRealCuentas = resumenDatos?.totalBD || estadisticas?.total || paginacion.total;
  const cuentasEnMemoria = resumenDatos?.enMemoria || cuentas.length;
  const porcentajeCobertura = FILTER_UTILS.calcularCobertura(cuentasEnMemoria, totalRealCuentas);

  // ✅ FUNCIÓN PARA MANEJAR CARGA MASIVA DESDE LA TABLA
  const handleCargarTodasDesdeTabla = async () => {
    if (!onCargarTodasLasCuentas) return;
    
    const confirmar = window.confirm(
      `¿Cargar TODAS las ${totalRealCuentas.toLocaleString()} cuentas del sistema?\n\n` +
      `Esto te permitirá ver todos los datos sin paginación.`
    );
    
    if (confirmar) {
      await onCargarTodasLasCuentas();
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* ✅ HEADER MEJORADO: Información de estado de datos */}
      <div className="mb-4 space-y-3">
        {/* Header informativo si hay búsqueda específica */}
        {filtros.busqueda_especifica && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <FaBullseye className="text-green-600" />
              <span className="text-green-800 font-medium">
                Filtro específico activo: Mostrando solo cuentas que empiecen con 
                <code className="mx-1 px-2 py-1 bg-green-100 rounded font-mono font-bold">
                  {filtros.busqueda_especifica}
                </code>
              </span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              🎯 Cuenta exacta: {filtros.busqueda_especifica} | 🌿 Subcuentas: {filtros.busqueda_especifica}XXXXX
            </div>
          </div>
        )}

        {/* ✅ INFORMACIÓN GENERAL MEJORADA */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FaDatabase className="text-blue-600" />
              <span className="font-medium text-blue-800">
                📊 Mostrando {cuentas.length.toLocaleString()} de {paginacion.total.toLocaleString()}
              </span>
              {filtros.busqueda_especifica && (
                <span className="text-green-600 font-medium">
                  (filtradas por: {filtros.busqueda_especifica}*)
                </span>
              )}
            </div>

            {/* Información de cobertura */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Base de datos:</span>
              <span className="font-mono font-bold text-gray-800">
                {totalRealCuentas.toLocaleString()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                porcentajeCobertura >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {porcentajeCobertura}% cargado
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-xs text-blue-600">
              Página {paginacion.paginaActual} de {paginacion.totalPaginas}
            </div>
            
            {/* ✅ BOTÓN DE CARGA RÁPIDA */}
            {!todasCargadas && onCargarTodasLasCuentas && porcentajeCobertura < 100 && (
              <Button
                onClick={handleCargarTodasDesdeTabla}
                className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                icon={FaRocket}
                title={`Cargar todas las ${totalRealCuentas.toLocaleString()} cuentas`}
              >
                Cargar Todas
              </Button>
            )}
          </div>
        </div>

        {/* ✅ ADVERTENCIA SI DATOS INCOMPLETOS */}
        {!todasCargadas && porcentajeCobertura < 100 && !filtros.busqueda_especifica && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-yellow-800">
                  <strong>Datos incompletos:</strong> Solo tienes {cuentasEnMemoria.toLocaleString()} de {totalRealCuentas.toLocaleString()} cuentas cargadas.
                </span>
              </div>
              {onCargarTodasLasCuentas && (
                <Button
                  onClick={handleCargarTodasDesdeTabla}
                  className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white"
                  icon={FaRocket}
                >
                  Cargar Todas
                </Button>
              )}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              Para acceder a todas las cuentas y tener la vista completa, carga todos los datos.
            </div>
          </div>
        )}

        {/* ✅ CONFIRMACIÓN SI DATOS COMPLETOS */}
        {todasCargadas && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-green-600">✅</span>
              <span className="text-green-800">
                <strong>Datos completos:</strong> Todas las {totalRealCuentas.toLocaleString()} cuentas están cargadas.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ✅ TABLA PRINCIPAL */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">ID</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
              Código
              {filtros.busqueda_especifica && (
                <div className="text-xs font-normal text-green-600 mt-1">
                  Filtro: {filtros.busqueda_especifica}*
                </div>
              )}
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[250px]">Descripción</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">Tipo</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[90px]">Naturaleza</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[60px]">Nivel</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Saldo Inicial</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">Saldo Final</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
              <div className="flex items-center">
                <FaArrowDown className="text-red-500 mr-1" />
                Mov. Débitos
              </div>
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
              <div className="flex items-center">
                <FaArrowUp className="text-green-500 mr-1" />
                Mov. Créditos
              </div>
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">Estado</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700 min-w-[120px]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.map((cuenta, index) => {
            const coincideEspecifica = esCoincidenciaEspecifica(cuenta);
            const esExacta = esCuentaExacta(cuenta);
            
            return (
              <tr 
                key={cuenta.id} 
                className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                } ${
                  esExacta ? 'bg-green-100 border-l-4 border-l-green-500' : 
                  coincideEspecifica ? 'bg-green-25 border-l-2 border-l-green-300' : ''
                }`}
              >
                <td className="py-2 px-2 border-r border-gray-100 text-xs">
                  <span className="font-mono font-bold text-blue-600">#{cuenta.id}</span>
                </td>
                <td className="py-2 px-2 border-r border-gray-100 text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">{obtenerIconoTipoCuenta(cuenta.tipo_cuenta)}</span>
                    <span className="font-mono font-bold text-gray-900">{cuenta.codigo_completo}</span>
                    <span className={`px-1 py-0.5 rounded text-xs ${obtenerColorNivel(cuenta.nivel_calculado || cuenta.nivel)}`}>
                      N{cuenta.nivel_calculado || cuenta.nivel}
                    </span>
                    
                    {/* Indicadores de búsqueda específica */}
                    {esExacta && (
                      <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded text-xs font-bold">
                        🎯
                      </span>
                    )}
                    {coincideEspecifica && !esExacta && (
                      <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                        🌿
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-gray-100 text-xs">
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 truncate" title={cuenta.descripcion}>
                      {cuenta.descripcion || 'Sin descripción'}
                    </div>
                    {cuenta.codigo_padre && (
                      <div className="text-xs text-gray-500">
                        Padre: {cuenta.codigo_padre}
                      </div>
                    )}
                    
                    {/* Información adicional para búsqueda específica */}
                    {filtros.busqueda_especifica && coincideEspecifica && (
                      <div className="text-xs mt-1">
                        {esExacta ? (
                          <span className="text-green-700 font-medium">🎯 Cuenta buscada</span>
                        ) : (
                          <span className="text-green-600">🌿 Subcuenta de {filtros.busqueda_especifica}</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-gray-100 text-xs">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorTipoCuenta(cuenta.tipo_cuenta)}`}>
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
                    (cuenta.saldo_inicial || 0) > 0 ? 'text-blue-600' : 
                    (cuenta.saldo_inicial || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {formatearSaldo(cuenta.saldo_inicial)}
                  </span>
                </td>
                <td className="py-2 px-2 border-r border-gray-100 text-xs text-right">
                  <span className={`font-mono ${
                    (cuenta.saldo_final || 0) > 0 ? 'text-green-600' : 
                    (cuenta.saldo_final || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {formatearSaldo(cuenta.saldo_final)}
                  </span>
                </td>
                <td className="py-2 px-2 border-r border-gray-100 text-xs text-right">
                  <span className="font-mono text-red-600">
                    {formatearMovimientos(cuenta.movimientos_debitos)}
                  </span>
                </td>
                <td className="py-2 px-2 border-r border-gray-100 text-xs text-right">
                  <span className="font-mono text-green-600">
                    {formatearMovimientos(cuenta.movimientos_creditos)}
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
                      onClick={() => onVerDetalle(cuenta)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    <button
                      onClick={() => onEditar(cuenta)}
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
                        if (confirmar) onEliminar(cuenta.id);
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
          })}
        </tbody>
      </table>

      {/* ✅ INFORMACIÓN DE RESULTADOS ESPECÍFICOS */}
      {filtros.busqueda_especifica && cuentas.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <div className="flex items-center space-x-2 mb-2">
              <FaBullseye className="text-green-600" />
              <span className="font-medium">Resultados de búsqueda específica:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                🎯 <strong>Cuenta exacta:</strong> {filtros.busqueda_especifica}
              </div>
              <div>
                🌿 <strong>Subcuentas:</strong> Códigos que empiecen con {filtros.busqueda_especifica}
              </div>
              <div>
                📊 <strong>Total encontradas:</strong> {paginacion.total.toLocaleString()} cuentas
              </div>
              <div>
                📋 <strong>Mostrando:</strong> {cuentas.length} en esta página
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ PAGINACIÓN MEJORADA */}
      {(paginacion.totalPaginas > 1 || cuentas.length > 0) && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Información de registros mejorada */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
              <span>
                Mostrando {cuentas.length === 0 ? 0 : ((paginacion.paginaActual - 1) * parseInt(filtros.limite || '100')) + 1} - {Math.min(paginacion.paginaActual * parseInt(filtros.limite || '100'), paginacion.total)} de {paginacion.total.toLocaleString()} resultados
                {filtros.busqueda_especifica && (
                  <span className="text-green-600 font-medium ml-1">
                    (filtrado por {filtros.busqueda_especifica}*)
                  </span>
                )}
              </span>
              
              <div className="flex items-center space-x-2">
                <span>Mostrar:</span>
                <select 
                  value={filtros.limite} 
                  onChange={(e) => {
                    const nuevoLimite = parseInt(e.target.value);
                    setFiltros({...filtros, limite: nuevoLimite, pagina: 1});
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                  <option value={25000}>25,000</option>
                  <option value={99999}>
                    🚀 TODAS ({totalRealCuentas.toLocaleString()})
                  </option>
                </select>
                <span>por página</span>
              </div>
            </div>

            {/* Controles de navegación - Solo mostrar si hay múltiples páginas */}
            {paginacion.totalPaginas > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onCambiarPagina(1)}
                  disabled={paginacion.paginaActual === 1}
                  className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  ««
                </Button>
                
                <Button
                  onClick={() => onCambiarPagina(paginacion.paginaActual - 1)}
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
                        onCambiarPagina(pagina);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                  />
                  <span className="text-sm text-gray-600">de {paginacion.totalPaginas}</span>
                </div>

                <Button
                  onClick={() => onCambiarPagina(paginacion.paginaActual + 1)}
                  disabled={paginacion.paginaActual === paginacion.totalPaginas}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Siguiente »
                </Button>
                
                <Button
                  onClick={() => onCambiarPagina(paginacion.totalPaginas)}
                  disabled={paginacion.paginaActual === paginacion.totalPaginas}
                  className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  »»
                </Button>
              </div>
            )}
          </div>
          
          {/* ✅ INFORMACIÓN ADICIONAL MEJORADA */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Información de cobertura */}
            {totalRealCuentas > paginacion.total && (
              <div className="text-purple-600 bg-purple-50 p-2 rounded">
                <strong>💡 Info:</strong> Hay {totalRealCuentas.toLocaleString()} cuentas en total en la base de datos. 
                Los filtros actuales muestran {paginacion.total.toLocaleString()} cuentas.
                {filtros.busqueda_especifica && (
                  <span className="ml-1">
                    La búsqueda específica por "{filtros.busqueda_especifica}" está limitando los resultados.
                  </span>
                )}
              </div>
            )}
            
            {/* Información de estado de carga */}
            <div className={`p-2 rounded ${
              todasCargadas ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <strong>{todasCargadas ? '✅ Datos completos:' : '⚠️ Datos parciales:'}</strong> 
              {todasCargadas 
                ? ` Todas las ${totalRealCuentas.toLocaleString()} cuentas están cargadas.`
                : ` Solo ${porcentajeCobertura}% de las cuentas están cargadas.`
              }
              {!todasCargadas && onCargarTodasLasCuentas && (
                <button
                  onClick={handleCargarTodasDesdeTabla}
                  className="ml-2 underline hover:no-underline"
                >
                  Cargar todas
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PucTable;
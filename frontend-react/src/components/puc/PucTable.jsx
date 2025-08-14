// components/puc/PucTable.jsx
import React from 'react';
import { FaEye, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaBullseye } from 'react-icons/fa';
import { 
  formatearSaldo, 
  formatearMovimientos, 
  obtenerColorNivel, 
  obtenerColorNaturaleza, 
  obtenerColorTipoCuenta 
} from '../../utils/formatters';
import { obtenerIconoTipoCuenta } from '../../utils/pucUtils';
import Button from '../ui/Button';

const PucTable = ({ 
  cuentas, 
  paginacion, 
  filtros, 
  onVerDetalle, 
  onEditar, 
  onEliminar, 
  onCambiarPagina,
  setFiltros
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

  return (
    <div className="overflow-x-auto">
      {/* Header informativo si hay búsqueda específica */}
      {filtros.busqueda_especifica && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
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

      {/* Información de resultados específicos */}
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
                📊 <strong>Total encontradas:</strong> {paginacion.total} cuentas
              </div>
              <div>
                📋 <strong>Mostrando:</strong> {cuentas.length} en esta página
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      {paginacion.totalPaginas > 1 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Información de registros */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                Mostrando {((paginacion.paginaActual - 1) * filtros.limite) + 1} - {Math.min(paginacion.paginaActual * filtros.limite, paginacion.total)} de {paginacion.total} resultados
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
          </div>
        </div>
      )}
    </div>
  );
};

export default PucTable;
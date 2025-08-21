import React, { useMemo, useCallback } from 'react';
import { 
  FaExclamationTriangle, 
  FaTree, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaChevronDown,
  FaChevronRight,
  FaBullseye
} from 'react-icons/fa';
import { 
  obtenerColorNivel, 
  obtenerColorNaturaleza, 
  obtenerColorTipoCuenta 
} from '../../utils/formatters';
import { obtenerIconoTipoCuenta } from '../../utils/pucUtils';

// 🚀 NODO MEMOIZADO - CORREGIDO
const PucTreeNode = React.memo(({ 
  nodo, 
  profundidad = 0, 
  esResultadoBusqueda = false,
  filtros,
  estaExpandido,
  onToggleNodo,
  onVerDetalle,
  onEditar,
  onEliminar
}) => {
  const expandido = estaExpandido(nodo.codigo_completo);
  const tieneHijos = nodo.hijos && nodo.hijos.length > 0;
  const nivel = nodo.nivel || profundidad + 1;

  // 🎯 CÁLCULOS MEMOIZADOS - CORREGIDOS
  const estadosCalculados = useMemo(() => {
    const esCoincidenciaEspecifica = filtros.busqueda_especifica &&
      nodo.codigo_completo.startsWith(filtros.busqueda_especifica);
    const esCuentaExacta = filtros.busqueda_especifica &&
      nodo.codigo_completo === filtros.busqueda_especifica;
    const esSubcuenta = filtros.busqueda_especifica &&
      nodo.codigo_completo.startsWith(filtros.busqueda_especifica) &&
      nodo.codigo_completo !== filtros.busqueda_especifica;
    return { esCoincidenciaEspecifica, esCuentaExacta, esSubcuenta };
  }, [filtros.busqueda_especifica, nodo.codigo_completo]);

  const { esCoincidenciaEspecifica, esCuentaExacta, esSubcuenta } = estadosCalculados;

  // 🎯 HANDLERS MEMOIZADOS
  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    onToggleNodo(nodo.codigo_completo);
  }, [nodo.codigo_completo, onToggleNodo]);

  const handleVerDetalle = useCallback((e) => {
    e.stopPropagation();
    onVerDetalle(nodo);
  }, [nodo, onVerDetalle]);

  const handleEditar = useCallback((e) => {
    e.stopPropagation();
    onEditar(nodo);
  }, [nodo, onEditar]);

  const handleEliminar = useCallback((e) => {
    e.stopPropagation();
    const confirmar = window.confirm(
      `¿Eliminar cuenta ${nodo.codigo_completo}?\n${nodo.descripcion || 'Sin descripción'}`
    );
    if (confirmar) onEliminar(nodo.id);
  }, [nodo, onEliminar]);

  // 🎨 ESTILOS MEMOIZADOS
  const estilosNodo = useMemo(() => {
    let containerClasses = `
      group relative transition-colors duration-200 ease-out
      cursor-pointer select-none border-b border-gray-100/50
    `;
    if (esCuentaExacta) {
      containerClasses += ' bg-emerald-50 border-l-4 border-emerald-500';
    } else if (esSubcuenta) {
      containerClasses += ' bg-emerald-25 border-l-2 border-emerald-300';
    } else {
      containerClasses += ' hover:bg-gray-50';
    }
    const nivelColor =
      nivel === 1 ? 'bg-purple-100 text-purple-600' :
      nivel === 2 ? 'bg-blue-100 text-blue-600' :
      nivel === 3 ? 'bg-green-100 text-green-600' :
      nivel === 4 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600';
    return { containerClasses, nivelColor };
  }, [esCuentaExacta, esSubcuenta, nivel]);

  return (
    <div>
      <div 
        className={estilosNodo.containerClasses}
        style={{ paddingLeft: `${profundidad * 24 + 8}px` }}
        onClick={handleToggle}
      >
        <div className="flex items-center py-3 px-4 space-x-3">
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            {tieneHijos ? (
              <button
                onClick={handleToggle}
                className={`
                  flex items-center justify-center w-5 h-5 rounded-full
                  transition-colors duration-200
                  bg-white border-2 shadow-sm hover:shadow-md
                  ${expandido 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }
                `}
              >
                {expandido ?
                  <FaChevronDown className="text-xs" /> :
                  <FaChevronRight className="text-xs" />}
              </button>
            ) : (
              <div className="flex items-center justify-center w-5 h-5">
                <div className={`
                  w-2 h-2 rounded-full
                  ${nivel === 1 ? 'bg-purple-400' :
                    nivel === 2 ? 'bg-blue-400' :
                    nivel === 3 ? 'bg-green-400' :
                    nivel === 4 ? 'bg-orange-400' : 'bg-gray-400'}
                `} />
              </div>
            )}
          </div>
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200
            ${estilosNodo.nivelColor}
          `}>
            {obtenerIconoTipoCuenta(nodo.tipo_cuenta)}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className={`
                font-mono font-bold tracking-wide
                ${esCuentaExacta ? 'text-emerald-700' : 
                  esSubcuenta ? 'text-emerald-600' : 'text-gray-900'}
                ${nivel === 1 ? 'text-lg' : nivel === 2 ? 'text-base' : 'text-sm'}
              `}>
                {nodo.codigo_completo}
              </span>
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${nivel === 1 ? 'bg-purple-100 text-purple-700' :
                  nivel === 2 ? 'bg-blue-100 text-blue-700' :
                  nivel === 3 ? 'bg-green-100 text-green-700' :
                  nivel === 4 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}
              `}>
                N{nivel}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {nodo.tipo_cuenta}
              </span>
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                ${nodo.naturaleza === 'DEBITO'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'}
              `}>
                {nodo.naturaleza}
              </span>
              {esCuentaExacta && (
                <span className="inline-flex items-center px-2 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold">
                  <FaBullseye className="mr-1" />
                  EXACTA
                </span>
              )}
              {esSubcuenta && (
                <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  <FaTree className="mr-1" />
                  SUBCUENTA
                </span>
              )}
            </div>
            <div className={`
              ${esCuentaExacta ? 'text-emerald-800 font-medium' :
                esSubcuenta ? 'text-emerald-700' : 'text-gray-600'}
              ${nivel === 1 ? 'text-base font-medium' : 'text-sm'}
              leading-relaxed
            `}>
              {nodo.descripcion || (
                <span className="italic text-gray-400">Sin descripción</span>
              )}
            </div>
            {expandido && (
              <div className="pt-2 space-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {nodo.codigo_padre && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <span className="font-medium">Padre:</span>
                      <span className="font-mono bg-gray-100 px-1 rounded">{nodo.codigo_padre}</span>
                    </div>
                  )}
                  {nodo.saldo_inicial && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <span className="font-medium">Saldo:</span>
                      <span className="font-mono text-green-600">
                        ${nodo.saldo_inicial.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {tieneHijos && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <span className="font-medium">Subcuentas:</span>
                      <span className="bg-blue-100 text-blue-700 px-1 rounded font-medium">
                        {nodo.hijos.length}
                      </span>
                    </div>
                  )}
                </div>
                {filtros.busqueda_especifica && esCoincidenciaEspecifica && (
                  <div className="flex items-center space-x-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <FaBullseye className="text-emerald-600" />
                    <span className="text-emerald-700 text-xs font-medium">
                      {esCuentaExacta
                        ? '🎯 Esta es la cuenta que buscas'
                        : '🌿 Subcuenta de tu búsqueda'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleVerDetalle}
              className="p-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 border border-blue-200/50"
              title="Ver detalles"
            >
              <FaEye className="text-xs" />
            </button>
            <button
              onClick={handleEditar}
              className="p-2 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200 border border-green-200/50"
              title="Editar"
            >
              <FaEdit className="text-xs" />
            </button>
            <button
              onClick={handleEliminar}
              className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 border border-red-200/50"
              title="Eliminar"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>
      </div>
      {expandido && tieneHijos && (
        <div className="relative">
          {nodo.hijos.map((hijo) => (
            <PucTreeNode
              key={hijo.codigo_completo}
              nodo={hijo}
              profundidad={profundidad + 1}
              esResultadoBusqueda={esCoincidenciaEspecifica}
              filtros={filtros}
              estaExpandido={estaExpandido}
              onToggleNodo={onToggleNodo}
              onVerDetalle={onVerDetalle}
              onEditar={onEditar}
              onEliminar={onEliminar}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// 🚀 COMPONENTE PRINCIPAL CORREGIDO - IGUAL LÓGICA QUE LA TABLA
const PucTree = ({ 
  arbolConstruido, 
  nodosExpandidos, 
  onToggleNodo, 
  onVerDetalle, 
  onEditar, 
  onEliminar,
  estaExpandido,
  filtros = {}
}) => {
  // 🔍 FILTRADO EXACTO COMO EN LA TABLA
  const arbolFiltrado = useMemo(() => {
    if (!filtros.busqueda_especifica || !arbolConstruido) {
      return arbolConstruido;
    }

    console.log('🔍 Filtrando árbol con:', filtros.busqueda_especifica);

    const filtrarNodos = (nodos) => {
      return nodos.reduce((acumulador, nodo) => {
        // MISMA LÓGICA QUE EN LA TABLA
        const coincideNodo = nodo.codigo_completo.startsWith(filtros.busqueda_especifica);
        const hijosFiltrados = nodo.hijos ? filtrarNodos(nodo.hijos) : [];
        
        if (coincideNodo || hijosFiltrados.length > 0) {
          console.log('✅ Incluido:', nodo.codigo_completo);
          acumulador.push({
            ...nodo,
            hijos: hijosFiltrados
          });
        }
        return acumulador;
      }, []);
    };

    const resultado = filtrarNodos(arbolConstruido);
    console.log(`🌳 Árbol filtrado: ${resultado.length} nodos raíz`);
    return resultado;
  }, [arbolConstruido, filtros.busqueda_especifica]);

  // 📊 ESTADÍSTICAS SOBRE ÁRBOL FILTRADO
  const estadisticasCalculadas = useMemo(() => {
    const contarNodosTotales = (nodos) => {
      let total = nodos.length;
      nodos.forEach(nodo => {
        if (nodo.hijos && nodo.hijos.length > 0) {
          total += contarNodosTotales(nodo.hijos);
        }
      });
      return total;
    };

    const contarCoincidenciasEspecificas = (nodos) => {
      if (!filtros.busqueda_especifica) return 0;
      let coincidencias = 0;
      const contar = (nodos) => {
        nodos.forEach(nodo => {
          if (nodo.codigo_completo.startsWith(filtros.busqueda_especifica)) {
            coincidencias++;
          }
          if (nodo.hijos && nodo.hijos.length > 0) {
            contar(nodo.hijos);
          }
        });
      };
      contar(nodos);
      return coincidencias;
    };

    const totalNodos = arbolFiltrado ? contarNodosTotales(arbolFiltrado) : 0;
    const nodosExpandidosCount = nodosExpandidos ? nodosExpandidos.size : 0;
    const coincidenciasEspecificas = filtros.busqueda_especifica ?
      contarCoincidenciasEspecificas(arbolFiltrado || []) : 0;

    return { totalNodos, nodosExpandidosCount, coincidenciasEspecificas };
  }, [arbolFiltrado, nodosExpandidos, filtros.busqueda_especifica]);

  // 🎯 EXPANSIÓN AUTOMÁTICA CORREGIDA
  const expandirCuentaBuscada = useCallback((codigoBuscado) => {
    if (!codigoBuscado || !arbolFiltrado) return;
    
    console.log('🔍 Auto-expandiendo para:', codigoBuscado);
    
    const expandirNodos = (nodos) => {
      nodos.forEach(nodo => {
        const debeExpandir =
          codigoBuscado.startsWith(nodo.codigo_completo) ||
          nodo.codigo_completo.startsWith(codigoBuscado);
          
        if (debeExpandir) {
          console.log('📂 Expandiendo:', nodo.codigo_completo);
          onToggleNodo(nodo.codigo_completo, true);
          
          if (nodo.hijos && nodo.hijos.length > 0) {
            expandirNodos(nodo.hijos);
          }
        } else if (nodo.hijos && nodo.hijos.length > 0) {
          const tieneHijoCoincidente = nodo.hijos.some(hijo =>
            codigoBuscado.startsWith(hijo.codigo_completo) ||
            hijo.codigo_completo.startsWith(codigoBuscado)
          );
          
          if (tieneHijoCoincidente) {
            console.log('📂 Expandiendo padre:', nodo.codigo_completo);
            onToggleNodo(nodo.codigo_completo, true);
            expandirNodos(nodo.hijos);
          }
        }
      });
    };
    
    expandirNodos(arbolFiltrado);
  }, [arbolFiltrado, onToggleNodo]);

  React.useEffect(() => {
    if (filtros.busqueda_especifica) {
      expandirCuentaBuscada(filtros.busqueda_especifica);
    }
  }, [filtros.busqueda_especifica, expandirCuentaBuscada]);

  // Validación
  if (!arbolFiltrado || arbolFiltrado.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gray-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <FaTree className="text-green-600 text-lg" />
              </div>
              Árbol Jerárquico PUC
            </h4>
            <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
              {filtros.busqueda_especifica ? 'Sin coincidencias' : 'Sin datos'}
            </div>
          </div>
        </div>
        <div className="text-center py-16 space-y-4">
          <FaExclamationTriangle className="text-8xl text-gray-300 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-600">
              {filtros.busqueda_especifica
                ? `No se encontraron cuentas con "${filtros.busqueda_especifica}"`
                : 'No hay datos disponibles'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filtros.busqueda_especifica
                ? 'Intenta con un código diferente o verifica que la cuenta exista.'
                : 'Verifica los filtros o importa cuentas del PUC.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <FaTree className="text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800">Plan Único de Cuentas</h4>
              <p className="text-sm text-gray-500">Vista Jerárquica</p>
            </div>
            {filtros.busqueda_especifica && (
              <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                <FaBullseye className="text-sm" />
                <span className="text-sm font-medium">
                  Filtro: {filtros.busqueda_especifica}*
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700">{arbolFiltrado.length}</span>
              <span className="text-gray-500">raíz</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-gray-700">{estadisticasCalculadas.totalNodos}</span>
              <span className="text-gray-500">total</span>
            </div>
            {filtros.busqueda_especifica && (
              <div className="flex items-center space-x-2 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="font-medium text-emerald-700">{estadisticasCalculadas.coincidenciasEspecificas}</span>
                <span className="text-emerald-600">coincidencias</span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-700">{estadisticasCalculadas.nodosExpandidosCount}</span>
              <span className="text-gray-500">expandidos</span>
            </div>
          </div>
        </div>
        {filtros.busqueda_especifica && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FaBullseye className="text-emerald-600" />
              <div className="text-sm">
                <span className="text-emerald-800 font-medium">Búsqueda específica activa: </span>
                <span className="text-emerald-600">
                  Mostrando cuentas que empiecen con "{filtros.busqueda_especifica}"
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {arbolFiltrado.map((nodo) => (
          <PucTreeNode
            key={nodo.codigo_completo}
            nodo={nodo}
            profundidad={0}
            filtros={filtros}
            estaExpandido={estaExpandido}
            onToggleNodo={onToggleNodo}
            onVerDetalle={onVerDetalle}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ))}
      </div>
      <div className="bg-gray-50 p-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>
              {filtros.busqueda_especifica
                ? `Mostrando coincidencias para "${filtros.busqueda_especifica}"`
                : 'Haz clic para expandir/contraer, hover para acciones'}
            </span>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            PUC v2.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default PucTree;

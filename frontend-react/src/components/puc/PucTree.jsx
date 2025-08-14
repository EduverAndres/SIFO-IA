// components/puc/PucTree.jsx
import React from 'react';
import { 
  FaExclamationTriangle, 
  FaTree, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaChevronDown,
  FaChevronRight,
  FaSearch,
  FaBullseye
} from 'react-icons/fa';
import { 
  obtenerColorNivel, 
  obtenerColorNaturaleza, 
  obtenerColorTipoCuenta 
} from '../../utils/formatters';
import { obtenerIconoTipoCuenta } from '../../utils/pucUtils';

const PucTree = ({ 
  arbolConstruido, 
  nodosExpandidos, 
  onToggleNodo, 
  onVerDetalle, 
  onEditar, 
  onEliminar,
  estaExpandido,
  filtros = {} // Filtros para búsquedas específicas
}) => {
  // Componente del nodo individual del árbol
  const PucTreeNode = ({ nodo, profundidad = 0, esResultadoBusqueda = false }) => {
    const expandido = estaExpandido(nodo.codigo_completo);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;
    const marginLeft = profundidad * 24; // 24px por nivel de profundidad
    const nivel = nodo.nivel || profundidad + 1;
    
    // Determinar si es resultado de búsqueda específica
    const esCoincidenciaEspecifica = filtros.busqueda_especifica && 
      nodo.codigo_completo.startsWith(filtros.busqueda_especifica);
    
    // Determinar si es la cuenta exacta buscada
    const esCuentaExacta = filtros.busqueda_especifica && 
      nodo.codigo_completo === filtros.busqueda_especifica;
    
    // Determinar si es subcuenta de la búsqueda
    const esSubcuenta = filtros.busqueda_especifica && 
      nodo.codigo_completo.startsWith(filtros.busqueda_especifica) &&
      nodo.codigo_completo !== filtros.busqueda_especifica;

    const handleToggle = (e) => {
      e.stopPropagation();
      onToggleNodo(nodo.codigo_completo);
    };

    const handleVerDetalle = (e) => {
      e.stopPropagation();
      onVerDetalle(nodo);
    };

    const handleEditar = (e) => {
      e.stopPropagation();
      onEditar(nodo);
    };

    const handleEliminar = (e) => {
      e.stopPropagation();
      const confirmar = window.confirm(
        `¿Eliminar cuenta ${nodo.codigo_completo}?\n${nodo.descripcion || 'Sin descripción'}`
      );
      if (confirmar) onEliminar(nodo.id);
    };

    return (
      <div className="border-b border-gray-100">
        {/* Fila principal del nodo */}
        <div 
          className={`
            flex items-center py-2 px-3 hover:bg-blue-50 transition-colors cursor-pointer
            ${esCuentaExacta ? 'bg-green-100 border-l-4 border-green-500' : ''}
            ${esSubcuenta ? 'bg-green-25 border-l-2 border-green-300' : ''}
            ${esResultadoBusqueda && !esCoincidenciaEspecifica ? 'bg-blue-25' : ''}
          `}
          style={{ marginLeft: `${marginLeft}px` }}
          onClick={handleToggle}
        >
          {/* Indicador de expansión */}
          <div className="w-6 h-6 flex items-center justify-center mr-2">
            {tieneHijos ? (
              <button
                onClick={handleToggle}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                {expandido ? (
                  <FaChevronDown className="text-xs text-gray-600" />
                ) : (
                  <FaChevronRight className="text-xs text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Icono del tipo de cuenta */}
          <div className="mr-2 text-sm">
            {obtenerIconoTipoCuenta(nodo.tipo_cuenta)}
          </div>

          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {/* Código */}
              <span className="font-mono font-bold text-gray-900 text-sm">
                {nodo.codigo_completo}
              </span>
              
              {/* Badge de nivel */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${obtenerColorNivel(nivel)}`}>
                N{nivel}
              </span>
              
              {/* Badge de tipo */}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${obtenerColorTipoCuenta(nodo.tipo_cuenta)}`}>
                {nodo.tipo_cuenta}
              </span>
              
              {/* Badge de naturaleza */}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${obtenerColorNaturaleza(nodo.naturaleza)}`}>
                {nodo.naturaleza}
              </span>

              {/* Indicadores de búsqueda específica */}
              {esCuentaExacta && (
                <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-bold">
                  🎯 CUENTA BUSCADA
                </span>
              )}
              {esSubcuenta && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                  🌿 SUBCUENTA
                </span>
              )}
            </div>
            
            {/* Descripción */}
            <div className="text-sm text-gray-700 mt-1 truncate">
              {nodo.descripcion || 'Sin descripción'}
            </div>
            
            {/* Información adicional en vista expandida */}
            {expandido && (
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                {nodo.codigo_padre && (
                  <div>Padre: {nodo.codigo_padre}</div>
                )}
                {nodo.saldo_inicial && (
                  <div>Saldo Inicial: ${nodo.saldo_inicial.toLocaleString()}</div>
                )}
                {tieneHijos && (
                  <div>Subcuentas: {nodo.hijos.length}</div>
                )}
                {/* Mostrar relación con búsqueda */}
                {filtros.busqueda_especifica && esCoincidenciaEspecifica && (
                  <div className="text-green-600 font-medium">
                    {esCuentaExacta ? '🎯 Esta es la cuenta buscada' : '🌿 Subcuenta de la búsqueda'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex space-x-1 ml-2">
            <button
              onClick={handleVerDetalle}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Ver detalles"
            >
              <FaEye className="text-xs" />
            </button>
            <button
              onClick={handleEditar}
              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
              title="Editar"
            >
              <FaEdit className="text-xs" />
            </button>
            <button
              onClick={handleEliminar}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Eliminar"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>

        {/* Nodos hijos */}
        {expandido && tieneHijos && (
          <div className="bg-gray-25">
            {nodo.hijos.map(hijo => (
              <PucTreeNode 
                key={hijo.codigo_completo}
                nodo={hijo}
                profundidad={profundidad + 1}
                esResultadoBusqueda={esCoincidenciaEspecifica}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Función para contar nodos totales recursivamente
  const contarNodosTotales = (nodos) => {
    let total = nodos.length;
    nodos.forEach(nodo => {
      if (nodo.hijos && nodo.hijos.length > 0) {
        total += contarNodosTotales(nodo.hijos);
      }
    });
    return total;
  };

  // Función para expandir automáticamente la cuenta buscada
  const expandirCuentaBuscada = (codigoBuscado) => {
    if (!codigoBuscado) return;
    
    // Expandir la cuenta buscada y sus padres
    const expandirNodos = (nodos) => {
      nodos.forEach(nodo => {
        // Si el código buscado empieza con el código de este nodo, expandirlo
        if (codigoBuscado.startsWith(nodo.codigo_completo) || 
            nodo.codigo_completo.startsWith(codigoBuscado)) {
          onToggleNodo(nodo.codigo_completo, true); // Forzar expansión
        }
        if (nodo.hijos) {
          expandirNodos(nodo.hijos);
        }
      });
    };
    
    expandirNodos(arbolConstruido);
  };

  // Auto-expandir cuando hay búsqueda específica
  React.useEffect(() => {
    if (filtros.busqueda_especifica) {
      expandirCuentaBuscada(filtros.busqueda_especifica);
    }
  }, [filtros.busqueda_especifica]);

  // Validación de datos
  if (!arbolConstruido || arbolConstruido.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center">
              <FaTree className="mr-2 text-green-600" />
              Estructura Jerárquica del PUC
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>0 nodos raíz</span>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <FaExclamationTriangle className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay datos para mostrar en el árbol</p>
          <p className="text-gray-400 text-sm mt-2">
            Verifica los filtros aplicados o importa cuentas del PUC
          </p>
        </div>
      </div>
    );
  }

  const totalNodos = contarNodosTotales(arbolConstruido);
  const nodosExpandidosCount = nodosExpandidos ? nodosExpandidos.size : 0;
  
  // Contar coincidencias de búsqueda específica
  const contarCoincidenciasEspecificas = (nodos) => {
    let coincidencias = 0;
    const contar = (nodos) => {
      nodos.forEach(nodo => {
        if (filtros.busqueda_especifica && 
            nodo.codigo_completo.startsWith(filtros.busqueda_especifica)) {
          coincidencias++;
        }
        if (nodo.hijos) {
          contar(nodo.hijos);
        }
      });
    };
    contar(nodos);
    return coincidencias;
  };

  const coincidenciasEspecificas = filtros.busqueda_especifica ? 
    contarCoincidenciasEspecificas(arbolConstruido) : 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header del árbol */}
      <div className="bg-gradient-to-r from-gray-50 to-green-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center">
            <FaTree className="mr-2 text-green-600" />
            Estructura Jerárquica del PUC
            {filtros.busqueda_especifica && (
              <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                🎯 Filtro: {filtros.busqueda_especifica}*
              </span>
            )}
          </h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{arbolConstruido.length} nodos raíz</span>
            <span>•</span>
            <span>{totalNodos} cuentas totales</span>
            {filtros.busqueda_especifica && (
              <>
                <span>•</span>
                <span className="text-green-600 font-medium">
                  {coincidenciasEspecificas} coincidencias
                </span>
              </>
            )}
            <span>•</span>
            <span>{nodosExpandidosCount} expandidos</span>
          </div>
        </div>

        {/* Información de filtros activos */}
        {filtros.busqueda_especifica && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
            <div className="flex items-center space-x-2">
              <FaBullseye className="text-green-600" />
              <span className="text-green-800">
                <strong>Búsqueda específica activa:</strong> Mostrando solo cuentas que empiecen con "{filtros.busqueda_especifica}"
              </span>
            </div>
            <div className="mt-1 text-green-600">
              🎯 Cuenta exacta: {filtros.busqueda_especifica} | 🌿 Subcuentas: {filtros.busqueda_especifica}XXXXX
            </div>
          </div>
        )}
      </div>

      {/* Contenido del árbol */}
      <div className="max-h-[800px] overflow-y-auto bg-white">
        {arbolConstruido.map(nodo => (
          <PucTreeNode 
            key={nodo.codigo_completo} 
            nodo={nodo} 
            profundidad={0}
          />
        ))}
      </div>

      {/* Footer con información adicional */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-600">
        💡 Tip: {filtros.busqueda_especifica ? 
          'Las cuentas resaltadas en verde coinciden con tu búsqueda específica' :
          'Haz clic en el código para expandir/contraer, usa los iconos para acciones específicas'
        }
      </div>
    </div>
  );
};

export default PucTree;
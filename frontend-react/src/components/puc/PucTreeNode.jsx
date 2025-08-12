// components/puc/PucTreeNode.jsx
import React from 'react';
import { 
  FaChevronDown, 
  FaChevronRight, 
  FaLayerGroup, 
  FaBuilding, 
  FaBalanceScale, 
  FaMoneyBillWave, 
  FaChartLine,
  FaEye,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { formatearSaldo, formatearMovimientos, obtenerColorNaturaleza } from '../../utils/formatters';

const PucTreeNode = React.memo(({ 
  nodo, 
  profundidad = 0, 
  estaExpandido, 
  onToggle, 
  onVerDetalle, 
  onEditar, 
  onEliminar 
}) => {
  const tieneHijos = nodo.hijos && nodo.hijos.length > 0;
  const indentacion = profundidad * 24;

  const obtenerColorNivel = (nivel) => {
    const colores = {
      1: 'bg-purple-25 border-l-4 border-purple-500',
      2: 'bg-blue-25 border-l-4 border-blue-500',
      3: 'bg-green-25 border-l-4 border-green-500',
      4: 'bg-yellow-25 border-l-4 border-yellow-500',
      5: 'bg-orange-25 border-l-4 border-orange-500'
    };
    return colores[nivel] || 'bg-gray-25 border-l-4 border-gray-500';
  };

  const obtenerIconoNivel = (nivel) => {
    const iconos = {
      1: <FaLayerGroup className="text-purple-600" />,
      2: <FaBuilding className="text-blue-600" />,
      3: <FaBalanceScale className="text-green-600" />,
      4: <FaMoneyBillWave className="text-yellow-600" />,
      5: <FaChartLine className="text-orange-600" />
    };
    return iconos[nivel] || <FaChartLine className="text-gray-600" />;
  };

  const obtenerColorTipo = (nivel) => {
    const colores = {
      1: 'bg-purple-100 text-purple-800 border-purple-200',
      2: 'bg-blue-100 text-blue-800 border-blue-200',
      3: 'bg-green-100 text-green-800 border-green-200',
      4: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      5: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colores[nivel] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="select-none">
      {/* Línea principal del nodo */}
      <div 
        className={`flex items-center py-2 px-3 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${
          obtenerColorNivel(nodo.nivel_calculado)
        }`}
        style={{ paddingLeft: `${indentacion + 12}px` }}
        onClick={() => tieneHijos && onToggle(nodo.codigo_completo)}
      >
        {/* Indicador de expansión */}
        <div className="w-6 h-6 flex items-center justify-center mr-2">
          {tieneHijos ? (
            <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 transition-colors">
              {estaExpandido ? (
                <FaChevronDown className="text-xs text-gray-600" />
              ) : (
                <FaChevronRight className="text-xs text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          )}
        </div>

        {/* Icono jerárquico por tipo */}
        <div className="mr-3 flex items-center">
          {obtenerIconoNivel(nodo.nivel_calculado)}
        </div>

        {/* Información principal del nodo */}
        <div className="flex-1 flex items-center justify-between min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 font-bold">
                {nodo.codigo_completo}
              </code>
              <span className="font-medium text-gray-900 truncate">
                {nodo.descripcion || 'Sin descripción'}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                obtenerColorTipo(nodo.nivel_calculado)
              }`}>
                {nodo.tipo_calculado}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${obtenerColorNaturaleza(nodo.naturaleza)}`}>
                {nodo.naturaleza}
              </span>
              {nodo.acepta_movimientos && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  ✓ Mov
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorTipo(nodo.nivel_calculado)}`}>
                N{nodo.nivel_calculado}
              </span>
            </div>
          </div>

          {/* Saldos y movimientos */}
          <div className="flex items-center space-x-6">
            {/* Saldos */}
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">
                Inicial: <span className={`font-mono ${
                  (nodo.saldo_inicial || 0) > 0 ? 'text-blue-600' : 
                  (nodo.saldo_inicial || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {formatearSaldo(nodo.saldo_inicial)}
                </span>
              </div>
              
              <div className={`font-mono text-sm ${
                (nodo.saldo_final || 0) > 0 ? 'text-green-600' : 
                (nodo.saldo_final || 0) < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                Final: {formatearSaldo(nodo.saldo_final)}
              </div>
              
              {tieneHijos && (
                <div className="text-xs text-gray-500 mt-1">
                  {nodo.hijos.length} cuenta{nodo.hijos.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Movimientos débitos y créditos */}
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <FaArrowDown className="text-red-500 mr-1" />
                Débitos: <span className="font-mono text-red-600 ml-1">
                  {formatearMovimientos(nodo.movimientos_debitos)}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 flex items-center">
                <FaArrowUp className="text-green-500 mr-1" />
                Créditos: <span className="font-mono text-green-600 ml-1">
                  {formatearMovimientos(nodo.movimientos_creditos)}
                </span>
              </div>
              
              {/* Total movimientos */}
              <div className="text-xs text-gray-400 mt-1">
                Total mov: {formatearMovimientos((nodo.movimientos_debitos || 0) + (nodo.movimientos_creditos || 0))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onVerDetalle(nodo)}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-blue-600 transition-colors"
                title="Ver detalles"
              >
                <FaEye className="text-xs" />
              </button>
              <button 
                onClick={() => onEditar(nodo)}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-green-600 transition-colors"
                title="Editar"
              >
                <FaEdit className="text-xs" />
              </button>
              {nodo.acepta_movimientos && (
                <button 
                  onClick={() => onEliminar(nodo.id)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Renderizado recursivo de hijos */}
      {tieneHijos && estaExpandido && (
        <div>
          {nodo.hijos.map(hijo => (
            <PucTreeNode 
              key={hijo.codigo_completo} 
              nodo={hijo} 
              profundidad={profundidad + 1}
              estaExpandido={estaExpandido}
              onToggle={onToggle}
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

export default PucTreeNode;
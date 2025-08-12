// components/puc/PucTree.jsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import PucTreeNode from './PucTreeNode';

const PucTree = ({ 
  arbolConstruido, 
  nodosExpandidos, 
  onToggleNodo, 
  onVerDetalle, 
  onEditar, 
  onEliminar,
  estaExpandido
}) => {
  if (!arbolConstruido || arbolConstruido.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Estructura Jerárquica del PUC</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>0 nodos raíz</span>
            </div>
          </div>
        </div>
        <div className="text-center py-8">
          <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No hay datos para mostrar en el árbol</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Estructura Jerárquica del PUC</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{arbolConstruido.length} nodos raíz</span>
            <span>•</span>
            <span>{nodosExpandidos.size} expandidos</span>
          </div>
        </div>
      </div>
      <div className="max-h-[800px] overflow-y-auto">
        {arbolConstruido.map(nodo => (
          <PucTreeNode 
            key={nodo.codigo_completo} 
            nodo={nodo} 
            profundidad={0}
            estaExpandido={estaExpandido(nodo.codigo_completo)}
            onToggle={onToggleNodo}
            onVerDetalle={onVerDetalle}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ))}
      </div>
    </div>
  );
};

export default PucTree;
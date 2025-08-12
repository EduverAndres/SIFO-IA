// hooks/usePucTree.js
import { useState, useCallback, useMemo } from 'react';
import { construirArbolJerarquico, determinarNivelPorCodigo } from '../utils/pucUtils';

export const usePucTree = (cuentas) => {
  const [nodosExpandidos, setNodosExpandidos] = useState(new Set(['1', '2', '3', '4', '5', '6']));

  // Construir el árbol jerárquico
  const arbolConstruido = useMemo(() => {
    return construirArbolJerarquico(cuentas);
  }, [cuentas]);

  // Toggle expansión de nodo
  const toggleNodo = useCallback((codigo) => {
    setNodosExpandidos(prev => {
      const nuevosExpandidos = new Set(prev);
      if (nuevosExpandidos.has(codigo)) {
        nuevosExpandidos.delete(codigo);
      } else {
        nuevosExpandidos.add(codigo);
      }
      return nuevosExpandidos;
    });
  }, []);

  // Expandir todos los nodos
  const expandirTodos = useCallback(() => {
    const todosLosCodigos = cuentas.map(c => c.codigo_completo);
    setNodosExpandidos(new Set(todosLosCodigos));
  }, [cuentas]);

  // Contraer todos los nodos
  const contraerTodos = useCallback(() => {
    setNodosExpandidos(new Set());
  }, []);

  // Expandir solo las clases (nivel 1)
  const expandirSoloClases = useCallback(() => {
    const clases = cuentas
      .filter(c => determinarNivelPorCodigo(c.codigo_completo) === 1)
      .map(c => c.codigo_completo);
    setNodosExpandidos(new Set(clases));
  }, [cuentas]);

  // Verificar si un nodo está expandido
  const estaExpandido = useCallback((codigo) => {
    return nodosExpandidos.has(codigo);
  }, [nodosExpandidos]);

  return {
    arbolConstruido,
    nodosExpandidos,
    toggleNodo,
    expandirTodos,
    contraerTodos,
    expandirSoloClases,
    estaExpandido
  };
};
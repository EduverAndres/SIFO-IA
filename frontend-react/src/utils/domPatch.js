// domPatch.js - Crear este archivo en src/utils/
// Este patch maneja los errores de removeChild comunes en React 19

function patchDOMRemoval() {
  // Guardar las funciones originales
  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  // Patch para removeChild
  Node.prototype.removeChild = function(child) {
    try {
      // Verificar si el nodo es realmente un hijo
      if (this.contains && !this.contains(child)) {
        console.warn('Attempted to remove a node that is not a child of this node', {
          parent: this,
          child: child
        });
        return child; // Retornar el nodo sin hacer nada
      }
      return originalRemoveChild.call(this, child);
    } catch (error) {
      if (error.name === 'NotFoundError' || error.message.includes('not a child of this node')) {
        console.warn('DOM removeChild error caught and handled:', error.message);
        return child; // Retornar el nodo sin lanzar error
      }
      throw error; // Re-lanzar otros errores
    }
  };

  // Patch para insertBefore
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    try {
      // Verificar si referenceNode existe y es hijo de este nodo
      if (referenceNode && this.contains && !this.contains(referenceNode)) {
        console.warn('Attempted to insertBefore with invalid reference node', {
          parent: this,
          newNode: newNode,
          referenceNode: referenceNode
        });
        return this.appendChild(newNode); // Hacer appendChild en su lugar
      }
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      console.warn('DOM insertBefore error caught:', error.message);
      try {
        return this.appendChild(newNode); // Fallback a appendChild
      } catch (fallbackError) {
        console.error('Fallback appendChild also failed:', fallbackError);
        return newNode;
      }
    }
  };

  console.log('DOM patches applied for React 19 compatibility');
}

// Función para remover los patches si es necesario
function removeDOMPatches() {
  // Esta función podría implementarse si necesitas restaurar el comportamiento original
  console.log('DOM patches would be removed here if implemented');
}

export { patchDOMRemoval, removeDOMPatches };
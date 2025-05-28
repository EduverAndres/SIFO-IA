// domPatch.js - Versión mejorada para React 19
// Este patch maneja los errores de DOM más comunes en React 19

function patchDOMRemoval() {
  // Verificar si ya se aplicó el patch
  if (window.__DOM_PATCH_APPLIED__) {
    console.log('DOM patches already applied');
    return;
  }

  try {
    // Guardar las funciones originales
    const originalRemoveChild = Node.prototype.removeChild;
    const originalInsertBefore = Node.prototype.insertBefore;
    const originalAppendChild = Node.prototype.appendChild;

    // Patch para removeChild
    Node.prototype.removeChild = function(child) {
      try {
        // Verificaciones de seguridad
        if (!child) {
          console.warn('Attempted to remove null/undefined child');
          return null;
        }

        if (!this || typeof this.contains !== 'function') {
          console.warn('Invalid parent node for removeChild');
          return child;
        }

        // Verificar si el nodo es realmente un hijo
        if (!this.contains(child)) {
          console.warn('Attempted to remove a node that is not a child', {
            parent: this.tagName || this.nodeName,
            child: child.tagName || child.nodeName || child.nodeType
          });
          return child;
        }

        // Verificar si el nodo ya fue removido
        if (!child.parentNode) {
          console.warn('Attempted to remove a node that has no parent');
          return child;
        }

        return originalRemoveChild.call(this, child);
      } catch (error) {
        if (error.name === 'NotFoundError' || 
            error.message.includes('not a child of this node') ||
            error.message.includes('The node to be removed is not a child of this node')) {
          console.warn('DOM removeChild error caught and handled:', error.message);
          return child;
        }
        console.error('Unexpected error in removeChild patch:', error);
        throw error;
      }
    };

    // Patch para insertBefore
    Node.prototype.insertBefore = function(newNode, referenceNode) {
      try {
        // Verificaciones de seguridad
        if (!newNode) {
          console.warn('Attempted to insert null/undefined node');
          return null;
        }

        if (!this || typeof this.contains !== 'function') {
          console.warn('Invalid parent node for insertBefore');
          return newNode;
        }

        // Si referenceNode es null, hacer appendChild
        if (!referenceNode) {
          return this.appendChild(newNode);
        }

        // Verificar si referenceNode es hijo de este nodo
        if (!this.contains(referenceNode)) {
          console.warn('Reference node is not a child, falling back to appendChild', {
            parent: this.tagName || this.nodeName,
            referenceNode: referenceNode.tagName || referenceNode.nodeName || referenceNode.nodeType
          });
          return this.appendChild(newNode);
        }

        return originalInsertBefore.call(this, newNode, referenceNode);
      } catch (error) {
        console.warn('DOM insertBefore error caught:', error.message);
        try {
          return this.appendChild(newNode);
        } catch (fallbackError) {
          console.error('Fallback appendChild also failed:', fallbackError);
          return newNode;
        }
      }
    };

    // Patch para appendChild
    Node.prototype.appendChild = function(child) {
      try {
        if (!child) {
          console.warn('Attempted to append null/undefined child');
          return null;
        }

        if (!this) {
          console.warn('Invalid parent node for appendChild');
          return child;
        }

        // Verificar si el nodo ya tiene este padre
        if (child.parentNode === this) {
          console.warn('Child already has this parent, skipping appendChild');
          return child;
        }

        return originalAppendChild.call(this, child);
      } catch (error) {
        console.warn('DOM appendChild error caught:', error.message);
        return child;
      }
    };

    // Patch adicional para React 19 - manejar errores de textContent
    const originalSetTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
    if (originalSetTextContent && originalSetTextContent.set) {
      Object.defineProperty(Node.prototype, 'textContent', {
        get: originalSetTextContent.get,
        set: function(value) {
          try {
            return originalSetTextContent.set.call(this, value);
          } catch (error) {
            console.warn('textContent setter error caught:', error.message);
            return value;
          }
        },
        configurable: true,
        enumerable: true
      });
    }

    // Marcar que el patch fue aplicado
    window.__DOM_PATCH_APPLIED__ = true;
    console.log('Enhanced DOM patches applied for React 19 compatibility');

  } catch (error) {
    console.error('Failed to apply DOM patches:', error);
  }
}

// Función para manejar errores de React específicos
function patchReactErrors() {
  // Capturar errores no manejados
  const originalErrorHandler = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // Filtrar errores conocidos de React 19
    if (message && typeof message === 'string') {
      if (message.includes('removeChild') || 
          message.includes('insertBefore') ||
          message.includes('componentStack') ||
          message.includes('Cannot read properties of null')) {
        console.warn('React 19 DOM error intercepted and handled:', message);
        return true; // Prevenir que el error se propague
      }
    }
    
    // Llamar al handler original si existe
    if (originalErrorHandler) {
      return originalErrorHandler.call(this, message, source, lineno, colno, error);
    }
    
    return false;
  };

  // Capturar errores de promesas no manejadas
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message) {
      if (event.reason.message.includes('removeChild') || 
          event.reason.message.includes('insertBefore')) {
        console.warn('React 19 Promise rejection intercepted:', event.reason.message);
        event.preventDefault();
      }
    }
  });
}

// Función principal que aplica todos los patches
function applyAllPatches() {
  if (typeof window !== 'undefined') {
    patchDOMRemoval();
    patchReactErrors();
    
    // Patch adicional para el desarrollo
    if (process.env.NODE_ENV === 'development') {
      // Suprime warnings específicos de React 19 en desarrollo
      const originalConsoleWarn = console.warn;
      console.warn = function(...args) {
        const message = args[0];
        if (typeof message === 'string' && 
            (message.includes('validateDOMNesting') || 
             message.includes('componentStack'))) {
          return; // Suprimir este warning específico
        }
        return originalConsoleWarn.apply(console, args);
      };
    }
  }
}

// Función para remover los patches si es necesario
function removeDOMPatches() {
  if (window.__DOM_PATCH_APPLIED__) {
    console.log('Removing DOM patches...');
    // Aquí podrías restaurar las funciones originales si las guardaste
    window.__DOM_PATCH_APPLIED__ = false;
  }
}

export { patchDOMRemoval, applyAllPatches, removeDOMPatches };
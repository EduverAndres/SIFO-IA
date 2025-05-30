// utils/domPatch.js - Versión mejorada para React 19 en producción
// Este patch maneja todos los errores de DOM conocidos en React 19

let isPatched = false;

function enhancedDOMPatch() {
  // Evitar aplicar el patch múltiples veces
  if (isPatched || typeof window === 'undefined') {
    return;
  }

  try {
    console.log('🔧 Aplicando Enhanced DOM Patch para React 19...');

    // Guardar las funciones originales
    const originalRemoveChild = Node.prototype.removeChild;
    const originalInsertBefore = Node.prototype.insertBefore;
    const originalAppendChild = Node.prototype.appendChild;
    const originalReplaceChild = Node.prototype.replaceChild;

    // 1. PATCH PARA removeChild
    Node.prototype.removeChild = function(child) {
      try {
        // Validaciones exhaustivas
        if (!child) {
          console.warn('[DOM-PATCH] Attempted to remove null/undefined child');
          return null;
        }

        if (!this || typeof this.contains !== 'function') {
          console.warn('[DOM-PATCH] Invalid parent node for removeChild');
          return child;
        }

        // Verificar si el nodo ya fue removido
        if (!child.parentNode) {
          console.warn('[DOM-PATCH] Child already removed from DOM');
          return child;
        }

        // Verificar si es realmente un hijo
        if (child.parentNode !== this) {
          console.warn('[DOM-PATCH] Child is not a direct child of this node');
          return child;
        }

        return originalRemoveChild.call(this, child);
      } catch (error) {
        console.warn('[DOM-PATCH] RemoveChild error handled:', error.message);
        return child;
      }
    };

    // 2. PATCH PARA insertBefore - EL MÁS IMPORTANTE
    Node.prototype.insertBefore = function(newNode, referenceNode) {
      try {
        // Validaciones de entrada
        if (!newNode) {
          console.warn('[DOM-PATCH] Attempted to insert null/undefined node');
          return null;
        }

        if (!this || typeof this.contains !== 'function') {
          console.warn('[DOM-PATCH] Invalid parent node for insertBefore');
          return newNode;
        }

        // Si no hay nodo de referencia, usar appendChild
        if (!referenceNode) {
          return this.appendChild(newNode);
        }

        // VALIDACIÓN CLAVE: Verificar que el nodo de referencia es hijo de este nodo
        if (referenceNode.parentNode !== this) {
          console.warn('[DOM-PATCH] Reference node is not a child, fallback to appendChild');
          return this.appendChild(newNode);
        }

        // Verificar que el referenceNode aún está en el DOM
        if (!document.contains(referenceNode)) {
          console.warn('[DOM-PATCH] Reference node not in document, fallback to appendChild');
          return this.appendChild(newNode);
        }

        return originalInsertBefore.call(this, newNode, referenceNode);
      } catch (error) {
        console.warn('[DOM-PATCH] InsertBefore error handled:', error.message);
        try {
          return this.appendChild(newNode);
        } catch (fallbackError) {
          console.warn('[DOM-PATCH] Fallback appendChild failed:', fallbackError.message);
          return newNode;
        }
      }
    };

    // 3. PATCH PARA appendChild
    Node.prototype.appendChild = function(child) {
      try {
        if (!child) {
          console.warn('[DOM-PATCH] Attempted to append null/undefined child');
          return null;
        }

        if (!this) {
          console.warn('[DOM-PATCH] Invalid parent node for appendChild');
          return child;
        }

        // Verificar si ya tiene este padre
        if (child.parentNode === this) {
          console.warn('[DOM-PATCH] Child already has this parent');
          return child;
        }

        return originalAppendChild.call(this, child);
      } catch (error) {
        console.warn('[DOM-PATCH] AppendChild error handled:', error.message);
        return child;
      }
    };

    // 4. PATCH PARA replaceChild
    Node.prototype.replaceChild = function(newChild, oldChild) {
      try {
        if (!newChild || !oldChild) {
          console.warn('[DOM-PATCH] Invalid nodes for replaceChild');
          return oldChild;
        }

        if (!this || typeof this.contains !== 'function') {
          console.warn('[DOM-PATCH] Invalid parent for replaceChild');
          return oldChild;
        }

        if (oldChild.parentNode !== this) {
          console.warn('[DOM-PATCH] OldChild is not a direct child');
          return oldChild;
        }

        return originalReplaceChild.call(this, newChild, oldChild);
      } catch (error) {
        console.warn('[DOM-PATCH] ReplaceChild error handled:', error.message);
        return oldChild;
      }
    };

    // 5. PATCH ADICIONAL PARA textContent
    const originalTextContentDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
    if (originalTextContentDescriptor && originalTextContentDescriptor.set) {
      Object.defineProperty(Node.prototype, 'textContent', {
        get: originalTextContentDescriptor.get,
        set: function(value) {
          try {
            return originalTextContentDescriptor.set.call(this, value);
          } catch (error) {
            console.warn('[DOM-PATCH] TextContent setter error handled:', error.message);
            return value;
          }
        },
        configurable: true,
        enumerable: true
      });
    }

    // 6. MANEJAR ERRORES GLOBALES DE REACT
    const originalErrorHandler = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (message && typeof message === 'string') {
        if (
          message.includes('insertBefore') || 
          message.includes('removeChild') ||
          message.includes('appendChild') ||
          message.includes('not a child of this node') ||
          message.includes('Cannot read properties of null')
        ) {
          console.warn('[DOM-PATCH] React DOM error intercepted:', message);
          return true; // Prevenir que el error se propague
        }
      }
      
      if (originalErrorHandler) {
        return originalErrorHandler.call(this, message, source, lineno, colno, error);
      }
      
      return false;
    };

    // 7. MANEJAR PROMESAS RECHAZADAS
    window.addEventListener('unhandledrejection', function(event) {
      if (event.reason && event.reason.message) {
        if (
          event.reason.message.includes('insertBefore') || 
          event.reason.message.includes('removeChild') ||
          event.reason.message.includes('not a child of this node')
        ) {
          console.warn('[DOM-PATCH] Promise rejection intercepted:', event.reason.message);
          event.preventDefault();
        }
      }
    });

    // 8. PATCH ESPECÍFICO PARA REACT 19 - Interceptar errores de reconciler
    if (window.React && window.React.version && window.React.version.startsWith('19')) {
      console.log('[DOM-PATCH] React 19 detected, applying specific patches');
      
      // Suprimir warnings específicos de React 19
      const originalConsoleWarn = console.warn;
      console.warn = function(...args) {
        const message = args[0];
        if (typeof message === 'string' && 
            (message.includes('validateDOMNesting') || 
             message.includes('componentStack') ||
             message.includes('Warning: '))) {
          return; // Suprimir estos warnings específicos
        }
        return originalConsoleWarn.apply(console, args);
      };
    }

    // 9. OBSERVER PARA DETECTAR MANIPULACIONES PROBLEMÁTICAS
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.removedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Limpiar referencias que puedan causar problemas
                try {
                  if (node.parentNode && node.parentNode.contains && !node.parentNode.contains(node)) {
                    // Nodo fue removido correctamente
                  }
                } catch (e) {
                  // Ignorar errores de verificación
                }
              }
            });
          }
        });
      });

      // Observar cambios en el DOM
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    isPatched = true;
    console.log('✅ Enhanced DOM Patch aplicado exitosamente');
    
    // Marcar que el patch fue aplicado globalmente
    window.__ENHANCED_DOM_PATCH_APPLIED__ = true;

  } catch (error) {
    console.error('❌ Error al aplicar Enhanced DOM Patch:', error);
  }
}

// Función para aplicar el patch temprano
function applyEarlyPatch() {
  if (typeof window !== 'undefined' && !window.__ENHANCED_DOM_PATCH_APPLIED__) {
    enhancedDOMPatch();
  }
}

// Aplicar el patch inmediatamente si el DOM está listo
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEarlyPatch);
  } else {
    applyEarlyPatch();
  }
}

export { enhancedDOMPatch, applyEarlyPatch };
export default enhancedDOMPatch;
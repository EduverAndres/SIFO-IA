// src/hooks/useSafeRender.js - Hook para prevenir errores de DOM
import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar renderizado seguro y prevenir errores de DOM
 */
function useSafeRender() {
  const mountedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Función para verificar si el componente sigue montado
  const isMounted = useCallback(() => {
    return mountedRef.current;
  }, []);

  // Función segura para actualizar estado
  const safeSetState = useCallback((setterFunction) => {
    return (...args) => {
      if (isMounted()) {
        try {
          setterFunction(...args);
        } catch (error) {
          console.warn('SafeRender: Error en setState interceptado:', error.message);
        }
      }
    };
  }, [isMounted]);

  // Función para manejar operaciones DOM seguras
  const safeDOMOperation = useCallback((operation, fallback = null) => {
    try {
      if (!isMounted()) {
        console.warn('SafeRender: Componente no montado, operación DOM cancelada');
        return fallback;
      }
      
      return operation();
    } catch (error) {
      console.warn('SafeRender: Error en operación DOM:', error.message);
      
      // Si es un error de insertBefore, intentar alternativa
      if (error.message.includes('insertBefore') && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`SafeRender: Reintentando operación DOM (${retryCountRef.current}/${maxRetries})`);
        
        // Intentar después de un micro-delay
        setTimeout(() => {
          try {
            return operation();
          } catch (retryError) {
            console.warn('SafeRender: Reintento falló:', retryError.message);
            return fallback;
          }
        }, 0);
      }
      
      return fallback;
    }
  }, [isMounted]);

  // Función para limpiar referencias DOM problemáticas
  const cleanupDOMRefs = useCallback(() => {
    try {
      // Limpiar cualquier referencia DOM que pueda estar causando problemas
      const problematicElements = document.querySelectorAll('[data-react-problematic]');
      problematicElements.forEach(element => {
        try {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (cleanupError) {
          console.warn('SafeRender: Error en limpieza DOM:', cleanupError.message);
        }
      });
    } catch (error) {
      console.warn('SafeRender: Error general en limpieza:', error.message);
    }
  }, []);

  // Función para manejar errores de renderizado
  const handleRenderError = useCallback((error, errorInfo) => {
    console.group('🛡️ SafeRender - Error Manejado');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();

    // Limpiar DOM problemático
    cleanupDOMRefs();

    // Reset del contador de reintentos si es necesario
    if (error.message.includes('insertBefore')) {
      retryCountRef.current = 0;
    }
  }, [cleanupDOMRefs]);

  return {
    isMounted,
    safeSetState,
    safeDOMOperation,
    cleanupDOMRefs,
    handleRenderError
  };
}

export default useSafeRender;
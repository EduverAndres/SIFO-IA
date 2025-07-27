// ===============================================
// 🔧 ErrorBoundary.jsx - ARCHIVO COMPLETO MEJORADO
// ===============================================

import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome, FaBug, FaCode } from 'react-icons/fa';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error) {
    // Generar un ID único para el error
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    return { 
      hasError: true,
      errorId: errorId
    };
  }

  componentDidCatch(error, errorInfo) {
    console.group('🔴 ErrorBoundary - Error Capturado');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
    
    // Clasificar el tipo de error
    const errorType = this.classifyError(error);
    
    // Verificar si es un error de DOM conocido de React 19
    const isDOMError = this.isDOMRelatedError(error);
    const isMapError = this.isMapError(error);
    
    this.setState({
      error: error,
      errorInfo: errorInfo || { componentStack: 'Stack trace no disponible en React 19' },
      errorType: errorType
    });

    // Si es un error de .map(), intentar auto-recuperación inmediata
    if (isMapError && this.state.retryCount < 2) {
      console.log('🔄 Auto-recuperación para error de .map()...');
      
      setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1
        }));
      }, 500);
    }
    
    // Si es un error de DOM, intentar auto-recuperación
    else if (isDOMError && this.state.retryCount < 3) {
      console.log('🔄 Intentando auto-recuperación para error de DOM...');
      
      setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1
        }));
      }, 1000);
    }

    // Reportar error a sistema de monitoreo
    this.reportError(error, errorInfo, errorType);
  }

  classifyError(error) {
    if (!error || !error.message) return 'unknown';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('map is not a function')) return 'map_error';
    if (message.includes('insertbefore') || message.includes('removechild')) return 'dom_error';
    if (message.includes('cannot read properties of null')) return 'null_reference';
    if (message.includes('cannot read properties of undefined')) return 'undefined_reference';
    if (message.includes('network error')) return 'network_error';
    if (message.includes('chunk load error')) return 'chunk_error';
    if (message.includes('loading css chunk')) return 'css_chunk_error';
    
    return 'unknown';
  }

  isDOMRelatedError(error) {
    if (!error || !error.message) return false;
    
    const domErrorPatterns = [
      'insertBefore',
      'removeChild',
      'appendChild',
      'not a child of this node',
      'Cannot read properties of null',
      'Failed to execute',
      'Node'
    ];

    return domErrorPatterns.some(pattern => 
      error.message.includes(pattern)
    );
  }

  isMapError(error) {
    if (!error || !error.message) return false;
    return error.message.includes('map is not a function');
  }

  reportError(error, errorInfo, errorType) {
    // Crear reporte detallado del error
    const errorReport = {
      error: error.message || 'Error desconocido',
      stack: error.stack || 'Stack no disponible',
      componentStack: errorInfo?.componentStack || 'Component stack no disponible',
      errorType: errorType,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      retryCount: this.state.retryCount
    };

    console.log('📊 Reportando error a sistema de monitoreo:', errorReport);

    // En producción, aquí enviarías el error a un servicio como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      try {
        // Ejemplo para Sentry:
        // Sentry.captureException(error, { extra: errorReport });
        
        // Ejemplo para endpoint propio:
        // fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorReport)
        // });
        
        console.log('Error reportado al sistema de monitoreo');
      } catch (reportingError) {
        console.error('Error al reportar el error:', reportingError);
      }
    }
  }

  handleRetry = () => {
    console.log('🔄 Usuario solicitó reintentar...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  }

  handleGoHome = () => {
    console.log('🏠 Usuario navegó al inicio...');
    window.location.href = '/';
  }

  handleReload = () => {
    console.log('🔄 Usuario solicitó recargar página...');
    window.location.reload();
  }

  handleReportBug = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      errorId: this.state.errorId,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    const mailtoLink = `mailto:soporte@sifo.com?subject=Error en SIFO - ${this.state.errorId}&body=Detalles del error:%0A%0A${encodeURIComponent(JSON.stringify(errorDetails, null, 2))}`;
    window.open(mailtoLink);
  }

  getErrorSolution(errorType) {
    const solutions = {
      map_error: {
        title: '🔧 Error de Datos',
        description: 'Los datos no tienen el formato esperado. Esto suele ocurrir cuando la API devuelve una estructura diferente.',
        solutions: [
          'Verificar la conexión con el servidor',
          'Refrescar la página para recargar los datos',
          'Contactar soporte si el problema persiste'
        ]
      },
      dom_error: {
        title: '🔧 Error de Interfaz',
        description: 'Problema temporal de compatibilidad con el navegador.',
        solutions: [
          'Refrescar la página',
          'Limpiar caché del navegador',
          'Actualizar el navegador si es muy antiguo'
        ]
      },
      network_error: {
        title: '🌐 Error de Conexión',
        description: 'No se pudo conectar con el servidor.',
        solutions: [
          'Verificar la conexión a internet',
          'Intentar nuevamente en unos minutos',
          'Contactar al administrador del sistema'
        ]
      },
      chunk_error: {
        title: '📦 Error de Carga',
        description: 'Error al cargar recursos de la aplicación.',
        solutions: [
          'Refrescar la página completamente',
          'Limpiar caché del navegador',
          'Verificar conexión a internet'
        ]
      },
      null_reference: {
        title: '⚡ Error de Referencia',
        description: 'Se intentó acceder a datos que no existen.',
        solutions: [
          'Refrescar la página',
          'Verificar que los datos se hayan cargado correctamente',
          'Intentar la acción nuevamente'
        ]
      },
      unknown: {
        title: '❓ Error Desconocido',
        description: 'Ha ocurrido un error inesperado.',
        solutions: [
          'Intentar refrescar la página',
          'Reportar el error al equipo técnico',
          'Intentar usando un navegador diferente'
        ]
      }
    };

    return solutions[errorType] || solutions.unknown;
  }

  render() {
    if (this.state.hasError) {
      const errorType = this.state.errorType;
      const isDOMError = this.isDOMRelatedError(this.state.error);
      const isMapError = this.isMapError(this.state.error);
      const solution = this.getErrorSolution(errorType);

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-2xl mr-4" />
                <div>
                  <h1 className="text-2xl font-bold">
                    {isMapError ? '🔧 Error de Datos' : 
                     isDOMError ? '🔧 Problema Técnico Temporal' : 
                     '❌ Algo Salió Mal'}
                  </h1>
                  <p className="text-red-100 mt-1">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Descripción del Error */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {solution.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {solution.description}
                </p>

                {/* Auto-recuperación en progreso */}
                {(isMapError || isDOMError) && this.state.retryCount < 3 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <p className="text-sm text-blue-800">
                        🔄 Auto-recuperación en progreso... ({this.state.retryCount + 1}/3)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Soluciones Sugeridas */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  💡 Soluciones Sugeridas:
                </h3>
                <ul className="space-y-2">
                  {solution.solutions.map((sol, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Información Técnica (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-6 bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-4">
                    🔍 Información Técnica (Desarrollo)
                  </summary>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-red-700 mb-2">Tipo de Error:</p>
                      <pre className="bg-gray-100 p-3 rounded text-gray-800 text-xs">
                        {errorType}
                      </pre>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-700 mb-2">Mensaje de Error:</p>
                      <pre className="bg-red-50 p-3 rounded text-red-600 overflow-auto max-h-32 text-xs">
                        {this.state.error?.toString()}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <p className="font-semibold text-red-700 mb-2">Component Stack:</p>
                        <pre className="bg-red-50 p-3 rounded text-red-600 overflow-auto max-h-32 text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Error ID: {this.state.errorId}</p>
                      <p>Reintentos: {this.state.retryCount}</p>
                      <p>URL: {window.location.href}</p>
                      <p>Timestamp: {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </details>
              )}

              {/* Acciones de Recuperación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FaRedo className="mr-2" />
                  Reintentar
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  🔄 Recargar
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FaHome className="mr-2" />
                  Ir al Inicio
                </button>
                
                <button
                  onClick={this.handleReportBug}
                  className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FaBug className="mr-2" />
                  Reportar
                </button>
              </div>

              {/* Información de Soporte */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">
                    Si el problema persiste, por favor contacta a soporte técnico.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <span className="font-mono bg-gray-100 p-2 rounded">
                      Error: SIFO-{this.state.errorId}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para envolver componentes fácilmente
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <EnhancedErrorBoundary fallback={fallback}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    );
  };
};

// Hook para reportar errores manualmente
export const useErrorHandler = () => {
  return React.useCallback((error, errorInfo = {}) => {
    console.error('Error reportado manualmente:', error);
    
    // Aquí podrías enviar el error a tu sistema de monitoreo
    const errorReport = {
      error: error.message || String(error),
      stack: error.stack || 'No stack available',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...errorInfo
    };
    
    console.log('📊 Error manual reportado:', errorReport);
  }, []);
};

export default EnhancedErrorBoundary;
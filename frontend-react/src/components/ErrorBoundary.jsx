// src/components/ErrorBoundary.jsx - Versión mejorada para React 19
import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      retryCount: 0
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
    
    // Verificar si es un error de DOM conocido de React 19
    const isDOMError = this.isDOMRelatedError(error);
    
    this.setState({
      error: error,
      errorInfo: errorInfo || { componentStack: 'Stack trace no disponible en React 19' }
    });

    // Si es un error de DOM, intentar auto-recuperación
    if (isDOMError && this.state.retryCount < 3) {
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

    // Reportar error en producción (opcional)
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
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

  reportError(error, errorInfo) {
    // Aquí puedes enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    console.log('📊 Reportando error a sistema de monitoreo:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack
    });
  }

  handleRetry = () => {
    // Limpiar cualquier estado corrupto
    if (typeof window !== 'undefined') {
      // Forzar limpieza de memoria
      if (window.gc) {
        window.gc();
      }
      
      // Limpiar timers que puedan estar causando problemas
      const highestTimeoutId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  handleGoHome = () => {
    // Ir al home y limpiar el estado
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDOMError = this.isDOMRelatedError(this.state.error);
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-gray-200">
            {/* Header del Error */}
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {isDOMError ? '🔧 Problema Técnico Temporal' : '❌ Algo Salió Mal'}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                {isDOMError 
                  ? 'Detectamos un problema de compatibilidad que estamos solucionando automáticamente.'
                  : 'Hemos encontrado un error inesperado en la aplicación.'
                }
              </p>
            </div>

            {/* Información del Error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-8 bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-4">
                  🔍 Detalles Técnicos (Desarrollo)
                </summary>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-red-700 mb-2">Error:</p>
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
                  
                  <div className="text-xs text-gray-500">
                    Error ID: {this.state.errorId}
                  </div>
                </div>
              </details>
            )}

            {/* Acciones de Recuperación */}
            <div className="space-y-4">
              {isDOMError && this.state.retryCount < 3 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    🔄 Auto-recuperación en progreso... ({this.state.retryCount}/3)
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FaRedo className="mr-2" />
                  Reintentar
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FaHome className="mr-2" />
                  Ir al Inicio
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  🔄 Recargar
                </button>
              </div>
            </div>

            {/* Información de Soporte */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">
                  Si el problema persiste, por favor contacta a soporte técnico.
                </p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                  Error Code: SIFO-{this.state.errorId}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
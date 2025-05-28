// ErrorBoundary.jsx - Versión corregida para React 19
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la interfaz de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registra el error para debugging con validaciones adicionales
    console.error('ErrorBoundary caught an error:', error);
    
    // Validar que errorInfo no sea null antes de usarlo
    if (errorInfo) {
      console.error('Error info:', errorInfo);
    } else {
      console.warn('ErrorInfo is null - this can happen in React 19');
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo || { componentStack: 'Stack trace not available' }
    });
  }

  render() {
    if (this.state.hasError) {
      // Interfaz de fallback personalizada
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-2">¡Oops! Algo salió mal</h2>
              <p className="text-gray-700 mb-4">
                Ha ocurrido un error inesperado en la aplicación. Esto puede ser debido a:
              </p>
              <ul className="text-sm text-gray-600 text-left mb-4 space-y-1">
                <li>• Incompatibilidades con React 19</li>
                <li>• Problemas de renderizado de componentes</li>
                <li>• Errores en la gestión del estado</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Intentar de Nuevo
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Recargar Página
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 bg-gray-50 rounded p-3">
                <summary className="cursor-pointer text-sm text-gray-600 font-medium hover:text-gray-800">
                  Detalles del error (solo en desarrollo)
                </summary>
                <div className="mt-3 space-y-2">
                  {this.state.error && (
                    <div>
                      <p className="text-xs font-semibold text-red-700">Error:</p>
                      <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    <div>
                      <p className="text-xs font-semibold text-red-700">Component Stack:</p>
                      <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
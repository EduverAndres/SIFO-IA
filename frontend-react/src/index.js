// src/index.js - Versión actualizada con Enhanced DOM Patch
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// IMPORTANTE: Aplicar el patch ANTES de cualquier cosa de React
import { enhancedDOMPatch } from './utils/domPatch';

// Aplicar el patch inmediatamente
if (typeof window !== 'undefined') {
  enhancedDOMPatch();
}

// Función de inicialización segura
function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('✅ App inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la app:', error);
    
    // Fallback: mostrar mensaje de error
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">SIFO-IA</h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">
              Estamos experimentando problemas técnicos temporales.
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                background: white; 
                color: #667eea; 
                border: none; 
                padding: 12px 24px; 
                border-radius: 25px; 
                font-size: 1rem; 
                cursor: pointer;
                font-weight: bold;
              "
            >
              Reintentar
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
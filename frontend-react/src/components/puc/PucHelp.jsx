// components/puc/PucHelp.jsx
import React from 'react';
import { FaQuestion } from 'react-icons/fa';
import Button from '../ui/Button';

const PucHelp = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative group">
        <Button
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          icon={FaQuestion}
        />
        <div className="absolute bottom-full right-0 mb-2 w-96 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
          <div className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2">💡 Ayuda - PUC Jerárquico Inteligente</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>🏗️ Jerarquía Automática:</strong> Los tipos se determinan automáticamente por dígitos.</p>
              <p><strong>🔍 Validaciones Inteligentes:</strong> Validación en tiempo real de códigos PUC.</p>
              <p><strong>🌳 Vista Árbol:</strong> Visualización jerárquica con indentación por niveles.</p>
              <p><strong>🎯 Filtros Rápidos:</strong> Filtros por clase (1-9) con un click.</p>
              <p><strong>⚡ Autocompletado:</strong> Sugerencias automáticas de tipo, naturaleza y padre.</p>
              <p><strong>💰 Saldos:</strong> Vista de saldo inicial y final en tabla y árbol.</p>
              <p><strong>📊 Movimientos:</strong> Cantidad de movimientos débitos y créditos por cuenta.</p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div><strong>Estructura PUC:</strong></div>
                <div>• Clase: 1 dígito (ej: 1, 2, 3)</div>
                <div>• Grupo: 2 dígitos (ej: 11, 21)</div>
                <div>• Cuenta: 4 dígitos (ej: 1105)</div>
                <div>• Subcuenta: 6 dígitos (ej: 110501)</div>
                <div>• Detalle: 7+ dígitos (ej: 11050101)</div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <strong>Controles del Árbol:</strong> Click en nodos para expandir/contraer
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div><strong>Atajos de Teclado:</strong></div>
                  <div>• Ctrl + N: Nueva cuenta</div>
                  <div>• Ctrl + F: Buscar</div>
                  <div>• Ctrl + E: Exportar</div>
                  <div>• Ctrl + I: Importar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PucHelp;
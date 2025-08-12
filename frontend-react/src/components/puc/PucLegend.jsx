// components/puc/PucLegend.jsx
import React from 'react';
import { FaInfoCircle, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const PucLegend = () => {
  const nivelesInfo = [
    { 
      tipo: 'CLASE', 
      descripcion: '1 dígito', 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      ejemplo: '1, 2, 3, 4, 5, 6',
      icono: '🏛️',
      explicacion: 'Categorías principales del balance'
    },
    { 
      tipo: 'GRUPO', 
      descripcion: '2 dígitos', 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      ejemplo: '11, 21, 31, 41, 51',
      icono: '📁',
      explicacion: 'Subdivisiones de cada clase'
    },
    { 
      tipo: 'CUENTA', 
      descripcion: '4 dígitos', 
      color: 'bg-green-100 text-green-800 border-green-200', 
      ejemplo: '1105, 2105, 4135',
      icono: '📋',
      explicacion: 'Conceptos contables específicos'
    },
    { 
      tipo: 'SUBCUENTA', 
      descripcion: '6 dígitos', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      ejemplo: '110505, 210505',
      icono: '📄',
      explicacion: 'Detalles operativos básicos'
    },
    { 
      tipo: 'DETALLE', 
      descripcion: '8+ dígitos', 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      ejemplo: '11050501, 21050501',
      icono: '🔸',
      explicacion: 'Máximo nivel de detalle'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FaInfoCircle className="mr-2 text-blue-500" />
        Leyenda de Niveles Jerárquicos PUC
      </h4>
      
      {/* Niveles jerárquicos */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {nivelesInfo.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-center mb-3">
              <div className="text-3xl mb-2">{item.icono}</div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${item.color}`}>
                {item.tipo}
              </span>
            </div>
            <div className="text-sm space-y-2">
              <div className="font-medium text-gray-700">{item.descripcion}</div>
              <div className="text-gray-600">{item.explicacion}</div>
              <div className="font-mono text-xs text-gray-500 bg-white p-2 rounded">
                Ej: {item.ejemplo}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Información adicional sobre naturalezas */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="font-semibold text-gray-700 mb-3">Naturalezas Contables por Clase:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h6 className="font-medium text-green-800 mb-2 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              DÉBITO
            </h6>
            <div className="text-sm text-green-700">
              <div><strong>Clases:</strong> 1, 5, 6, 7, 8</div>
              <div><strong>Ejemplos:</strong> Activos, Gastos, Costos</div>
              <div className="text-xs mt-1">Se incrementa por el débito, disminuye por el crédito</div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h6 className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              CRÉDITO
            </h6>
            <div className="text-sm text-blue-700">
              <div><strong>Clases:</strong> 2, 3, 4, 9</div>
              <div><strong>Ejemplos:</strong> Pasivos, Patrimonio, Ingresos</div>
              <div className="text-xs mt-1">Se incrementa por el crédito, disminuye por el débito</div>
            </div>
          </div>
        </div>

        {/* Información sobre movimientos */}
        <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
          <FaChartLine className="mr-2 text-purple-600" />
          Información sobre Movimientos:
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h6 className="font-medium text-red-800 mb-2 flex items-center">
              <FaArrowDown className="text-red-500 mr-2" />
              MOVIMIENTOS DÉBITOS
            </h6>
            <div className="text-sm text-red-700">
              <div><strong>Qué son:</strong> Cantidad de transacciones que aumentan el saldo</div>
              <div><strong>Para cuentas débito:</strong> Incrementan el saldo de la cuenta</div>
              <div><strong>Para cuentas crédito:</strong> Disminuyen el saldo de la cuenta</div>
              <div className="text-xs mt-1">Se muestran en color rojo en la vista</div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h6 className="font-medium text-green-800 mb-2 flex items-center">
              <FaArrowUp className="text-green-500 mr-2" />
              MOVIMIENTOS CRÉDITOS
            </h6>
            <div className="text-sm text-green-700">
              <div><strong>Qué son:</strong> Cantidad de transacciones que disminuyen el saldo</div>
              <div><strong>Para cuentas débito:</strong> Disminuyen el saldo de la cuenta</div>
              <div><strong>Para cuentas crédito:</strong> Incrementan el saldo de la cuenta</div>
              <div className="text-xs mt-1">Se muestran en color verde en la vista</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PucLegend;
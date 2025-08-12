// components/puc/PucHeader.jsx
import React from 'react';
import { 
  FaTree, 
  FaPlus, 
  FaUpload, 
  FaDownload, 
  FaFileAlt,
  FaClipboardList,
  FaLayerGroup,
  FaBuilding,
  FaChartLine,
  FaMoneyBillWave,
  FaBalanceScale
} from 'react-icons/fa';
import Button from '../ui/Button';

const PucHeader = ({ 
  estadisticas, 
  onNuevaCuenta, 
  onImportar, 
  onExportar, 
  onDescargarTemplate,
  loading 
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent flex items-center">
          <FaTree className="mr-3 text-green-600" />
          Plan Único de Cuentas (PUC)
        </h1>
        <p className="text-gray-600">
          Gestión inteligente con jerarquía automática y validaciones PUC estándar colombiano
        </p>
        
        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
              <FaClipboardList className="text-blue-600" />
              <div>
                <span className="text-xs text-gray-600 block">Total</span>
                <span className="font-bold text-blue-600">{estadisticas.total}</span>
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
              <FaLayerGroup className="text-purple-600" />
              <div>
                <span className="text-xs text-gray-600 block">Clases</span>
                <span className="font-bold text-purple-600">{estadisticas.por_tipo?.clases || 0}</span>
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
              <FaBuilding className="text-orange-600" />
              <div>
                <span className="text-xs text-gray-600 block">Grupos</span>
                <span className="font-bold text-orange-600">{estadisticas.por_tipo?.grupos || 0}</span>
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
              <FaChartLine className="text-green-600" />
              <div>
                <span className="text-xs text-gray-600 block">Con Movimientos</span>
                <span className="font-bold text-green-600">{estadisticas.acepta_movimientos}</span>
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
              <FaMoneyBillWave className="text-red-600" />
              <div>
                <span className="text-xs text-gray-600 block">Débito</span>
                <span className="font-bold text-red-600">{estadisticas.por_naturaleza?.debito || 0}</span>
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border flex items-center space-x-2">
              <FaBalanceScale className="text-indigo-600" />
              <div>
                <span className="text-xs text-gray-600 block">Crédito</span>
                <span className="font-bold text-indigo-600">{estadisticas.por_naturaleza?.credito || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onNuevaCuenta}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          icon={FaPlus}
        >
          Nueva Cuenta
        </Button>
        
        <Button
          onClick={onImportar}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          icon={FaUpload}
        >
          Importar Excel
        </Button>
        
        <Button
          onClick={onExportar}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          icon={FaDownload}
        >
          Exportar
        </Button>

        <Button
          onClick={onDescargarTemplate}
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          icon={FaFileAlt}
          loading={loading}
        >
          Template
        </Button>
      </div>
    </div>
  );
};

export default PucHeader;
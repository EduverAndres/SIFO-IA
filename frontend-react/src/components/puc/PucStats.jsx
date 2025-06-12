// src/components/puc/PucStats.jsx
import React from 'react';
import {
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaBalance,
  FaCreditCard,
  FaMoneyBillWave,
  FaBuilding,
  FaUsers,
  FaBoxes,
  FaReceipt,
  FaDollarSign,
  FaShoppingCart
} from 'react-icons/fa';

const StatCard = ({ title, value, icon: Icon, color, bgColor, textColor, subtitle }) => (
  <div className={`${bgColor} rounded-xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-200`}>
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="text-xl text-white" />
      </div>
    </div>
  </div>
);

const ClaseCard = ({ codigo, nombre, cantidad, total }) => {
  const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
  
  const getClaseColor = (codigo) => {
    const colors = {
      '1': 'from-blue-500 to-blue-600',
      '2': 'from-red-500 to-red-600', 
      '3': 'from-green-500 to-green-600',
      '4': 'from-purple-500 to-purple-600',
      '5': 'from-orange-500 to-orange-600',
      '6': 'from-teal-500 to-teal-600'
    };
    return colors[codigo] || 'from-gray-500 to-gray-600';
  };

  const getClaseIcon = (codigo) => {
    const icons = {
      '1': FaBuilding,      // Activos
      '2': FaCreditCard,    // Pasivos
      '3': FaUsers,         // Patrimonio
      '4': FaMoneyBillWave, // Ingresos
      '5': FaReceipt,       // Gastos
      '6': FaShoppingCart   // Costos
    };
    const Icon = icons[codigo] || FaBoxes;
    return Icon;
  };

  const Icon = getClaseIcon(codigo);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${getClaseColor(codigo)}`}>
            <Icon className="text-white text-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{codigo}</span>
              <span className="font-medium text-gray-800 text-sm">{nombre}</span>
            </div>
          </div>
        </div>
        <span className="text-lg font-bold text-gray-700">{cantidad}</span>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${getClaseColor(codigo)}`}
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">{porcentaje}%</p>
    </div>
  );
};

const PucStats = ({ stats }) => {
  // Valores por defecto en caso de que stats esté vacío
  const {
    total_cuentas = 0,
    cuentas_activas = 0,
    cuentas_inactivas = 0,
    por_tipo = {},
    por_naturaleza = {},
    por_clase = {}
  } = stats || {};

  // Calcular estadísticas derivadas
  const porcentajeActivas = total_cuentas > 0 ? ((cuentas_activas / total_cuentas) * 100).toFixed(1) : 0;
  const totalDebito = por_naturaleza?.DEBITO || 0;
  const totalCredito = por_naturaleza?.CREDITO || 0;

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Cuentas"
          value={total_cuentas.toLocaleString()}
          icon={FaChartBar}
          color="bg-blue-500"
          bgColor="bg-white"
          textColor="text-blue-600"
          subtitle="En el sistema"
        />
        
        <StatCard
          title="Cuentas Activas"
          value={cuentas_activas.toLocaleString()}
          icon={FaCheckCircle}
          color="bg-green-500"
          bgColor="bg-white"
          textColor="text-green-600"
          subtitle={`${porcentajeActivas}% del total`}
        />

        <StatCard
          title="Naturaleza Débito"
          value={totalDebito.toLocaleString()}
          icon={FaDollarSign}
          color="bg-purple-500"
          bgColor="bg-white"
          textColor="text-purple-600"
          subtitle="Activos, Gastos, Costos"
        />

        <StatCard
          title="Naturaleza Crédito"
          value={totalCredito.toLocaleString()}
          icon={FaBalance}
          color="bg-orange-500"
          bgColor="bg-white"
          textColor="text-orange-600"
          subtitle="Pasivos, Patrimonio, Ingresos"
        />
      </div>

      {/* Estadísticas por tipo */}
      {Object.keys(por_tipo).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBoxes className="text-blue-500" />
            Distribución por Tipo de Cuenta
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(por_tipo).map(([tipo, cantidad]) => (
              <div key={tipo} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{cantidad}</div>
                <div className="text-sm text-gray-600 capitalize">{tipo.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas por clase contable */}
      {Object.keys(por_clase).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-indigo-500" />
            Plan de Cuentas por Clase Contable
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(por_clase).map(([codigo, info]) => (
              <ClaseCard
                key={codigo}
                codigo={codigo}
                nombre={info.nombre || `Clase ${codigo}`}
                cantidad={info.cantidad || 0}
                total={total_cuentas}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resumen rápido */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-blue-800">Estado del Plan de Cuentas</h4>
            <p className="text-blue-600 text-sm">
              Sistema contable con {total_cuentas} cuentas configuradas
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              porcentajeActivas >= 80 
                ? 'bg-green-100 text-green-800' 
                : porcentajeActivas >= 60 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {porcentajeActivas >= 80 ? '✅ Excelente' : 
               porcentajeActivas >= 60 ? '⚠️ Bueno' : '❌ Revisar'}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {porcentajeActivas}% cuentas activas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PucStats;
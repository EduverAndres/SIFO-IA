// src/pages/dashboard/DashboardOverview.jsx
import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaBuilding,
  FaRocket,
  FaCoins,
  FaCreditCard,
  FaWallet,
  FaCalendarAlt,
  FaEye,
  FaDownload
} from 'react-icons/fa';

// Recharts imports
import {
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const DashboardOverview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [animationKey, setAnimationKey] = useState(0);

  // Efecto para animaciones
  useEffect(() => {
    const timer = setTimeout(() => setAnimationKey(1), 300);
    return () => clearTimeout(timer);
  }, []);

  // Datos estadísticos principales
  const mainStats = [
    {
      title: 'Ingresos Totales',
      value: '$8,547,280',
      change: '+23.8%',
      trend: 'up',
      icon: FaMoneyBillWave,
      description: 'vs período anterior',
      gradient: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Rentabilidad',
      value: '38.4%',
      change: '+5.2%',
      trend: 'up',
      icon: FaChartLine,
      description: 'margen neto',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Flujo de Caja',
      value: '$2,847,360',
      change: '+18.7%',
      trend: 'up',
      icon: FaWallet,
      description: 'disponible',
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'ROI Anual',
      value: '42.1%',
      change: '+7.3%',
      trend: 'up',
      icon: FaArrowUp, // ✅ CORREGIDO: FaTrendingUp → FaArrowUp
      description: 'retorno inversión',
      gradient: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50'
    }
  ];

  // Datos para gráficas financieras
  const monthlyFinancialData = [
    { mes: 'Ene', ingresos: 1200000, gastos: 720000, utilidad: 480000, roi: 40.0 },
    { mes: 'Feb', ingresos: 1450000, gastos: 870000, utilidad: 580000, roi: 40.0 },
    { mes: 'Mar', ingresos: 1380000, gastos: 828000, utilidad: 552000, roi: 40.0 },
    { mes: 'Abr', ingresos: 1680000, gastos: 940800, utilidad: 739200, roi: 44.0 },
    { mes: 'May', ingresos: 1950000, gastos: 1092000, utilidad: 858000, roi: 44.0 },
    { mes: 'Jun', ingresos: 2100000, gastos: 1176000, utilidad: 924000, roi: 44.0 },
    { mes: 'Jul', ingresos: 2350000, gastos: 1269000, utilidad: 1081000, roi: 46.0 },
    { mes: 'Ago', ingresos: 2180000, gastos: 1176400, utilidad: 1003600, roi: 46.0 },
    { mes: 'Sep', ingresos: 2420000, gastos: 1307600, utilidad: 1112400, roi: 46.0 },
    { mes: 'Oct', ingresos: 2650000, gastos: 1431000, utilidad: 1219000, roi: 46.0 }, // ✅ CORREGIDO: ingreses → ingresos
    { mes: 'Nov', ingresos: 2580000, gastos: 1393200, utilidad: 1186800, roi: 46.0 },
    { mes: 'Dic', ingresos: 2847360, gastos: 1538834, utilidad: 1308526, roi: 46.0 }
  ];

  const profitabilityData = [
    { trimestre: 'Q1 2024', utilidadBruta: 65.2, utilidadOperacional: 42.8, utilidadNeta: 38.4 },
    { trimestre: 'Q2 2024', utilidadBruta: 67.1, utilidadOperacional: 44.2, utilidadNeta: 40.1 },
    { trimestre: 'Q3 2024', utilidadBruta: 68.9, utilidadOperacional: 45.6, utilidadNeta: 41.3 },
    { trimestre: 'Q4 2024', utilidadBruta: 70.2, utilidadOperacional: 47.1, utilidadNeta: 42.8 }
  ];

  const cashFlowData = [
    { mes: 'Ene', operacional: 450000, inversion: -120000, financiamiento: 80000 },
    { mes: 'Feb', operacional: 520000, inversion: -95000, financiamiento: 60000 },
    { mes: 'Mar', operacional: 480000, inversion: -150000, financiamiento: 100000 },
    { mes: 'Abr', operacional: 620000, inversion: -80000, financiamiento: 40000 },
    { mes: 'May', operacional: 720000, inversion: -200000, financiamiento: 120000 },
    { mes: 'Jun', operacional: 780000, inversion: -160000, financiamiento: 90000 },
    { mes: 'Jul', operacional: 850000, inversion: -180000, financiamiento: 110000 },
    { mes: 'Ago', operacional: 820000, inversion: -140000, financiamiento: 85000 },
    { mes: 'Sep', operacional: 920000, inversion: -220000, financiamiento: 130000 },
    { mes: 'Oct', operacional: 980000, inversion: -190000, financiamiento: 105000 },
    { mes: 'Nov', operacional: 950000, inversion: -170000, financiamiento: 95000 },
    { mes: 'Dic', operacional: 1050000, inversion: -250000, financiamiento: 150000 }
  ];

  const expenseBreakdown = [
    { categoria: 'Operaciones', valor: 4280000, porcentaje: 42.8, color: '#3b82f6' },
    { categoria: 'Personal', valor: 2850000, porcentaje: 28.5, color: '#10b981' },
    { categoria: 'Marketing', valor: 1520000, porcentaje: 15.2, color: '#f59e0b' },
    { categoria: 'Tecnología', valor: 950000, porcentaje: 9.5, color: '#8b5cf6' },
    { categoria: 'Otros', valor: 400000, porcentaje: 4.0, color: '#ef4444' }
  ];

  const kpiData = [
    { indicador: 'Liquidez', valor: 85, meta: 80 },
    { indicador: 'Rentabilidad', valor: 92, meta: 85 },
    { indicador: 'Eficiencia', valor: 78, meta: 75 },
    { indicador: 'Crecimiento', valor: 95, meta: 90 },
    { indicador: 'Solvencia', valor: 88, meta: 85 },
    { indicador: 'Productividad', valor: 82, meta: 80 }
  ];

  const topMetrics = [
    {
      title: 'EBITDA',
      value: '$3,847,280',
      change: '+24.5%',
      icon: FaCoins,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Margen Operacional',
      value: '47.1%',
      change: '+3.2%',
      icon: FaCreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Días de Cobro',
      value: '32 días',
      change: '-8 días',
      icon: FaCalendarAlt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Capital de Trabajo',
      value: '$1,247,850',
      change: '+15.8%',
      icon: FaBuilding,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 space-y-8">
      {/* Header Principal */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FaRocket className="text-5xl mr-6 text-yellow-300" />
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight">Dashboard Financiero</h1>
                <p className="text-blue-100 text-xl font-medium">Análisis Ejecutivo • Período 2024</p>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-4">
              {['12m', '6m', '3m'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedPeriod === period
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {period === '12m' ? '12 Meses' : period === '6m' ? '6 Meses' : '3 Meses'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
              <span className="text-sm font-semibold">📊 Performance: Excelente</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
              <span className="text-sm font-semibold">🎯 Meta Anual: 95% Cumplida</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
              <span className="text-sm font-semibold">⚡ Actualizado: Tiempo Real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="group bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${stat.gradient}`}></div>
              
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:rotate-6`}>
                  <IconComponent className="text-3xl text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${stat.bgColor} ${stat.trend === 'up' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {stat.trend === 'up' ? '↗️' : '↘️'} {stat.change}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2 font-semibold uppercase tracking-wider">{stat.title}</p>
                <p className="text-4xl font-bold text-gray-800 mb-3">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.description}</p>
              </div>

              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full -mr-10 -mb-10"></div>
            </div>
          );
        })}
      </div>

      {/* Gráfica Principal - Análisis Financiero Completo */}
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mr-4"></div>
              Análisis Financiero Integral
            </h3>
            <p className="text-gray-600 mt-2 text-lg">Ingresos, gastos, utilidad y ROI mensual</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
              <FaEye className="mr-2" />
              Ver Detalle
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <FaDownload className="mr-2" />
              Exportar
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart data={monthlyFinancialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorUtilidad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" tick={{fontSize:12, fill: '#6b7280'}} />
            <YAxis yAxisId="left" tickFormatter={(v)=>`$${(v/1000).toLocaleString()}k`} tick={{fontSize:12, fill: '#6b7280'}} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>`${v}%`} tick={{fontSize:12, fill: '#6b7280'}} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'roi') return [`${value}%`, 'ROI'];
                return [`$${value.toLocaleString()}`, name];
              }}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                border: 'none', 
                borderRadius: '16px', 
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' 
              }}
            />
            <Area yAxisId="left" type="monotone" dataKey="ingresos" stroke="#10b981" fill="url(#colorIngresos)" strokeWidth={4} />
            <Area yAxisId="left" type="monotone" dataKey="utilidad" stroke="#3b82f6" fill="url(#colorUtilidad)" strokeWidth={4} />
            <Bar yAxisId="left" dataKey="gastos" fill="#ef4444" opacity={0.6} radius={[6, 6, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#f59e0b" strokeWidth={4} dot={{ fill: '#f59e0b', strokeWidth: 3, r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Segunda Fila de Gráficas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Flujo de Caja */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mr-3"></div>
                Flujo de Caja
              </h4>
              <p className="text-gray-600 mt-1">Operacional, inversión y financiamiento</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" tick={{fontSize:11, fill: '#6b7280'}} />
              <YAxis tickFormatter={(v)=>`$${(v/1000).toLocaleString()}k`} tick={{fontSize:11, fill: '#6b7280'}} />
              <Tooltip 
                formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Legend />
              <Bar dataKey="operacional" stackId="a" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="inversion" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="financiamiento" stackId="a" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de Gastos */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3"></div>
                Distribución de Gastos
              </h4>
              <p className="text-gray-600 mt-1">Breakdown por categorías</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                dataKey="valor"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={8}
                strokeWidth={3}
                stroke="#ffffff"
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tercera Fila de Gráficas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* KPIs Radar */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full mr-3"></div>
              KPIs Clave
            </h4>
            <p className="text-gray-600 mt-1">Indicadores vs metas</p>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={kpiData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="indicador" tick={{fontSize:10, fill: '#6b7280'}} />
              <PolarRadiusAxis domain={[0, 100]} tick={{fontSize:10, fill: '#6b7280'}} />
              <Radar name="Actual" dataKey="valor" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={3} />
              <Radar name="Meta" dataKey="meta" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Métricas Adicionales */}
        <div className="xl:col-span-2 bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mr-3"></div>
              Métricas Financieras Clave
            </h4>
            <p className="text-gray-600 mt-1">Indicadores operacionales y estratégicos</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{metric.title}</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{metric.value}</p>
                      <p className={`text-sm font-bold mt-1 ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                        {metric.change.startsWith('+') ? '↗️' : '↘️'} {metric.change}
                      </p>
                    </div>
                    <div className={`p-4 rounded-2xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`text-2xl ${metric.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer con Resumen Ejecutivo */}
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-gray-200/50 shadow-xl">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <FaCheckCircle className="text-emerald-500 mr-3" />
            Resumen Ejecutivo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">+23.8%</div>
              <div className="text-sm text-gray-600 mt-1">Crecimiento Ingresos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">42.8%</div>
              <div className="text-sm text-gray-600 mt-1">Margen Neto Final</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">95%</div>
              <div className="text-sm text-gray-600 mt-1">Cumplimiento Metas</div>
            </div>
          </div>
          <p className="text-gray-700 mt-6 max-w-3xl mx-auto leading-relaxed">
            <strong>Performance excepcional</strong> durante 2024 con crecimiento sostenido en todas las métricas clave. 
            La empresa mantiene una posición financiera sólida con excelentes indicadores de rentabilidad y liquidez.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

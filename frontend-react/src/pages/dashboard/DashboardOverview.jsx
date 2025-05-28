// src/pages/dashboard/DashboardOverview.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaCalculator,
  FaChartLine,
  FaFileInvoiceDollar,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaHandHoldingUsd,
  FaExchangeAlt,
  FaRobot,
  FaProjectDiagram,
  FaWallet,
  FaUserTie,
  FaReceipt,
  FaDatabase,
  FaUsersCog,
  FaPiggyBank,
  FaSearch,
  FaFilter,
  FaEye,
  FaPlay,
  FaStar,
} from 'react-icons/fa';

const DashboardOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Datos simulados para el overview
  const quickStats = [
    {
      title: 'Ventas del Mes',
      value: '$125,430',
      change: '+12.5%',
      trend: 'up',
      icon: FaMoneyBillWave,
      color: 'green'
    },
    {
      title: 'Órdenes Pendientes',
      value: '28',
      change: '-8.2%',
      trend: 'down',
      icon: FaShoppingCart,
      color: 'blue'
    },
    {
      title: 'Facturas por Cobrar',
      value: '$45,200',
      change: '+3.1%',
      trend: 'up',
      icon: FaFileInvoiceDollar,
      color: 'yellow'
    },
    {
      title: 'Clientes Activos',
      value: '1,247',
      change: '+15.3%',
      trend: 'up',
      icon: FaUsers,
      color: 'purple'
    }
  ];

  // Módulos financieros con categorías y estado
  const financialModules = [
    {
      title: 'Órdenes de Compra',
      description: 'Gestiona órdenes de compra, proveedores y seguimiento de entregas',
      icon: FaShoppingCart,
      link: '/dashboard/ordenes-compra',
      category: 'compras',
      status: 'active',
      priority: 'high',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      features: ['Gestión de proveedores', 'Seguimiento de órdenes', 'Reportes automáticos']
    },
    {
      title: 'Presupuesto',
      description: 'Planifica y controla presupuestos empresariales',
      icon: FaPiggyBank,
      link: '/dashboard/presupuesto',
      category: 'planificacion',
      status: 'development',
      priority: 'high',
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      features: ['Planificación anual', 'Control de gastos', 'Alertas de límites']
    },
    {
      title: 'Reportes Financieros',
      description: 'Genera reportes detallados y análisis financieros',
      icon: FaChartLine,
      link: '/dashboard/reportes',
      category: 'reportes',
      status: 'development',
      priority: 'medium',
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600',
      features: ['Gráficos interactivos', 'Exportar PDF/Excel', 'Análisis predictivo']
    },
    {
      title: 'Cuentas por Pagar/Cobrar',
      description: 'Administra cuentas pendientes y flujo de efectivo',
      icon: FaHandHoldingUsd,
      link: '/dashboard/cuentas-pagar',
      category: 'cuentas',
      status: 'development',
      priority: 'high',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      features: ['Recordatorios automáticos', 'Estados de cuenta', 'Conciliación']
    },
    {
      title: 'Tesorería',
      description: 'Gestiona liquidez y flujos de caja empresariales',
      icon: FaMoneyBillWave,
      link: '/dashboard/tesoreria',
      category: 'tesoreria',
      status: 'development',
      priority: 'medium',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
      features: ['Flujo de caja', 'Proyecciones', 'Gestión de liquidez']
    },
    {
      title: 'Conciliación Bancaria',
      description: 'Automatiza procesos de conciliación con entidades bancarias',
      icon: FaExchangeAlt,
      link: '/dashboard/conciliacion',
      category: 'bancos',
      status: 'development',
      priority: 'medium',
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600',
      features: ['Sincronización bancaria', 'Conciliación automática', 'Reportes de diferencias']
    },
    {
      title: 'Procesos IA',
      description: 'Inteligencia artificial para automatización financiera',
      icon: FaRobot,
      link: '/dashboard/procesos-ia',
      category: 'tecnologia',
      status: 'beta',
      priority: 'low',
      color: 'violet',
      gradient: 'from-violet-500 to-purple-600',
      features: ['Predicciones automáticas', 'Detección de anomalías', 'ML financiero']
    },
    {
      title: 'Proyectos Financieros',
      description: 'Gestiona proyectos con componente financiero',
      icon: FaProjectDiagram,
      link: '/dashboard/proyectos',
      category: 'proyectos',
      status: 'development',
      priority: 'medium',
      color: 'indigo',
      gradient: 'from-indigo-500 to-blue-600',
      features: ['Control de presupuesto', 'ROI por proyecto', 'Timeline financiero']
    },
    {
      title: 'Caja y Bancos',
      description: 'Control de movimientos de efectivo y cuentas bancarias',
      icon: FaWallet,
      link: '/dashboard/caja-bancos',
      category: 'bancos',
      status: 'development',
      priority: 'high',
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-600',
      features: ['Arqueo de caja', 'Movimientos bancarios', 'Saldos en tiempo real']
    },
    {
      title: 'Contabilidad NIIF',
      description: 'Contabilidad bajo estándares internacionales',
      icon: FaFileInvoiceDollar,
      link: '/dashboard/contabilidad',
      category: 'contabilidad',
      status: 'development',
      priority: 'high',
      color: 'slate',
      gradient: 'from-slate-500 to-gray-600',
      features: ['Asientos automáticos', 'Estados financieros', 'Cumplimiento NIIF']
    },
    {
      title: 'Nómina',
      description: 'Gestión integral de nómina y recursos humanos',
      icon: FaUserTie,
      link: '/dashboard/nomina',
      category: 'rrhh',
      status: 'development',
      priority: 'medium',
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600',
      features: ['Cálculo automático', 'Prestaciones sociales', 'Reportes laborales']
    },
    {
      title: 'Facturación Electrónica',
      description: 'Genera facturas electrónicas DIAN',
      icon: FaReceipt,
      link: '/dashboard/facturacion',
      category: 'facturacion',
      status: 'development',
      priority: 'high',
      color: 'amber',
      gradient: 'from-amber-500 to-yellow-600',
      features: ['Integración DIAN', 'Envío automático', 'Seguimiento de facturas']
    },
    {
      title: 'Migración de Datos',
      description: 'Importa datos desde otros sistemas',
      icon: FaDatabase,
      link: '/dashboard/migracion',
      category: 'tecnologia',
      status: 'development',
      priority: 'low',
      color: 'gray',
      gradient: 'from-gray-500 to-slate-600',
      features: ['Importación masiva', 'Validación de datos', 'Mapeo inteligente']
    },
    {
      title: 'Integración CRM',
      description: 'Conecta con sistemas de gestión de clientes',
      icon: FaUsersCog,
      link: '/dashboard/crm',
      category: 'integraciones',
      status: 'development',
      priority: 'low',
      color: 'lime',
      gradient: 'from-lime-500 to-green-600',
      features: ['Sincronización CRM', 'Vista 360° clientes', 'Pipeline comercial']
    }
  ];

  // Categorías para filtrado
  const categories = [
    { id: 'all', name: 'Todos los Módulos', count: financialModules.length },
    { id: 'compras', name: 'Compras', count: financialModules.filter(m => m.category === 'compras').length },
    { id: 'planificacion', name: 'Planificación', count: financialModules.filter(m => m.category === 'planificacion').length },
    { id: 'cuentas', name: 'Cuentas', count: financialModules.filter(m => m.category === 'cuentas').length },
    { id: 'bancos', name: 'Bancos', count: financialModules.filter(m => m.category === 'bancos').length },
    { id: 'reportes', name: 'Reportes', count: financialModules.filter(m => m.category === 'reportes').length },
    { id: 'tecnologia', name: 'Tecnología', count: financialModules.filter(m => m.category === 'tecnologia').length }
  ];

  // Filtrar módulos
  const filteredModules = financialModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Función para obtener badge de estado
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Activo</span>;
      case 'beta':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Beta</span>;
      case 'development':
        return <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">En Desarrollo</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Próximamente</span>;
    }
  };

  // Función para obtener icono de prioridad
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <FaStar className="text-yellow-500 text-sm" />;
      case 'medium':
        return <FaStar className="text-gray-400 text-sm" />;
      default:
        return null;
    }
  };

  const recentActivities = [
    {
      type: 'success',
      message: 'Orden de compra #OC-2025-001 completada',
      time: 'Hace 2 horas'
    },
    {
      type: 'warning',
      message: 'Factura #F-2025-0234 próxima a vencer',
      time: 'Hace 4 horas'
    },
    {
      type: 'info',
      message: 'Nuevo proveedor agregado: Tech Solutions S.A.',
      time: 'Hace 6 horas'
    },
    {
      type: 'success',
      message: 'Conciliación bancaria completada',
      time: 'Ayer'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info':
        return <FaClock className="text-blue-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header de bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">¡Bienvenido de vuelta!</h2>
          <p className="text-blue-100 text-lg">Explora todos los módulos financieros disponibles para tu empresa</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</p>
                  <div className="flex items-center">
                    <FaArrowUp className={`text-sm mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500 transform rotate-180'}`} />
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'yellow' ? 'bg-yellow-100' :
                  'bg-purple-100'
                }`}>
                  <IconComponent className={`text-2xl ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'yellow' ? 'text-yellow-600' :
                    'text-purple-600'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Módulos Financieros - Sección principal mejorada */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-3">Módulos Financieros</h3>
          <p className="text-gray-600 text-lg">Accede a todas las herramientas de gestión financiera empresarial</p>
        </div>

        {/* Filtros y búsqueda mejorados */}
        <div className="mb-8 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar módulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>

          {/* Filtros por categoría */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Grid de módulos mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <Link
                key={index}
                to={module.link}
                className="group block"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-blue-300 relative overflow-hidden">
                  {/* Fondo con gradiente sutil */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Header del módulo */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${module.gradient} shadow-lg`}>
                        <IconComponent className="text-2xl text-white" />
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {getPriorityIcon(module.priority)}
                        {getStatusBadge(module.status)}
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {module.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {module.description}
                    </p>

                    {/* Features preview */}
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Características clave:</p>
                      <ul className="space-y-1">
                        {module.features.slice(0, 2).map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Call to action */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                        {module.status === 'active' ? 'Acceder ahora' : 'Ver detalles'}
                      </span>
                      <div className="flex items-center space-x-1">
                        {module.status === 'active' ? (
                          <FaPlay className="text-blue-600 text-sm" />
                        ) : (
                          <FaEye className="text-gray-400 text-sm" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mensaje si no hay resultados */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <FaSearch className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron módulos</h3>
            <p className="text-gray-500">Intenta con diferentes términos de búsqueda o filtros</p>
          </div>
        )}
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Actividad Reciente</h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action final */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 text-center border border-indigo-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">¿Necesitas ayuda?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Nuestro equipo está aquí para ayudarte a aprovechar al máximo todas las funcionalidades del sistema
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard/configuracion"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Configurar Sistema
          </Link>
          <Link
            to="/dashboard/menu-financiero"
            className="px-8 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200 font-medium"
          >
            Ver Módulos Financieros
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
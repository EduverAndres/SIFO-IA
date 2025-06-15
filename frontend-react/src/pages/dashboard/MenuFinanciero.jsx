// src/pages/dashboard/MenuFinanciero.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaChartLine,
  FaFileInvoiceDollar,
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
  FaPlay,
  FaEye,
  FaStar,
  FaArrowLeft,
  FaTree, // ← NUEVO ICONO PARA PUC
  FaListAlt // ← NUEVO ICONO PARA PLAN DE CUENTAS
} from 'react-icons/fa';

const MenuFinanciero = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Módulos financieros completos
  const financialModules = [
    {
      title: 'Producción',
      description: 'Gestiona proveedores, productos y órdenes de compra integralmente',
      icon: FaShoppingCart,
      link: '/dashboard/produccion',
      category: 'compras',
      status: 'active',
      priority: 'high',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      features: ['Crear proveedores', 'Gestionar productos', 'Órdenes de compra']
    },
    // ← NUEVO MÓDULO PUC
    {
      title: 'Plan Único de Cuentas (PUC)',
      description: 'Gestiona la estructura contable con el PUC estándar colombiano',
      icon: FaTree,
      link: '/dashboard/puc',
      category: 'contabilidad',
      status: 'active', // ← ACTIVO
      priority: 'high',
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
      features: ['PUC estándar', 'Gestión de cuentas', 'Estructura jerárquica']
    },
    // ← MÓDULO PLAN DE CUENTAS ORIGINAL
    {
      title: 'Plan de Cuentas',
      description: 'Administra el catálogo general de cuentas contables',
      icon: FaListAlt,
      link: '/dashboard/plan-cuentas',
      category: 'contabilidad',
      status: 'active',
      priority: 'high',
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-600',
      features: ['Catálogo de cuentas', 'Configuración contable', 'Jerarquía personalizada']
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

  // Categorías para filtrado - ACTUALIZADA CON CONTABILIDAD
  const categories = [
    { id: 'all', name: 'Todos', count: financialModules.length },
    { id: 'compras', name: 'Compras', count: financialModules.filter(m => m.category === 'compras').length },
    { id: 'contabilidad', name: 'Contabilidad', count: financialModules.filter(m => m.category === 'contabilidad').length }, // ← NUEVA CATEGORÍA
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

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header con navegación de regreso */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/dashboard" 
            className="flex items-center text-blue-600 hover:text-blue-800 mr-6 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Volver al Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Header principal compacto */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Módulos Financieros</h1>
          <p className="text-blue-100">Accede a todas las herramientas de gestión financiera empresarial</p>
        </div>
      </div>

      {/* Estadísticas rápidas de módulos compactas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-800">{financialModules.length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaChartLine className="text-blue-600 text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Activos</p>
              <p className="text-xl font-bold text-green-600">
                {financialModules.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <FaPlay className="text-green-600 text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">En Desarrollo</p>
              <p className="text-xl font-bold text-orange-600">
                {financialModules.filter(m => m.status === 'development').length}
              </p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <FaEye className="text-orange-600 text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Prioridad</p>
              <p className="text-xl font-bold text-yellow-600">
                {financialModules.filter(m => m.priority === 'high').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <FaStar className="text-yellow-600 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda compactos */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="space-y-3">
          {/* Barra de búsqueda compacta */}
          <div className="relative max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Buscar módulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filtros por categoría compactos */}
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de módulos compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredModules.map((module, index) => {
          const IconComponent = module.icon;
          return (
            <Link
              key={index}
              to={module.link}
              className="group block"
            >
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden h-full group-hover:border-transparent">
                {/* Border dinámico con gradiente en hover */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-0.5`}>
                  <div className="bg-white rounded-lg h-full w-full"></div>
                </div>
                
                {/* Fondo con gradiente sutil */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Header del módulo compacto */}
                <div className="relative z-20 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${module.gradient} shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                      <IconComponent className="text-lg text-white" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getPriorityIcon(module.priority)}
                      {getStatusBadge(module.status)}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                    {module.title}
                  </h4>
                  <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-2">
                    {module.description}
                  </p>

                  {/* Features preview compacto */}
                  <div className="flex-1 mb-3">
                    <div className="space-y-1">
                      {module.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center">
                          <div className={`w-1 h-1 rounded-full mr-2 flex-shrink-0 bg-gradient-to-r ${module.gradient}`}></div>
                          <span className="truncate">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Call to action compacto */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700 group-hover:font-semibold transition-all duration-200">
                      {module.status === 'active' ? 'Acceder' : 'Ver más'}
                    </span>
                    <div className="flex items-center space-x-1">
                      {module.status === 'active' ? (
                        <FaPlay className="text-blue-600 text-xs group-hover:text-blue-700 transition-colors duration-200" />
                      ) : (
                        <FaEye className="text-gray-400 text-xs group-hover:text-gray-600 transition-colors duration-200" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mensaje si no hay resultados compacto */}
      {filteredModules.length === 0 && (
        <div className="text-center py-8 bg-white rounded-xl">
          <FaSearch className="mx-auto text-gray-400 text-3xl mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">No se encontraron módulos</h3>
          <p className="text-gray-500 text-sm">Intenta con diferentes términos de búsqueda o filtros</p>
        </div>
      )}
    </div>
  );
};

export default MenuFinanciero;
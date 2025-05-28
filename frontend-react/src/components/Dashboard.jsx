// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaMoneyBillWave,
  FaShoppingCart,
  FaCalculator,
  FaFileAlt,
  FaUserPlus,
  FaPlus,
  FaBoxOpen,
  FaClipboardList,
  FaUniversity,
  FaExchangeAlt,
  FaRobot,
  FaProjectDiagram,
  FaHandHoldingUsd,
  FaReceipt,
  FaDatabase,
  FaUsersCog,
  FaScroll,
  FaPiggyBank,
  FaWallet,
  FaFileInvoiceDollar,
  FaUserTie,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

import Modal from './Modal';
import OrdenesDeCompraMenuModal from './OrdenesDeCompraMenuModal';
import CrearProveedorModal from '../components/CrearProveedorModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Estado para controlar el sidebar
  const [isOrdenesDeCompraMenuModalOpen, setIsOrdenesDeCompraMenuModalOpen] = useState(false);
  const [isCrearOrdenCompraModalOpen, setIsCrearOrdenCompraModalOpen] = useState(false);
  const [isCrearProveedorModalOpen, setIsCrearProveedorModalOpen] = useState(false);
  const [isCrearProductoModalOpen, setIsCrearProductoModalOpen] = useState(false);
  const [isAgregarDetalleModalOpen, setIsAgregarDetalleModalOpen] = useState(false);
  const [isVerOrdenesModalOpen, setIsVerOrdenesModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Función para toggle del sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
    console.log('Toggle sidebar clicked, new state:', !sidebarOpen); // Debug
  };

  // Función para cerrar sidebar en móvil cuando se selecciona una opción
  const handleSectionChange = (section) => {
    setActiveSection(section);
    // En móvil, cerrar el sidebar al seleccionar una opción
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Funciones para manejar modales con mejor control de estado
  const openOrdenesDeCompraMenuModal = () => {
    setIsCrearOrdenCompraModalOpen(false);
    setIsCrearProveedorModalOpen(false);
    setIsCrearProductoModalOpen(false);
    setIsAgregarDetalleModalOpen(false);
    setIsVerOrdenesModalOpen(false);
    setIsOrdenesDeCompraMenuModalOpen(true);
  };

  const closeOrdenesDeCompraMenuModal = () => {
    setIsOrdenesDeCompraMenuModalOpen(false);
  };

  const openCrearProveedorModal = () => {
    closeOrdenesDeCompraMenuModal();
    console.log("Abrir modal de Crear Proveedor");
    setIsCrearProveedorModalOpen(true);
  };

  const closeCrearProveedorModal = () => {
    setIsCrearProveedorModalOpen(false);
  };

  const openCrearProductoModal = () => {
    closeOrdenesDeCompraMenuModal();
    console.log("Abrir modal de Crear Producto");
    setIsCrearProductoModalOpen(true);
  };

  const closeCrearProductoModal = () => {
    setIsCrearProductoModalOpen(false);
  };

  const openAgregarDetalleModal = () => {
    closeOrdenesDeCompraMenuModal();
    console.log("Abrir modal de Agregar Detalle");
    setIsAgregarDetalleModalOpen(true);
  };

  const closeAgregarDetalleModal = () => {
    setIsAgregarDetalleModalOpen(false);
  };

  const openVerOrdenesModal = () => {
    closeOrdenesDeCompraMenuModal();
    console.log("Abrir modal/página de Ver Órdenes");
    setIsVerOrdenesModalOpen(true);
  };

  const closeVerOrdenesModal = () => {
    setIsVerOrdenesModalOpen(false);
  };

  // Función para obtener el título correcto basado en la sección activa
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'overview':
        return 'Resumen de Actividad';
      case 'financial-dashboard':
        return 'Dashboard Financiero';
      case 'settings':
        return 'Ajustes de Usuario';
      case 'plan-cuentas':
        return 'Plan de Cuentas';
      default:
        return 'Dashboard';
    }
  };

  // Definición de módulos financieros con sus iconos
  const financialModules = [
    { title: 'ÓRDENES DE COMPRA', icon: FaShoppingCart, action: openOrdenesDeCompraMenuModal },
    { title: 'PRESUPUESTO', icon: FaPiggyBank, action: null },
    { title: 'REPORTE FINANCIERO', icon: FaChartBar, action: null },
    { title: 'CUENTAS POR PAGAR/COBRAR', icon: FaHandHoldingUsd, action: null },
    { title: 'TESORERÍA', icon: FaMoneyBillWave, action: null },
    { title: 'CONCILIACIÓN BANCARIA', icon: FaExchangeAlt, action: null },
    { title: 'PROCESOS IA', icon: FaRobot, action: null },
    { title: 'PROYECTOS FINANCIEROS', icon: FaProjectDiagram, action: null },
    { title: 'CAJA Y BANCOS', icon: FaWallet, action: null },
    { title: 'CONTABILIDAD NIIF', icon: FaFileInvoiceDollar, action: null },
    { title: 'NÓMINA', icon: FaUserTie, action: null },
    { title: 'FACTURACIÓN ELECTRÓNICA', icon: FaReceipt, action: null },
    { title: 'MIGRACIÓN DE DATOS', icon: FaDatabase, action: null },
    { title: 'INTEGRACIÓN CRM', icon: FaUsersCog, action: null },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Cargando información del usuario...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Overlay para móvil cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar de Navegación */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 bg-gray-800 text-white flex flex-col shadow-lg
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 md:w-16 -translate-x-full md:translate-x-0 overflow-hidden'}
      `}>
        {/* Header del Sidebar */}
        <div className={`flex items-center justify-between p-4 bg-gray-700 ${!sidebarOpen ? 'md:justify-center' : ''}`}>
          <div className={`flex items-center ${!sidebarOpen ? 'md:hidden' : ''}`}>
            <FaUserCircle className="text-3xl text-blue-400 mr-3" />
            <h2 className="text-lg font-bold tracking-wide">{user.username}</h2>
          </div>
          {!sidebarOpen && (
            <div className="hidden md:block">
              <FaUserCircle className="text-3xl text-blue-400" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white hover:text-gray-300 p-1"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleSectionChange('overview')}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group
                  ${activeSection === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
                title={!sidebarOpen ? "Resumen General" : ""}
              >
                <FaHome className="text-lg flex-shrink-0" />
                <span className={`ml-4 ${!sidebarOpen ? 'md:hidden' : ''}`}>Resumen General</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange('financial-dashboard')}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group
                  ${activeSection === 'financial-dashboard' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
                title={!sidebarOpen ? "Dashboard Financiero" : ""}
              >
                <FaChartBar className="text-lg flex-shrink-0" />
                <span className={`ml-4 ${!sidebarOpen ? 'md:hidden' : ''}`}>Dashboard Financiero</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange('settings')}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group
                  ${activeSection === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
                title={!sidebarOpen ? "Configuración" : ""}
              >
                <FaCog className="text-lg flex-shrink-0" />
                <span className={`ml-4 ${!sidebarOpen ? 'md:hidden' : ''}`}>Configuración</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange('plan-cuentas')}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group
                  ${activeSection === 'plan-cuentas' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
                title={!sidebarOpen ? "Plan de Cuentas" : ""}
              >
                <FaScroll className="text-lg flex-shrink-0" />
                <span className={`ml-4 ${!sidebarOpen ? 'md:hidden' : ''}`}>Plan de Cuentas</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Botón de logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md group"
            title={!sidebarOpen ? "Cerrar Sesión" : ""}
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            <span className={`ml-4 ${!sidebarOpen ? 'md:hidden' : ''}`}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Superior con botón de menú hamburguesa */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md z-10 border-b border-gray-200">
          <div className="flex items-center">
            {/* Botón hamburguesa - CORREGIDO */}
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-800 mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              {getSectionTitle()}
            </h1>
          </div>
          <div className="flex items-center">
            <span className="hidden sm:block text-gray-700 mr-3 text-lg">
              Hola, <span className="font-semibold">{user.username}</span>
            </span>
            <FaUserCircle className="text-3xl md:text-4xl text-blue-500" />
          </div>
        </header>

        {/* Contenido de la Sección Activa */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {activeSection === 'overview' && (
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-4 border-b pb-3 border-gray-200">
                ¡Bienvenido a tu Panel!
              </h3>
              <p className="text-gray-600 mb-6">
                Aquí podrás ver un resumen rápido de tus actividades y accesos directos a las funciones clave de la aplicación.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
                <div className="bg-green-50 p-4 md:p-5 rounded-lg shadow-lg flex items-center transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-green-200">
                  <FaMoneyBillWave className="text-green-600 text-3xl md:text-4xl mr-3 md:mr-4" />
                  <div>
                    <h4 className="font-bold text-base md:text-lg text-green-800">Transacciones Recientes</h4>
                    <p className="text-xs md:text-sm text-green-700">Ver tus últimos movimientos financieros.</p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 md:p-5 rounded-lg shadow-lg flex items-center transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-yellow-200">
                  <FaShoppingCart className="text-yellow-600 text-3xl md:text-4xl mr-3 md:mr-4" />
                  <div>
                    <h4 className="font-bold text-base md:text-lg text-yellow-800">Órdenes Pendientes</h4>
                    <p className="text-xs md:text-sm text-yellow-700">Revisa el estado de tus compras y ventas.</p>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 md:p-5 rounded-lg shadow-lg flex items-center transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-purple-200">
                  <FaCalculator className="text-purple-600 text-3xl md:text-4xl mr-3 md:mr-4" />
                  <div>
                    <h4 className="font-bold text-base md:text-lg text-purple-800">Calculadora Rápida</h4>
                    <p className="text-xs md:text-sm text-purple-700">Accede a herramientas de cálculo útiles.</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-500 mt-8 md:mt-10 text-sm md:text-base">
                Selecciona una opción del menú lateral para explorar más funcionalidades.
              </p>
            </div>
          )}

          {activeSection === 'financial-dashboard' && (
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-6 text-center border-b pb-4 border-gray-200">
                Módulos del Dashboard Financiero
              </h3>
              <p className="text-gray-600 mb-6 md:mb-8 text-center text-base md:text-lg">
                Explora las diferentes áreas de gestión financiera a tu disposición.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {financialModules.map((module, index) => {
                  const IconComponent = module.icon;
                  return (
                    <div
                      key={`financial-module-${index}`}
                      onClick={module.action || (() => console.log(`Clicked on ${module.title}`))}
                      className="bg-blue-50 p-4 md:p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center
                                 hover:bg-blue-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105
                                 border border-blue-200 cursor-pointer min-h-[100px] md:min-h-[120px]"
                    >
                      <IconComponent className="text-3xl md:text-5xl text-blue-600 mb-2 md:mb-3" />
                      <p className="text-xs md:text-lg font-bold text-blue-800 leading-tight">{module.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-4 border-b pb-3 border-gray-200">
                Configuración de Usuario
              </h3>
              <p className="text-gray-600 mb-6">
                Aquí podrás gestionar la configuración de tu cuenta.
              </p>
              <div className="space-y-4 text-base md:text-lg">
                <p><strong>Nombre de usuario:</strong> <span className="text-gray-800">{user.username}</span></p>
                <p><strong>Correo electrónico:</strong> <span className="text-gray-800">{user.email}</span></p>
                <p><strong>Rol:</strong> <span className="text-gray-800">{user.rol}</span></p>
                <button className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md">
                  Editar Perfil
                </button>
              </div>
            </div>
          )}

          {activeSection === 'plan-cuentas' && (
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-4 border-b pb-3 border-gray-200">
                Plan de Cuentas
              </h3>
              <p className="text-gray-600 mb-6">
                Gestiona tu plan de cuentas contable.
              </p>
              <div className="text-center text-gray-500">
                <FaScroll className="text-4xl md:text-6xl mx-auto mb-4 text-gray-400" />
                <p>Funcionalidad en desarrollo</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modales (manteniendo la estructura existente) */}
      {isOrdenesDeCompraMenuModalOpen && (
        <Modal 
          isOpen={isOrdenesDeCompraMenuModalOpen} 
          onClose={closeOrdenesDeCompraMenuModal} 
          title="Opciones de Órdenes de Compra"
        >
          <OrdenesDeCompraMenuModal
            onClose={closeOrdenesDeCompraMenuModal}
            openCrearProveedorModal={openCrearProveedorModal}
            openCrearProductoModal={openCrearProductoModal}
            openAgregarDetalleModal={openAgregarDetalleModal}
            openVerOrdenesModal={openVerOrdenesModal}
          />
        </Modal>
      )}

      {isCrearProveedorModalOpen && (
        <Modal isOpen={isCrearProveedorModalOpen} onClose={closeCrearProveedorModal}>
          <CrearProveedorModal onClose={closeCrearProveedorModal} />
        </Modal>
      )}

      {/* Otros modales mantienen la misma estructura... */}
    </div>
  );
};

export default Dashboard;
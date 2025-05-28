// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'react-icons/fa';

import Modal from './Modal';
import OrdenesDeCompraMenuModal from './OrdenesDeCompraMenuModal';
import CrearProveedorModal from '../components/CrearProveedorModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Funciones para manejar modales con mejor control de estado
  const openOrdenesDeCompraMenuModal = () => {
    // Cerrar otros modales antes de abrir este
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

  const openCrearOrdenCompraModal = () => {
    closeOrdenesDeCompraMenuModal();
    console.log("Se intentó abrir el modal 'Crear Orden de Compra', pero se redirigió a 'Crear Proveedor'");
    setIsCrearOrdenCompraModalOpen(true);
  };

  const closeCrearOrdenCompraModal = () => {
    setIsCrearOrdenCompraModalOpen(false);
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
      {/* Sidebar de Navegación */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="flex items-center mb-8 px-2 py-3 bg-gray-700 rounded-lg">
          <FaUserCircle className="text-4xl text-blue-400 mr-3" />
          <h2 className="text-xl font-bold tracking-wide">{user.username}</h2>
        </div>
        <nav className="flex-1">
          <ul>
            <li className="mb-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
                  ${activeSection === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <FaHome className="mr-4 text-xl" />
                <span>Resumen General</span>
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => setActiveSection('financial-dashboard')}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
                  ${activeSection === 'financial-dashboard' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <FaChartBar className="mr-4 text-xl" />
                <span>Dashboard Financiero</span>
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => setActiveSection('settings')}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
                  ${activeSection === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <FaCog className="mr-4 text-xl" />
                <span>Configuración</span>
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => setActiveSection('plan-cuentas')}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
                  ${activeSection === 'plan-cuentas' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <FaScroll className="mr-4 text-xl" />
                <span>Plan de Cuentas</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md"
          >
            <FaSignOutAlt className="mr-4 text-xl" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Superior - AQUÍ ESTABA EL PROBLEMA */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md z-10 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-800">
            {getSectionTitle()}
          </h1>
          <div className="flex items-center">
            <span className="text-gray-700 mr-3 text-lg">
              Hola, <span className="font-semibold">{user.username}</span>
            </span>
            <FaUserCircle className="text-4xl text-blue-500" />
          </div>
        </header>

        {/* Contenido de la Sección Activa */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {activeSection === 'overview' && (
            <div className="bg-white p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3 border-gray-200">
                ¡Bienvenido a tu Panel!
              </h3>
              <p className="text-gray-600 mb-6">
                Aquí podrás ver un resumen rápido de tus actividades y accesos directos a las funciones clave de la aplicación.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-green-50 p-5 rounded-lg shadow-lg flex items-center transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-green-200">
                  <FaMoneyBillWave className="text-green-600 text-4xl mr-4" />
                  <div>
                    <h4 className="font-bold text-lg text-green-800">Transacciones Recientes</h4>
                    <p className="text-sm text-green-700">Ver tus últimos movimientos financieros.</p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-5 rounded-lg shadow-lg flex items-center transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-yellow-200">
                  <FaShoppingCart className="text-yellow-600 text-4xl mr-4" />
                  <div>
                    <h4 className="font-bold text-lg text-yellow-800">Órdenes Pendientes</h4>
                    <p className="text-sm text-yellow-700">Revisa el estado de tus compras y ventas.</p>
                  </div>
                </div>
                <div className="bg-purple-50 p-5 rounded-lg shadow-lg flex items-center transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-purple-200">
                  <FaCalculator className="text-purple-600 text-4xl mr-4" />
                  <div>
                    <h4 className="font-bold text-lg text-purple-800">Calculadora Rápida</h4>
                    <p className="text-sm text-purple-700">Accede a herramientas de cálculo útiles.</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-500 mt-10 text-md">
                Selecciona una opción del menú lateral para explorar más funcionalidades.
              </p>
            </div>
          )}

          {activeSection === 'financial-dashboard' && (
            <div className="bg-white p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center border-b pb-4 border-gray-200">
                Módulos del Dashboard Financiero
              </h3>
              <p className="text-gray-600 mb-8 text-center text-lg">
                Explora las diferentes áreas de gestión financiera a tu disposición.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {financialModules.map((module, index) => {
                  const IconComponent = module.icon;
                  return (
                    <div
                      key={`financial-module-${index}`}
                      onClick={module.action || (() => console.log(`Clicked on ${module.title}`))}
                      className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center
                                 hover:bg-blue-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105
                                 border border-blue-200 cursor-pointer"
                    >
                      <IconComponent className="text-5xl text-blue-600 mb-3" />
                      <p className="text-lg font-bold text-blue-800">{module.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="bg-white p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3 border-gray-200">
                Configuración de Usuario
              </h3>
              <p className="text-gray-600 mb-6">
                Aquí podrás gestionar la configuración de tu cuenta.
              </p>
              <div className="space-y-4 text-lg">
                <p><strong>Nombre de usuario:</strong> <span className="text-gray-800">{user.username}</span></p>
                <p><strong>Correo electrónico:</strong> <span className="text-gray-800">{user.email}</span></p>
                <p><strong>Rol:</strong> <span className="text-gray-800">{user.rol}</span></p>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md">
                  Editar Perfil
                </button>
              </div>
            </div>
          )}

          {activeSection === 'plan-cuentas' && (
            <div className="bg-white p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3 border-gray-200">
                Plan de Cuentas
              </h3>
              <p className="text-gray-600 mb-6">
                Gestiona tu plan de cuentas contable.
              </p>
              <div className="text-center text-gray-500">
                <FaScroll className="text-6xl mx-auto mb-4 text-gray-400" />
                <p>Funcionalidad en desarrollo</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modales */}
      {/* Modal para el Menú de Órdenes de Compra */}
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

      {/* Modal para Crear Orden de Compra */}
      {isCrearOrdenCompraModalOpen && (
        <Modal 
          isOpen={isCrearOrdenCompraModalOpen} 
          onClose={closeCrearOrdenCompraModal} 
          title="Crear Nueva Orden de Compra"
        >
          <div className="p-4 text-center">
            <p className="text-gray-700">
              Este es un placeholder para el formulario de "Crear Orden de Compra".
              Actualmente, la opción en el menú redirige a "Crear Proveedor".
            </p>
            <button
              onClick={closeCrearOrdenCompraModal}
              className="mt-6 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Cerrar Formulario de Orden
            </button>
          </div>
        </Modal>
      )}

      {/* Modal para Crear Proveedor */}
      {isCrearProveedorModalOpen && (
        <Modal isOpen={isCrearProveedorModalOpen} onClose={closeCrearProveedorModal}>
          <CrearProveedorModal onClose={closeCrearProveedorModal} />
        </Modal>
      )}

      {/* Modales adicionales con placeholders */}
      {isCrearProductoModalOpen && (
        <Modal 
          isOpen={isCrearProductoModalOpen} 
          onClose={closeCrearProductoModal}
          title="Crear Producto"
        >
          <div className="p-4 text-center">
            <p className="text-gray-700">Modal de Crear Producto - En desarrollo</p>
            <button
              onClick={closeCrearProductoModal}
              className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      {isAgregarDetalleModalOpen && (
        <Modal 
          isOpen={isAgregarDetalleModalOpen} 
          onClose={closeAgregarDetalleModal}
          title="Agregar Detalle a OC"
        >
          <div className="p-4 text-center">
            <p className="text-gray-700">Modal de Agregar Detalle - En desarrollo</p>
            <button
              onClick={closeAgregarDetalleModal}
              className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      {isVerOrdenesModalOpen && (
        <Modal 
          isOpen={isVerOrdenesModalOpen} 
          onClose={closeVerOrdenesModal}
          title="Ver Órdenes de Compra"
        >
          <div className="p-4 text-center">
            <p className="text-gray-700">Modal de Ver Órdenes - En desarrollo</p>
            <button
              onClick={closeVerOrdenesModal}
              className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
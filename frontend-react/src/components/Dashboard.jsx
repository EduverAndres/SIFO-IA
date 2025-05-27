// src/pages/Dashboard.jsx
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
  FaUniversity, // Para Bancos/Tesorería
  FaExchangeAlt, // Para Conciliación Bancaria
  FaRobot, // Para Procesos IA
  FaProjectDiagram, // Para Proyectos Financieros
  FaHandHoldingUsd, // Para Cuentas por Pagar/Cobrar
  FaReceipt, // Para Facturación Electrónica
  FaDatabase, // Para Migración de Datos
  FaUsersCog, // Para Integración CRM (FaUsers con FaCog)
  FaScroll, // Para Plan de Cuentas
  FaPiggyBank, // Para Presupuesto
  FaWallet, // Para Caja y Bancos
  FaFileInvoiceDollar, // Para Contabilidad NIIF
  FaUserTie, // Para Nómina
} from 'react-icons/fa'; // Importa una variedad de iconos

import Modal from './Modal';
import OrdenesDeCompraMenuModal from './OrdenesDeCompraMenuModal';
import CrearProveedorModal from '../components/CrearProveedorModal'; // Importación del modal de proveedor


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isOrdenesDeCompraMenuModalOpen, setIsOrdenesDeCompraMenuModalOpen] = useState(false);
  const [isCrearOrdenCompraModalOpen, setIsCrearOrdenCompraModalOpen] = useState(false); // Mantener por si se usa en el futuro
  const [isCrearProveedorModalOpen, setIsCrearProveedorModalOpen] = useState(false); // Estado para el modal de Crear Proveedor
  const [isCrearProductoModalOpen, setIsCrearProductoModalOpen] = useState(false);
  const [isAgregarDetalleModalOpen, setIsAgregarDetalleModalOpen] = useState(false);
  const [isVerOrdenesModalOpen, setIsVerOrdenesModalOpen] = useState(false);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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

  const openOrdenesDeCompraMenuModal = () => {
    setIsOrdenesDeCompraMenuModalOpen(true);
  };

  const closeOrdenesDeCompraMenuModal = () => {
    setIsOrdenesDeCompraMenuModalOpen(false);
  };

  const openCrearOrdenCompraModal = () => {
    closeOrdenesDeCompraMenuModal();
    // Este console.log se mantendrá, pero la acción de este botón se ha redirigido en OrdenesDeCompraMenuModal
    console.log("Se intentó abrir el modal 'Crear Orden de Compra', pero se redirigió a 'Crear Proveedor'");
    setIsCrearOrdenCompraModalOpen(true); // Puedes mantener este estado si hay un "Crear Orden de Compra" real futuro
  };

  const closeCrearOrdenCompraModal = () => {
    setIsCrearOrdenCompraModalOpen(false);
  };

  // Función para abrir el modal de Crear Proveedor
  const openCrearProveedorModal = () => {
    // Si se llama desde el menú de órdenes, el menú ya estará cerrado por la lógica en OrdenesDeCompraMenuModal
    // Pero si se llama directamente desde otro lado, podríamos querer cerrarlos.
    closeOrdenesDeCompraMenuModal();
    console.log("Abrir modal de Crear Proveedor");
    setIsCrearProveedorModalOpen(true);
  };

  // Función para cerrar el modal de Crear Proveedor
  const closeCrearProveedorModal = () => {
    setIsCrearProveedorModalOpen(false);
  };


  const openCrearProductoModal = () => {
    closeOrdenesDeCompraMenuModal();
    console.log("Abrir modal de Crear Producto");
    // setIsCrearProductoModalOpen(true); // Descomentar cuando tengas el componente
  };

  const openAgregarDetalleModal = () => {
    closeOrdenesDeCompraMenuModal();
    console.log("Abrir modal de Agregar Detalle");
    // setIsAgregarDetalleModalOpen(true); // Descomentar cuando tengas el componente
  };

  const openVerOrdenesModal = () => {
    closeOrdenesDeCompraMenuModal();
    console.log("Abrir modal/página de Ver Órdenes");
    // Puedes navegar a una ruta de tabla de órdenes o abrir otro modal
    // navigate('/ordenes'); // Ejemplo de navegación
    // setIsVerOrdenesModalOpen(true); // Ejemplo de modal
  };

  // Objeto de mapeo de iconos por título para el Dashboard Financiero
  const financialDashboardIcons = {
    'PLAN DE CUENTAS': <FaScroll />,
    'ÓRDENES DE COMPRA': <FaShoppingCart />,
    'PRESUPUESTO': <FaPiggyBank />,
    'REPORTE FINANCIERO': <FaChartBar />,
    'CUENTAS POR PAGAR/COBRAR': <FaHandHoldingUsd />,
    'TESORERÍA': <FaMoneyBillWave />,
    'CONCILIACIÓN BANCARIA': <FaExchangeAlt />,
    'PROCESOS IA': <FaRobot />,
    'PROYECTOS FINANCIEROS': <FaProjectDiagram />,
    'CAJA Y BANCOS': <FaWallet />,
    'CONTABILIDAD NIIF': <FaFileInvoiceDollar />,
    'NÓMINA': <FaUserTie />,
    'FACTURACIÓN ELECTRÓNICA': <FaReceipt />,
    'MIGRACIÓN DE DATOS': <FaDatabase />,
    'INTEGRACIÓN CRM': <FaUsersCog />,
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Cargando información del usuario...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans"> {/* Aplica la fuente Poppins globalmente */}
      {/* Sidebar de Navegación */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="flex items-center mb-8 px-2 py-3 bg-gray-700 rounded-lg">
          <FaUserCircle className="text-4xl text-blue-400 mr-3" />
          <h2 className="text-xl font-bold tracking-wide">{user.username}</h2> {/* Ajustado el tamaño y peso de la fuente */}
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
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700"> {/* Separador para el botón de logout */}
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
        {/* Navbar Superior */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md z-10 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-800">
            {activeSection === 'overview' && 'Resumen de Actividad'}
            {activeSection === 'financial-dashboard' && 'Dashboard Financiero'}
            {activeSection === 'settings' && 'Ajustes de Usuario'}
          </h1>
          <div className="flex items-center">
            <span className="text-gray-700 mr-3 text-lg">Hola, <span className="font-semibold">{user.username}</span></span>
            <FaUserCircle className="text-4xl text-blue-500" />
          </div>
        </header>

        {/* Contenido de la Sección Activa */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {activeSection === 'overview' && (
            <div className="bg-white p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3 border-gray-200">¡Bienvenido a tu Panel!</h3>
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
              <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center border-b pb-4 border-gray-200">Módulos del Dashboard Financiero</h3>
              <p className="text-gray-600 mb-8 text-center text-lg">
                Explora las diferentes áreas de gestión financiera a tu disposición.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Object.entries(financialDashboardIcons).map(([title, icon], index) => (
                  <div
                    key={index}
                    onClick={title === 'ÓRDENES DE COMPRA' ? openOrdenesDeCompraMenuModal : null}
                    className={`bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center
                                 hover:bg-blue-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105
                                 border border-blue-200 cursor-pointer`}
                  >
                    <span className="text-5xl text-blue-600 mb-3">
                      {icon}
                    </span>
                    <p className="text-lg font-bold text-blue-800">{title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="bg-white p-8 rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3 border-gray-200">Configuración de Usuario</h3>
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
        </main>
      </div>

      {/* Modal para el Menú de Órdenes de Compra */}
      <Modal isOpen={isOrdenesDeCompraMenuModalOpen} onClose={closeOrdenesDeCompraMenuModal} title="Opciones de Órdenes de Compra">
        <OrdenesDeCompraMenuModal
          onClose={closeOrdenesDeCompraMenuModal}
          // openCrearOrdenModal ya no se usa directamente desde este menú, se redirige
          // openCrearOrdenModal={openCrearOrdenCompraModal} // Si lo necesitas para otra lógica, puedes dejarlo
          openCrearProveedorModal={openCrearProveedorModal} // Se pasa la función para abrir el modal de proveedor
          openCrearProductoModal={openCrearProductoModal}
          openAgregarDetalleModal={openAgregarDetalleModal}
          openVerOrdenesModal={openVerOrdenesModal}
        />
      </Modal>

      {/* Modal para Crear Orden de Compra (solo se abre desde el menú de Órdenes de Compra) */}
      {/* Se mantiene por si en el futuro quieres un modal real para "Crear Orden de Compra" */}
      {isCrearOrdenCompraModalOpen && (
        <Modal isOpen={isCrearOrdenCompraModalOpen} onClose={closeCrearOrdenCompraModal} title="Crear Nueva Orden de Compra">
          {/* Aquí iría tu componente CrearOrdenCompraModal real */}
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

      {/* ... Otros modales que puedas tener o necesites implementar ... */}
      {/* {isCrearProductoModalOpen && (
        <Modal isOpen={isCrearProductoModalOpen} onClose={closeCrearProductoModal}>
          <CrearProductoModal onClose={closeCrearProductoModal} />
        </Modal>
      )} */}
    </div>
  );
};

export default Dashboard;
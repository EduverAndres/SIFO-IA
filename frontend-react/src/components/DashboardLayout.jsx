// src/components/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaHome,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaMoneyBillWave,
  FaShoppingCart,
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

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Navegación del sidebar simplificada
  const sidebarItems = [
    {
      path: '/dashboard',
      icon: FaHome,
      exact: true,
      label: 'Pagina Principal'

    },
    {
      path: '/dashboard/menu-financiero',
      icon: FaChartBar,
      label: 'Menú Financiero'
    },
    {
      path: '/dashboard/configuracion',
      icon: FaCog,
      label: 'Configuración'
    }
  ];

  // Función para determinar si un item está activo
  const isActiveItem = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  // Función para obtener el título basado en la ruta actual
  const getCurrentPageTitle = () => {
    const currentItem = sidebarItems.find(item => isActiveItem(item));
    return currentItem ? currentItem.label : 'Dashboard';
  };

  const handleSidebarItemClick = () => {
    // En móvil, cerrar el sidebar al hacer clic en un item
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

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
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = isActiveItem(item);
              
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={handleSidebarItemClick}
                    className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 group
                      ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    <IconComponent className="text-lg flex-shrink-0" />
                    <span className={`ml-3 text-sm ${!sidebarOpen ? 'md:hidden' : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Botón de logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md group"
            title={!sidebarOpen ? "Cerrar Sesión" : ""}
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            <span className={`ml-3 text-sm ${!sidebarOpen ? 'md:hidden' : ''}`}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md z-10 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-800 mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              {getCurrentPageTitle()}
            </h1>
          </div>
          <div className="flex items-center">
            <span className="hidden sm:block text-gray-700 mr-3 text-lg">
              Hola, <span className="font-semibold">{user.username}</span>
            </span>
            <FaUserCircle className="text-3xl md:text-4xl text-blue-500" />
          </div>
        </header>

        {/* Contenido principal - Aquí se renderizan las páginas específicas */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
// src/pages/dashboard/OrdenesCompra.jsx
import React, { useState } from 'react';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaEye,
  FaTrash,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from 'react-icons/fa';

const OrdenesCompra = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Datos simulados de órdenes de compra
  const ordenesData = [
    {
      id: 'OC-2025-001',
      proveedor: 'Tech Solutions S.A.',
      fecha: '2025-01-15',
      monto: 45250.00,
      estado: 'completada',
      items: 5
    },
    {
      id: 'OC-2025-002',
      proveedor: 'Office Supplies Inc.',
      fecha: '2025-01-14',
      monto: 12750.00,
      estado: 'pendiente',
      items: 12
    },
    {
      id: 'OC-2025-003',
      proveedor: 'Industrial Materials Co.',
      fecha: '2025-01-13',
      monto: 78900.00,
      estado: 'proceso',
      items: 8
    },
    {
      id: 'OC-2025-004',
      proveedor: 'Green Energy Corp.',
      fecha: '2025-01-12',
      monto: 156200.00,
      estado: 'completada',
      items: 3
    },
    {
      id: 'OC-2025-005',
      proveedor: 'Logistics Pro S.A.',
      fecha: '2025-01-11',
      monto: 23400.00,
      estado: 'cancelada',
      items: 7
    }
  ];

  // Función para obtener el icono y color del estado
  const getStatusDisplay = (estado) => {
    switch (estado) {
      case 'completada':
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          text: 'Completada',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'pendiente':
        return {
          icon: <FaClock className="text-yellow-500" />,
          text: 'Pendiente',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case 'proceso':
        return {
          icon: <FaClock className="text-blue-500" />,
          text: 'En Proceso',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case 'cancelada':
        return {
          icon: <FaExclamationTriangle className="text-red-500" />,
          text: 'Cancelada',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: <FaClock className="text-gray-500" />,
          text: 'Desconocido',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  // Filtrar órdenes basado en búsqueda y estado
  const filteredOrdenes = ordenesData.filter(orden => {
    const matchesSearch = orden.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orden.proveedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || orden.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header con acciones principales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Órdenes de Compra</h2>
          <p className="text-gray-600">Gestiona todas las órdenes de compra de tu empresa</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <FaPlus className="text-sm" />
          Nueva Orden
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Órdenes</p>
              <p className="text-2xl font-bold text-gray-800">{ordenesData.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaSearch className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">
                {ordenesData.filter(o => o.estado === 'completada').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {ordenesData.filter(o => o.estado === 'pendiente').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaClock className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-purple-600">
                ${ordenesData.reduce((total, orden) => total + orden.monto, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaDownload className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="completada">Completadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="proceso">En Proceso</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrdenes.map((orden, index) => {
                const statusDisplay = getStatusDisplay(orden.estado);
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{orden.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{orden.proveedor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{orden.fecha}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${orden.monto.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                        <span className="mr-1">{statusDisplay.icon}</span>
                        {statusDisplay.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{orden.items}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors duration-200">
                          <FaEye className="text-sm" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition-colors duration-200">
                          <FaEdit className="text-sm" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors duration-200">
                          <FaDownload className="text-sm" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors duration-200">
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrdenes.length === 0 && (
          <div className="text-center py-12">
            <FaSearch className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron órdenes</h3>
            <p className="text-gray-500">Intenta con diferentes términos de búsqueda o filtros</p>
          </div>
        )}
      </div>

      {/* Paginación (placeholder) */}
      {filteredOrdenes.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredOrdenes.length}</span> de{' '}
                <span className="font-medium">{filteredOrdenes.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Anterior
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesCompra;
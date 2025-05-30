// src/pages/dashboard/PlanCuentas.jsx
import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUpload,
  FaEye,
  FaTree,
  FaList,
  FaChevronDown,
  FaChevronRight,
  FaCode,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaFileImport,
  FaCog,
  FaSync,
} from 'react-icons/fa';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

const PlanCuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [cuentasTree, setCuentasTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    tipo_cuenta: '',
    naturaleza: '',
    estado: 'ACTIVA',
    solo_cuentas_movimiento: false,
  });
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCuenta, setSelectedCuenta] = useState(null);
  
  // Estados para la vista
  const [viewMode, setViewMode] = useState('tree'); // 'tree' o 'list'
  const [expandedNodes, setExpandedNodes] = useState(new Set(['1', '2', '3', '4', '5', '6']));
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo_cuenta: 'AUXILIAR',
    naturaleza: 'DEBITO',
    estado: 'ACTIVA',
    codigo_padre: '',
    acepta_movimientos: true,
    requiere_tercero: false,
    requiere_centro_costo: false,
    dinamica: '',
    es_cuenta_niif: false,
    codigo_niif: '',
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Cargar datos iniciales
  useEffect(() => {
    cargarCuentas();
  }, [filtros]);

  const cargarCuentas = async () => {
    try {
      setLoading(true);
      
      // Construir query params
      const params = new URLSearchParams();
      if (searchTerm) params.append('busqueda', searchTerm);
      if (filtros.tipo_cuenta) params.append('tipo_cuenta', filtros.tipo_cuenta);
      if (filtros.naturaleza) params.append('naturaleza', filtros.naturaleza);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.solo_cuentas_movimiento) params.append('solo_cuentas_movimiento', 'true');
      
      const [cuentasResponse, arbolResponse] = await Promise.all([
        fetch(`${API_BASE}/api/puc?${params.toString()}`),
        fetch(`${API_BASE}/api/puc/arbol`)
      ]);

      if (!cuentasResponse.ok || !arbolResponse.ok) {
        throw new Error('Error al cargar las cuentas');
      }

      const cuentasData = await cuentasResponse.json();
      const arbolData = await arbolResponse.json();

      setCuentas(cuentasData.data || []);
      setCuentasTree(arbolData.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar las cuentas: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await cargarCuentas();
  };

  const handleCreateCuenta = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/puc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear la cuenta');
      }

      setSuccess('Cuenta creada exitosamente');
      setShowCreateModal(false);
      resetForm();
      await cargarCuentas();
    } catch (err) {
      setError('Error al crear la cuenta: ' + err.message);
    }
  };

  const handleEditCuenta = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/puc/${selectedCuenta.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar la cuenta');
      }

      setSuccess('Cuenta actualizada exitosamente');
      setShowEditModal(false);
      setSelectedCuenta(null);
      resetForm();
      await cargarCuentas();
    } catch (err) {
      setError('Error al actualizar la cuenta: ' + err.message);
    }
  };

  const handleDeleteCuenta = async (cuenta) => {
    if (!window.confirm(`¿Está seguro de eliminar la cuenta ${cuenta.codigo} - ${cuenta.nombre}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/puc/${cuenta.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar la cuenta');
      }

      setSuccess('Cuenta eliminada exitosamente');
      await cargarCuentas();
    } catch (err) {
      setError('Error al eliminar la cuenta: ' + err.message);
    }
  };

  const handleImportPucEstandar = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/puc/importar/estandar-colombia`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al importar el PUC estándar');
      }

      setSuccess('PUC estándar importado exitosamente');
      setShowImportModal(false);
      await cargarCuentas();
    } catch (err) {
      setError('Error al importar el PUC estándar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (cuenta) => {
    setSelectedCuenta(cuenta);
    setFormData({
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      descripcion: cuenta.descripcion || '',
      tipo_cuenta: cuenta.tipo_cuenta,
      naturaleza: cuenta.naturaleza,
      estado: cuenta.estado,
      codigo_padre: cuenta.codigo_padre || '',
      acepta_movimientos: cuenta.acepta_movimientos,
      requiere_tercero: cuenta.requiere_tercero,
      requiere_centro_costo: cuenta.requiere_centro_costo,
      dinamica: cuenta.dinamica || '',
      es_cuenta_niif: cuenta.es_cuenta_niif,
      codigo_niif: cuenta.codigo_niif || '',
    });
    setShowEditModal(true);
  };

  const openCreateModal = (codigoPadre = '') => {
    resetForm();
    if (codigoPadre) {
      setFormData(prev => ({ ...prev, codigo_padre: codigoPadre }));
    }
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo_cuenta: 'AUXILIAR',
      naturaleza: 'DEBITO',
      estado: 'ACTIVA',
      codigo_padre: '',
      acepta_movimientos: true,
      requiere_tercero: false,
      requiere_centro_costo: false,
      dinamica: '',
      es_cuenta_niif: false,
      codigo_niif: '',
    });
  };

  const toggleNode = (codigo) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(codigo)) {
      newExpanded.delete(codigo);
    } else {
      newExpanded.add(codigo);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (cuenta, level = 0) => {
    const isExpanded = expandedNodes.has(cuenta.codigo);
    const hasChildren = cuenta.subcuentas && cuenta.subcuentas.length > 0;
    
    return (
      <div key={cuenta.codigo} className="select-none">
        <div 
          className={`flex items-center py-2 px-3 hover:bg-gray-50 border-l-4 ${
            cuenta.estado === 'ACTIVA' ? 'border-green-400' : 'border-red-400'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleNode(cuenta.codigo)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <FaChevronDown className="text-gray-500 text-sm" />
                ) : (
                  <FaChevronRight className="text-gray-500 text-sm" />
                )}
              </button>
            ) : (
              <div className="w-8 mr-2"></div>
            )}
            
            <div className="flex items-center min-w-0 flex-1">
              <FaCode className={`mr-2 ${getNaturalezaColor(cuenta.naturaleza)} text-sm`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <span className="font-mono text-sm font-medium text-gray-800 mr-2">
                    {cuenta.codigo}
                  </span>
                  <span className="text-sm text-gray-700 truncate">
                    {cuenta.nombre}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTipoCuentaColor(cuenta.tipo_cuenta)}`}>
                    {cuenta.tipo_cuenta}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getNaturalezaColorBg(cuenta.naturaleza)}`}>
                    {cuenta.naturaleza}
                  </span>
                  {cuenta.acepta_movimientos && (
                    <span className="text-xs text-blue-600">
                      <FaCheckCircle />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={() => openCreateModal(cuenta.codigo)}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
              title="Crear subcuenta"
            >
              <FaPlus className="text-sm" />
            </button>
            <button
              onClick={() => openEditModal(cuenta)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="Editar cuenta"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              onClick={() => handleDeleteCuenta(cuenta)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Eliminar cuenta"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {cuenta.subcuentas.map(subcuenta => renderTreeNode(subcuenta, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Naturaleza
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Movimientos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cuentas.map((cuenta) => (
              <tr key={cuenta.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {cuenta.codigo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{cuenta.nombre}</div>
                  {cuenta.descripcion && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {cuenta.descripcion}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoCuentaColor(cuenta.tipo_cuenta)}`}>
                    {cuenta.tipo_cuenta}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNaturalezaColorBg(cuenta.naturaleza)}`}>
                    {cuenta.naturaleza}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    cuenta.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cuenta.estado === 'ACTIVA' ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                    {cuenta.estado}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {cuenta.acepta_movimientos ? (
                    <FaCheckCircle className="text-green-500 mx-auto" />
                  ) : (
                    <FaTimesCircle className="text-red-500 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openCreateModal(cuenta.codigo)}
                      className="text-green-600 hover:text-green-900"
                      title="Crear subcuenta"
                    >
                      <FaPlus />
                    </button>
                    <button
                      onClick={() => openEditModal(cuenta)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCuenta(cuenta)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Funciones auxiliares para colores
  const getTipoCuentaColor = (tipo) => {
    const colors = {
      'CLASE': 'bg-purple-100 text-purple-800',
      'GRUPO': 'bg-blue-100 text-blue-800',
      'CUENTA': 'bg-green-100 text-green-800',
      'SUBCUENTA': 'bg-yellow-100 text-yellow-800',
      'AUXILIAR': 'bg-gray-100 text-gray-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getNaturalezaColor = (naturaleza) => {
    return naturaleza === 'DEBITO' ? 'text-red-500' : 'text-blue-500';
  };

  const getNaturalezaColorBg = (naturaleza) => {
    return naturaleza === 'DEBITO' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  // Limpiar mensajes después de unos segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Único de Cuentas (PUC)</h1>
          <p className="text-gray-600 mt-1">Gestiona la estructura contable de tu empresa</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => openCreateModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            icon={FaPlus}
          >
            Nueva Cuenta
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            icon={FaFileImport}
          >
            Importar PUC
          </Button>
          <Button
            onClick={cargarCuentas}
            className="bg-gray-600 hover:bg-gray-700 text-white"
            icon={FaSync}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <FaCheckCircle className="text-green-500 mr-3" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Código o nombre..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cuenta
            </label>
            <select
              value={filtros.tipo_cuenta}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo_cuenta: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="CLASE">Clase</option>
              <option value="GRUPO">Grupo</option>
              <option value="CUENTA">Cuenta</option>
              <option value="SUBCUENTA">Subcuenta</option>
              <option value="AUXILIAR">Auxiliar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Naturaleza
            </label>
            <select
              value={filtros.naturaleza}
              onChange={(e) => setFiltros(prev => ({ ...prev, naturaleza: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="DEBITO">Débito</option>
              <option value="CREDITO">Crédito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="ACTIVA">Activa</option>
              <option value="INACTIVA">Inactiva</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filtros.solo_cuentas_movimiento}
                onChange={(e) => setFiltros(prev => ({ ...prev, solo_cuentas_movimiento: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Solo cuentas de movimiento</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              icon={FaSearch}
            >
              Buscar
            </Button>

            <div className="border-l pl-2 ml-2">
              <button
                onClick={() => setViewMode('tree')}
                className={`p-2 rounded ${viewMode === 'tree' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Vista de árbol"
              >
                <FaTree />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ml-1 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Vista de lista"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando cuentas...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {viewMode === 'tree' ? (
            <div className="p-4">
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {cuentasTree.map(cuenta => renderTreeNode(cuenta))}
              </div>
            </div>
          ) : (
            renderListView()
          )}
        </div>
      )}

      {/* Modal de creación/edición - Continuará en la siguiente parte */}
    </div>
  );
};

export default PlanCuentas;
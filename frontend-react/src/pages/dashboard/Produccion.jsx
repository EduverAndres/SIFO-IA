import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUserTie,
  FaBoxOpen,
  FaShoppingCart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaPrint,
  FaSpinner,
} from 'react-icons/fa';

// Importar las funciones de la API
import {
  getProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  getOrdenesCompra,
  crearOrdenCompra,
  actualizarEstadoOrden,
  eliminarOrdenCompra,
  getEstadisticasProduccion
} from '../../api/produccionApi';

const Produccion = () => {
  const [activeTab, setActiveTab] = useState('crear-proveedor');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para la vista de órdenes
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('fecha_orden');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);

  // Estados para datos de la API
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    completadas: 0,
    valorTotal: 0
  });

  // Estados para formularios
  const [proveedorForm, setProveedorForm] = useState({
    nombre: '',
    contacto: '',
    correo_electronico: ''
  });

  const [productoForm, setProductoForm] = useState({
    nombre: '',
    descripcion: '',
    stock_actual: 0,
    stock_minimo: 1,
    stock_maximo: 100
  });

  const [ordenCompraForm, setOrdenCompraForm] = useState({
    id_proveedor: '',
    fecha_entrega: '',
    detalles: []
  });

  const [detalleTemp, setDetalleTemp] = useState({
    id_producto: '',
    cantidad: 1,
    precio_unitario: 0
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar datos cuando cambie la pestaña activa
  useEffect(() => {
    if (activeTab === 'ver-ordenes') {
      loadOrdenesCompra();
      loadEstadisticas();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadProveedores(),
        loadProductos()
      ]);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProveedores = async () => {
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      showError('Error al cargar proveedores');
    }
  };

  const loadProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      showError('Error al cargar productos');
    }
  };

  const loadOrdenesCompra = async () => {
    try {
      const data = await getOrdenesCompra();
      setOrdenesCompra(data);
    } catch (error) {
      console.error('Error al cargar órdenes de compra:', error);
      showError('Error al cargar órdenes de compra');
    }
  };

  const loadEstadisticas = async () => {
    try {
      const data = await getEstadisticasProduccion();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // Funciones de utilidad
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setError('');
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const showError = (message) => {
    setError(message);
    setShowSuccessMessage(false);
    setTimeout(() => setError(''), 5000);
  };

  const getStatusDisplay = (estado) => {
    switch (estado) {
      case 'Completada':
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          text: 'Completada',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'Pendiente':
        return {
          icon: <FaClock className="text-yellow-500" />,
          text: 'Pendiente',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case 'Aprobada':
        return {
          icon: <FaCheck className="text-blue-500" />,
          text: 'Aprobada',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case 'Cancelada':
        return {
          icon: <FaTimes className="text-red-500" />,
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

  // Manejadores de formularios
  const handleProveedorSubmit = async (e) => {
    e.preventDefault();
    if (proveedorForm.nombre && proveedorForm.contacto && proveedorForm.correo_electronico) {
      setIsLoading(true);
      try {
        await crearProveedor(proveedorForm);
        setProveedorForm({ nombre: '', contacto: '', correo_electronico: '' });
        await loadProveedores();
        showSuccess('¡Proveedor creado exitosamente!');
      } catch (error) {
        showError(error.message || 'Error al crear proveedor');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // En frontend-react/src/pages/dashboard/Produccion.jsx
// Corregir la función handleOrdenCompraSubmit

const handleOrdenCompraSubmit = async (e) => {
  e.preventDefault();
  if (ordenCompraForm.id_proveedor && ordenCompraForm.fecha_entrega && ordenCompraForm.detalles.length > 0) {
    setIsLoading(true);
    try {
      // Preparar datos para enviar al backend - CORREGIDO
      const ordenParaEnviar = {
        id_proveedor: parseInt(ordenCompraForm.id_proveedor),
        fecha_entrega: ordenCompraForm.fecha_entrega,
        detalles: ordenCompraForm.detalles.map(detalle => ({
          id_producto: parseInt(detalle.id_producto), // ✅ ASEGURAR QUE SEA NÚMERO
          cantidad: parseInt(detalle.cantidad), // ✅ ASEGURAR QUE SEA NÚMERO
          precio_unitario: parseFloat(detalle.precio_unitario) // ✅ ASEGURAR QUE SEA NÚMERO
        }))
      };

      console.log('Datos a enviar:', JSON.stringify(ordenParaEnviar, null, 2));

      const response = await crearOrdenCompra(ordenParaEnviar);
      setOrdenCompraForm({ id_proveedor: '', fecha_entrega: '', detalles: [] });
      await loadOrdenesCompra();
      showSuccess(`¡Orden de compra creada exitosamente! ID: ${response.orden?.id || 'N/A'}`);
    } catch (error) {
      console.error('Error completo:', error);
      
      // Mejorar el manejo de errores para mostrar más detalles
      let errorMessage = 'Error al crear orden de compra';
      
      if (error.message) {
        try {
          // Si el error contiene detalles de validación, mostrarlos
          if (error.message.includes('Errores de validación')) {
            errorMessage = 'Error de validación. Verifica que:\n' +
                          '• Todos los productos estén seleccionados\n' +
                          '• Las cantidades sean números válidos mayores a 0\n' +
                          '• Los precios sean números válidos mayores a 0';
          } else {
            errorMessage = error.message;
          }
        } catch (e) {
          errorMessage = 'Error al crear orden de compra: ' + error.message;
        }
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  } else {
    showError('Por favor complete todos los campos requeridos y agregue al menos un detalle.');
  }
};

// También corregir la función agregarDetalle
const agregarDetalle = () => {
  if (detalleTemp.id_producto && detalleTemp.cantidad > 0 && detalleTemp.precio_unitario > 0) {
    const producto = productos.find(p => p.id == detalleTemp.id_producto);
    
    if (!producto) {
      showError('Producto no encontrado. Por favor seleccione un producto válido.');
      return;
    }
    
    const nuevoDetalle = {
      id: Date.now(), // ID temporal para la UI
      id_producto: parseInt(detalleTemp.id_producto), // ✅ CONVERTIR A NÚMERO
      producto: producto,
      cantidad: parseInt(detalleTemp.cantidad), // ✅ CONVERTIR A NÚMERO
      precio_unitario: parseFloat(detalleTemp.precio_unitario), // ✅ CONVERTIR A NÚMERO
      total: parseInt(detalleTemp.cantidad) * parseFloat(detalleTemp.precio_unitario)
    };
    
    console.log('Agregando detalle:', nuevoDetalle); // Debug
    
    setOrdenCompraForm({
      ...ordenCompraForm,
      detalles: [...ordenCompraForm.detalles, nuevoDetalle]
    });
    setDetalleTemp({ id_producto: '', cantidad: 1, precio_unitario: 0 });
  } else {
    showError('Por favor complete todos los campos del detalle con valores válidos.');
  }
};


  const eliminarDetalle = (id) => {
    setOrdenCompraForm({
      ...ordenCompraForm,
      detalles: ordenCompraForm.detalles.filter(d => d.id !== id)
    });
  };

  const cambiarEstadoOrden = async (ordenId, nuevoEstado) => {
    setIsLoading(true);
    try {
      await actualizarEstadoOrden(ordenId, nuevoEstado);
      await loadOrdenesCompra();
      await loadEstadisticas();
      showSuccess(`Estado de la orden ${ordenId} cambiado a ${nuevoEstado}`);
    } catch (error) {
      showError(error.message || 'Error al cambiar estado de la orden');
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarProveedorHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      setIsLoading(true);
      try {
        await eliminarProveedor(id);
        await loadProveedores();
        showSuccess('Proveedor eliminado exitosamente');
      } catch (error) {
        showError(error.message || 'Error al eliminar proveedor');
      } finally {
        setIsLoading(false);
      }
    }
  };


  const handleProductoSubmit = async (e) => {
    e.preventDefault();
    if (productoForm.nombre && productoForm.descripcion) {
      setIsLoading(true);
      try {
        await crearProducto(productoForm);
        setProductoForm({ 
          nombre: '', 
          descripcion: '', 
          stock_actual: 0, 
          stock_minimo: 1, 
          stock_maximo: 100 
        });
        await loadProductos();
        showSuccess('¡Producto creado exitosamente!');
      } catch (error) {
        showError(error.message || 'Error al crear producto');
      } finally {
        setIsLoading(false);
      }
    }
  };



  const eliminarProductoHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setIsLoading(true);
      try {
        await eliminarProducto(id);
        await loadProductos();
        showSuccess('Producto eliminado exitosamente');
      } catch (error) {
        showError(error.message || 'Error al eliminar producto');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const eliminarOrdenHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta orden de compra?')) {
      setIsLoading(true);
      try {
        await eliminarOrdenCompra(id);
        await loadOrdenesCompra();
        await loadEstadisticas();
        showSuccess('Orden de compra eliminada exitosamente');
      } catch (error) {
        showError(error.message || 'Error al eliminar orden de compra');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Funciones de filtrado y ordenamiento
  const filteredOrdenes = ordenesCompra.filter(orden => {
    const matchesSearch = orden.id.toString().includes(searchTerm) ||
                         orden.proveedor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || orden.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedOrdenes = [...filteredOrdenes].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'proveedor':
        aValue = a.proveedor?.nombre || '';
        bValue = b.proveedor?.nombre || '';
        break;
      case 'fecha_orden':
        aValue = new Date(a.fecha_orden);
        bValue = new Date(b.fecha_orden);
        break;
      case 'fecha_entrega':
        aValue = new Date(a.fecha_entrega);
        bValue = new Date(b.fecha_entrega);
        break;
      case 'total':
        aValue = parseFloat(a.total) || 0;
        bValue = parseFloat(b.total) || 0;
        break;
      case 'estado':
        aValue = a.estado;
        bValue = b.estado;
        break;
      default:
        aValue = a.fecha_orden;
        bValue = b.fecha_orden;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
  };

  const verDetalleOrden = (orden) => {
    setSelectedOrden(orden);
    setShowDetalleModal(true);
  };

  const tabs = [
    { id: 'crear-proveedor', name: 'Crear Proveedor', icon: FaUserTie, color: 'blue' },
    { id: 'crear-producto', name: 'Crear Producto', icon: FaBoxOpen, color: 'green' },
    { id: 'crear-orden', name: 'Crear Orden de Compra', icon: FaShoppingCart, color: 'purple' },
    { id: 'ver-ordenes', name: 'Ver Órdenes de Compra', icon: FaEye, color: 'indigo' }
  ];

  if (isLoading && proveedores.length === 0 && productos.length === 0) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header con navegación de regreso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to="/dashboard/menu-financiero" 
            className="flex items-center text-blue-600 hover:text-blue-800 mr-6 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Volver al Menú</span>
          </Link>
        </div>
      </div>

      {/* Header principal */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Módulo de Producción</h1>
        <p className="text-blue-100">Gestiona proveedores, productos y órdenes de compra</p>
      </div>

      {/* Mensajes de éxito y error */}
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
          <FaCheck className="mr-2" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {/* Pestañas de navegación */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `text-${tab.color}-600 border-b-2 border-${tab.color}-600 bg-${tab.color}-50`
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {/* Crear Proveedor */}
          {activeTab === 'crear-proveedor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Proveedor</h2>
                <FaUserTie className="text-2xl text-blue-600" />
              </div>
              
              <form onSubmit={handleProveedorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    value={proveedorForm.nombre}
                    onChange={(e) => setProveedorForm({...proveedorForm, nombre: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Tech Solutions S.A."
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persona de Contacto *
                  </label>
                  <input
                    type="text"
                    value={proveedorForm.contacto}
                    onChange={(e) => setProveedorForm({...proveedorForm, contacto: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={proveedorForm.correo_electronico}
                    onChange={(e) => setProveedorForm({...proveedorForm, correo_electronico: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: contacto@proveedor.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                    {isLoading ? 'Creando...' : 'Crear Proveedor'}
                  </button>
                </div>
              </form>

              {/* Lista de proveedores */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Proveedores Registrados ({proveedores.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contacto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Correo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {proveedores.map((proveedor) => (
                        <tr key={proveedor.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{proveedor.nombre}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{proveedor.contacto}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{proveedor.correo_electronico}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                                title="Ver detalles"
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100"
                                title="Editar"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => eliminarProveedorHandler(proveedor.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                                title="Eliminar"
                                disabled={isLoading}
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
              </div>
            </div>
          )}

          {/* Crear Producto */}
          {activeTab === 'crear-producto' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Producto</h2>
                <FaBoxOpen className="text-2xl text-green-600" />
              </div>
              
              <form onSubmit={handleProductoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={productoForm.nombre}
                    onChange={(e) => setProductoForm({...productoForm, nombre: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Laptop Dell XPS"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    value={productoForm.stock_actual}
                    onChange={(e) => setProductoForm({...productoForm, stock_actual: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={productoForm.descripcion}
                    onChange={(e) => setProductoForm({...productoForm, descripcion: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                    placeholder="Descripción detallada del producto..."
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    value={productoForm.stock_minimo}
                    onChange={(e) => setProductoForm({...productoForm, stock_minimo: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Máximo *
                  </label>
                  <input
                    type="number"
                    value={productoForm.stock_maximo}
                    onChange={(e) => setProductoForm({...productoForm, stock_maximo: parseInt(e.target.value) || 100})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                    {isLoading ? 'Creando...' : 'Crear Producto'}
                  </button>
                </div>
              </form>

              {/* Lista de productos */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Productos Registrados ({productos.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Min/Max</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productos.map((producto) => (
                        <tr key={producto.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                              <div className="text-sm text-gray-500">{producto.descripcion}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{producto.stock_actual}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{producto.stock_minimo} / {producto.stock_maximo}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              producto.stock_actual <= producto.stock_minimo 
                                ? 'bg-red-100 text-red-800' 
                                : producto.stock_actual >= producto.stock_maximo
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {producto.stock_actual <= producto.stock_minimo ? 'Bajo' : 
                               producto.stock_actual >= producto.stock_maximo ? 'Alto' : 'Normal'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                                title="Ver detalles"
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100"
                                title="Editar"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => eliminarProductoHandler(producto.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                                title="Eliminar"
                                disabled={isLoading}
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
              </div>
            </div>
          )}

          {/* Crear Orden de Compra */}
          {activeTab === 'crear-orden' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Crear Orden de Compra</h2>
                <FaShoppingCart className="text-2xl text-purple-600" />
              </div>
              
              <form onSubmit={handleOrdenCompraSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proveedor *
                    </label>
                    <select
                      value={ordenCompraForm.id_proveedor}
                      onChange={(e) => setOrdenCompraForm({...ordenCompraForm, id_proveedor: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Seleccionar proveedor...</option>
                      {proveedores.map((proveedor) => (
                        <option key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Entrega *
                    </label>
                    <input
                      type="date"
                      value={ordenCompraForm.fecha_entrega}
                      onChange={(e) => setOrdenCompraForm({...ordenCompraForm, fecha_entrega: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Agregar detalles */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Agregar Detalles de Compra</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                      <select
                        value={detalleTemp.id_producto}
                        onChange={(e) => setDetalleTemp({...detalleTemp, id_producto: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="">Seleccionar...</option>
                        {productos.map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                      <input
                        type="number"
                        value={detalleTemp.cantidad}
                        onChange={(e) => setDetalleTemp({...detalleTemp, cantidad: parseInt(e.target.value) || 1})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                        placeholder="Cantidad"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unit.</label>
                      <input
                        type="number"
                        value={detalleTemp.precio_unitario}
                        onChange={(e) => setDetalleTemp({...detalleTemp, precio_unitario: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={agregarDetalle}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
                      >
                        <FaPlus className="mr-2" />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de detalles */}
                {ordenCompraForm.detalles.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Detalles de la Orden</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cantidad</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Precio Unit.</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {ordenCompraForm.detalles.map((detalle) => (
                            <tr key={detalle.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{detalle.producto.nombre}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">${detalle.precio_unitario.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">${detalle.total.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  type="button"
                                  onClick={() => eliminarDetalle(detalle.id)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                                  disabled={isLoading}
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        Total: ${ordenCompraForm.detalles.reduce((sum, detalle) => sum + detalle.total, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={ordenCompraForm.detalles.length === 0 || isLoading}
                    className={`px-6 py-3 font-medium rounded-lg transition-colors duration-200 flex items-center ${
                      ordenCompraForm.detalles.length === 0 || isLoading
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                    {isLoading ? 'Creando...' : 'Crear Orden'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Ver Órdenes de Compra */}
          {activeTab === 'ver-ordenes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Órdenes de Compra</h2>
                <FaEye className="text-2xl text-indigo-600" />
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Órdenes</p>
                      <p className="text-2xl font-bold text-gray-800">{estadisticas.total || ordenesCompra.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaShoppingCart className="text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completadas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {estadisticas.completadas || ordenesCompra.filter(o => o.estado === 'Completada').length}
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
                        {estadisticas.pendientes || ordenesCompra.filter(o => o.estado === 'Pendiente').length}
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
                        ${(estadisticas.valorTotal || ordenesCompra.reduce((total, orden) => total + parseFloat(orden.total || 0), 0)).toLocaleString()}
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaFilter className="text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="Completada">Completadas</option>
                      <option value="Pendiente">Pendientes</option>
                      <option value="Aprobada">Aprobadas</option>
                      <option value="Cancelada">Canceladas</option>
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
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center">
                            ID Orden
                            {getSortIcon('id')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('proveedor')}
                        >
                          <div className="flex items-center">
                            Proveedor
                            {getSortIcon('proveedor')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('fecha_orden')}
                        >
                          <div className="flex items-center">
                            F. Creación
                            {getSortIcon('fecha_orden')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('fecha_entrega')}
                        >
                          <div className="flex items-center">
                            F. Entrega
                            {getSortIcon('fecha_entrega')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('total')}
                        >
                          <div className="flex items-center">
                            Total
                            {getSortIcon('total')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('estado')}
                        >
                          <div className="flex items-center">
                            Estado
                            {getSortIcon('estado')}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedOrdenes.map((orden, index) => {
                        const statusDisplay = getStatusDisplay(orden.estado);
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">OC-{orden.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{orden.proveedor?.nombre}</div>
                                <div className="text-sm text-gray-500">{orden.proveedor?.contacto}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(orden.fecha_orden).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(orden.fecha_entrega).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ${parseFloat(orden.total || 0).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                                <span className="mr-1">{statusDisplay.icon}</span>
                                {statusDisplay.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => verDetalleOrden(orden)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors duration-200"
                                  title="Ver detalles"
                                >
                                  <FaEye className="text-sm" />
                                </button>
                                {orden.estado === 'Pendiente' && (
                                  <button 
                                    onClick={() => cambiarEstadoOrden(orden.id, 'Aprobada')}
                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition-colors duration-200"
                                    title="Aprobar"
                                    disabled={isLoading}
                                  >
                                    <FaCheck className="text-sm" />
                                  </button>
                                )}
                                <button 
                                  className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                                  title="Imprimir"
                                >
                                  <FaPrint className="text-sm" />
                                </button>
                                <button 
                                  onClick={() => eliminarOrdenHandler(orden.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors duration-200"
                                  title="Eliminar"
                                  disabled={isLoading}
                                >
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

                {sortedOrdenes.length === 0 && (
                  <div className="text-center py-12">
                    <FaSearch className="mx-auto text-gray-400 text-4xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron órdenes</h3>
                    <p className="text-gray-500">Intenta con diferentes términos de búsqueda o filtros</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para ver detalles de orden */}
      {showDetalleModal && selectedOrden && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Detalle de Orden de Compra</h3>
                  <p className="text-gray-600">OC-{selectedOrden.id}</p>
                </div>
                <button
                  onClick={() => setShowDetalleModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Información de la Orden</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID de Orden:</span>
                      <span className="font-medium">OC-{selectedOrden.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Creación:</span>
                      <span className="font-medium">{new Date(selectedOrden.fecha_orden).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Entrega:</span>
                      <span className="font-medium">{new Date(selectedOrden.fecha_entrega).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusDisplay(selectedOrden.estado).bgColor} ${getStatusDisplay(selectedOrden.estado).textColor}`}>
                        {getStatusDisplay(selectedOrden.estado).text}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Información del Proveedor</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Empresa:</span>
                      <span className="font-medium">{selectedOrden.proveedor?.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contacto:</span>
                      <span className="font-medium">{selectedOrden.proveedor?.contacto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Correo:</span>
                      <span className="font-medium">{selectedOrden.proveedor?.correo_electronico}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detalles de productos */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Productos Solicitados</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Descripción</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cantidad</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Precio Unit.</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrden.detalles?.map((detalle) => (
                        <tr key={detalle.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{detalle.producto?.nombre}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{detalle.producto?.descripcion}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-center">{detalle.cantidad}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">${parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        Total de la Orden: ${parseFloat(selectedOrden.total || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedOrden.detalles?.length} producto{selectedOrden.detalles?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Observaciones */}
              {selectedOrden.observaciones && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Observaciones</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedOrden.observaciones}</p>
                  </div>
                </div>
              )}
              
              {/* Acciones */}
              <div className="border-t pt-6">
                <div className="flex flex-wrap gap-3 justify-end">
                  {selectedOrden.estado === 'Pendiente' && (
                    <>
                      <button
                        onClick={() => {
                          cambiarEstadoOrden(selectedOrden.id, 'Aprobada');
                          setShowDetalleModal(false);
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center disabled:opacity-50"
                      >
                        <FaCheck className="mr-2" />
                        Aprobar Orden
                      </button>
                      <button
                        onClick={() => {
                          cambiarEstadoOrden(selectedOrden.id, 'Cancelada');
                          setShowDetalleModal(false);
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center disabled:opacity-50"
                      >
                        <FaTimes className="mr-2" />
                        Cancelar Orden
                      </button>
                    </>
                  )}
                  {selectedOrden.estado === 'Aprobada' && (
                    <button
                      onClick={() => {
                        cambiarEstadoOrden(selectedOrden.id, 'Completada');
                        setShowDetalleModal(false);
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center disabled:opacity-50"
                    >
                      <FaCheckCircle className="mr-2" />
                      Marcar como Completada
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center">
                    <FaPrint className="mr-2" />
                    Imprimir
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center">
                    <FaDownload className="mr-2" />
                    Descargar PDF
                  </button>
                  <button
                    onClick={() => setShowDetalleModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produccion;
                              

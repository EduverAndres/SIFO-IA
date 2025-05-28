// src/pages/dashboard/Produccion.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUserTie,
  FaBoxOpen,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';

const Produccion = () => {
  const [activeTab, setActiveTab] = useState('crear-proveedor');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para formularios
  const [proveedorForm, setProveedorForm] = useState({
    nombre: '',
    contacto: '',
    correo: ''
  });

  const [productoForm, setProductoForm] = useState({
    nombre: '',
    descripcion: '',
    stock: 0,
    stockMinimo: 1,
    stockMaximo: 100
  });

  const [ordenCompraForm, setOrdenCompraForm] = useState({
    proveedor: '',
    fechaEntrega: '',
    detalles: []
  });

  const [detalleTemp, setDetalleTemp] = useState({
    producto: '',
    cantidad: 1,
    precioUnitario: 0
  });

  // Estados para órdenes de compra creadas
  const [ordenesCompra, setOrdenesCompra] = useState([
    {
      id: 'OC-2025-001',
      proveedor: { id: 1, nombre: 'Tech Solutions S.A.' },
      fechaEntrega: '2025-02-15',
      fechaCreacion: '2025-01-28',
      detalles: [
        { id: 1, producto: { nombre: 'Laptop Dell XPS' }, cantidad: 5, precioUnitario: 2500.00, total: 12500.00 }
      ],
      total: 12500.00,
      estado: 'Pendiente'
    }
  ]);

  // Datos simulados
  const [proveedores, setProveedores] = useState([
    { id: 1, nombre: 'Tech Solutions S.A.', contacto: 'Juan Pérez', correo: 'juan@techsolutions.com' },
    { id: 2, nombre: 'Office Supplies Inc.', contacto: 'María García', correo: 'maria@officesupplies.com' }
  ]);

  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Laptop Dell XPS', descripcion: 'Laptop de alto rendimiento', stock: 10, stockMinimo: 2, stockMaximo: 50 },
    { id: 2, nombre: 'Monitor 27"', descripcion: 'Monitor para diseño', stock: 15, stockMinimo: 3, stockMaximo: 30 }
  ]);

  // Manejadores de formularios
  const handleProveedorSubmit = (e) => {
    e.preventDefault();
    if (proveedorForm.nombre && proveedorForm.contacto && proveedorForm.correo) {
      const nuevoProveedor = {
        id: proveedores.length + 1,
        ...proveedorForm
      };
      setProveedores([...proveedores, nuevoProveedor]);
      setProveedorForm({ nombre: '', contacto: '', correo: '' });
      showSuccess('¡Proveedor creado exitosamente!');
    }
  };

  const handleProductoSubmit = (e) => {
    e.preventDefault();
    if (productoForm.nombre && productoForm.descripcion) {
      const nuevoProducto = {
        id: productos.length + 1,
        ...productoForm
      };
      setProductos([...productos, nuevoProducto]);
      setProductoForm({ nombre: '', descripcion: '', stock: 0, stockMinimo: 1, stockMaximo: 100 });
      showSuccess('¡Producto creado exitosamente!');
    }
  };

  const handleOrdenCompraSubmit = (e) => {
    e.preventDefault();
    if (ordenCompraForm.proveedor && ordenCompraForm.fechaEntrega && ordenCompraForm.detalles.length > 0) {
      const proveedorSeleccionado = proveedores.find(p => p.id == ordenCompraForm.proveedor);
      const nuevaOrden = {
        id: `OC-2025-${String(ordenesCompra.length + 2).padStart(3, '0')}`,
        proveedor: proveedorSeleccionado,
        fechaEntrega: ordenCompraForm.fechaEntrega,
        fechaCreacion: new Date().toISOString().split('T')[0],
        detalles: ordenCompraForm.detalles,
        total: ordenCompraForm.detalles.reduce((sum, detalle) => sum + detalle.total, 0),
        estado: 'Pendiente'
      };
      
      setOrdenesCompra([...ordenesCompra, nuevaOrden]);
      setOrdenCompraForm({ proveedor: '', fechaEntrega: '', detalles: [] });
      showSuccess(`¡Orden de compra ${nuevaOrden.id} creada exitosamente para ${proveedorSeleccionado.nombre}!`);
    }
  };

  const agregarDetalle = () => {
    if (detalleTemp.producto && detalleTemp.cantidad > 0 && detalleTemp.precioUnitario > 0) {
      const producto = productos.find(p => p.id == detalleTemp.producto);
      const nuevoDetalle = {
        id: Date.now(),
        producto: producto,
        cantidad: detalleTemp.cantidad,
        precioUnitario: detalleTemp.precioUnitario,
        total: detalleTemp.cantidad * detalleTemp.precioUnitario
      };
      setOrdenCompraForm({
        ...ordenCompraForm,
        detalles: [...ordenCompraForm.detalles, nuevoDetalle]
      });
      setDetalleTemp({ producto: '', cantidad: 1, precioUnitario: 0 });
    }
  };

  const eliminarDetalle = (id) => {
    setOrdenCompraForm({
      ...ordenCompraForm,
      detalles: ordenCompraForm.detalles.filter(d => d.id !== id)
    });
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const tabs = [
    { id: 'crear-proveedor', name: 'Crear Proveedor', icon: FaUserTie, color: 'blue' },
    { id: 'crear-producto', name: 'Crear Producto', icon: FaBoxOpen, color: 'green' },
    { id: 'crear-orden', name: 'Crear Orden de Compra', icon: FaShoppingCart, color: 'purple' },
    { id: 'ver-ordenes', name: 'Ver Órdenes de Compra', icon: FaEye, color: 'indigo' }
  ];

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

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
          <FaCheck className="mr-2" />
          {successMessage}
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
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={proveedorForm.correo}
                    onChange={(e) => setProveedorForm({...proveedorForm, correo: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: contacto@proveedor.com"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FaSave className="mr-2" />
                    Crear Proveedor
                  </button>
                </div>
              </form>

              {/* Lista de proveedores */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Proveedores Registrados</h3>
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
                          <td className="px-4 py-3 text-sm text-gray-700">{proveedor.correo}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <FaEye />
                              </button>
                              <button className="text-green-600 hover:text-green-800">
                                <FaEdit />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
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
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    value={productoForm.stock}
                    onChange={(e) => setProductoForm({...productoForm, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
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
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    value={productoForm.stockMinimo}
                    onChange={(e) => setProductoForm({...productoForm, stockMinimo: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Máximo *
                  </label>
                  <input
                    type="number"
                    value={productoForm.stockMaximo}
                    onChange={(e) => setProductoForm({...productoForm, stockMaximo: parseInt(e.target.value) || 100})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FaSave className="mr-2" />
                    Crear Producto
                  </button>
                </div>
              </form>

              {/* Lista de productos */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Registrados</h3>
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
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{producto.stock}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{producto.stockMinimo} / {producto.stockMaximo}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              producto.stock <= producto.stockMinimo 
                                ? 'bg-red-100 text-red-800' 
                                : producto.stock >= producto.stockMaximo
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {producto.stock <= producto.stockMinimo ? 'Bajo' : 
                               producto.stock >= producto.stockMaximo ? 'Alto' : 'Normal'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <FaEye />
                              </button>
                              <button className="text-green-600 hover:text-green-800">
                                <FaEdit />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
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
                      value={ordenCompraForm.proveedor}
                      onChange={(e) => setOrdenCompraForm({...ordenCompraForm, proveedor: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
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
                      value={ordenCompraForm.fechaEntrega}
                      onChange={(e) => setOrdenCompraForm({...ordenCompraForm, fechaEntrega: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
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
                        value={detalleTemp.producto}
                        onChange={(e) => setDetalleTemp({...detalleTemp, producto: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Solicitada</label>
                      <input
                        type="number"
                        value={detalleTemp.cantidad}
                        onChange={(e) => setDetalleTemp({...detalleTemp, cantidad: parseInt(e.target.value) || 1})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                        placeholder="Cantidad"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Precio por Unidad</label>
                      <input
                        type="number"
                        value={detalleTemp.precioUnitario}
                        onChange={(e) => setDetalleTemp({...detalleTemp, precioUnitario: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={agregarDetalle}
                        className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                      >
                        <FaPlus className="mr-2" />
                        Agregar Detalle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de detalles */}
                {ordenCompraForm.detalles.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Detalles de la Orden de Compra</h4>
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
                              <td className="px-4 py-3 text-sm text-gray-700">{detalle.cantidad}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">${detalle.precioUnitario.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">${detalle.total.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  type="button"
                                  onClick={() => eliminarDetalle(detalle.id)}
                                  className="text-red-600 hover:text-red-800"
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
                        Total de la Orden: ${ordenCompraForm.detalles.reduce((sum, detalle) => sum + detalle.total, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={ordenCompraForm.detalles.length === 0}
                    className={`px-6 py-3 font-medium rounded-lg transition-colors duration-200 flex items-center ${
                      ordenCompraForm.detalles.length === 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <FaSave className="mr-2" />
                    Crear Orden de Compra
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Produccion;
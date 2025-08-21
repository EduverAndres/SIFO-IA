// pages/PucPage.jsx - REFACTORIZADO CON COMPONENTES SEPARADOS Y ESTILOS MEJORADOS
import React, { useState, useEffect } from 'react';
import { FaSpinner, FaFileAlt, FaTree, FaList, FaRocket, FaChartLine } from 'react-icons/fa';

// Hooks personalizados
import { usePucData } from '../hooks/usePucData';
import { usePucTree } from '../hooks/usePucTree';
import { usePucValidation } from '../hooks/usePucValidation';

// Componentes PUC
import PucHeader from '../components/puc/PucHeader';
import PucFilters from '../components/puc/PucFilters';
import PucTable from '../components/puc/PucTable';
import PucTree from '../components/puc/PucTree';
import PucFormModal from '../components/puc/PucFormModal';
import PucDetailModal from '../components/puc/PucDetailModal';
import PucLegend from '../components/puc/PucLegend';
import PucNotifications from '../components/puc/PucNotifications';
import PucHelp from '../components/puc/PucHelp';

// Componentes de UI existentes
import ImportPucExcelModal from '../components/puc/ImportPucExcelModal';
import ExportPucModal from '../components/puc/ExportPucModal';

// Utilidades
import { 
  determinarNivelPorCodigo, 
  determinarTipoPorCodigo, 
  determinarNaturalezaPorClase, 
  sugerirCodigoPadre,
  extraerCodigosJerarquia,
  validarCodigoJerarquia
} from '../utils/pucUtils';

const PucPage = () => {
  // ===============================================
  // 🔄 HOOK PRINCIPAL DE DATOS
  // ===============================================
  const {
    // Estados
    cuentas,
    loading,
    error,
    success,
    estadisticas,
    filtros,
    paginacion,
    
    // Setters
    setFiltros,
    
    // Acciones
    cargarDatos,
    crearCuenta,
    actualizarCuenta,
    eliminarCuenta,
    cambiarPagina,
    limpiarFiltros,
    aplicarFiltroInteligentePorTipo,
    descargarTemplate,
    limpiarError,
    limpiarSuccess
  } = usePucData();

  // ===============================================
  // 🌳 HOOK DEL ÁRBOL JERÁRQUICO
  // ===============================================
  const {
    arbolConstruido,
    nodosExpandidos,
    toggleNodo,
    expandirTodos,
    contraerTodos,
    expandirSoloClases,
    estaExpandido
  } = usePucTree(cuentas);

  // ===============================================
  // 🔧 ESTADOS LOCALES PARA MODALES Y FORMULARIOS
  // ===============================================
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  
  // Estados de vista
  const [vistaArbol, setVistaArbol] = useState(true);
  const [vistaExpandida, setVistaExpandida] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    codigo_completo: '',
    descripcion: '',
    naturaleza: 'DEBITO',
    tipo_cuenta: 'DETALLE',
    acepta_movimientos: true,
    codigo_padre: ''
  });

  // ===============================================
  // 📥 FUNCIÓN DE IMPORTACIÓN
  // ===============================================
  const handleImportSuccess = async (result) => {
    try {
      limpiarError();
      await cargarDatos();
      setShowImportModal(false);
    } catch (err) {
      console.error('Error al actualizar después de importar:', err);
    }
  };

  // ===============================================
  // 📝 FUNCIONES CRUD
  // ===============================================
  const handleSubmit = async (datosEnriquecidos) => {
    try {
      // Validar jerarquía antes de enviar
      const validacion = validarCodigoJerarquia(
        datosEnriquecidos.codigo_completo,
        datosEnriquecidos.tipo_cuenta,
        datosEnriquecidos.codigo_padre
      );

      if (!validacion.valido) {
        throw new Error(`Errores de validación:\n${validacion.errores.join('\n')}`);
      }

      // Enriquecer datos con información calculada
      const datosCompletos = {
        ...datosEnriquecidos,
        nivel: determinarNivelPorCodigo(datosEnriquecidos.codigo_completo),
        naturaleza: datosEnriquecidos.naturaleza || determinarNaturalezaPorClase(datosEnriquecidos.codigo_completo),
        ...extraerCodigosJerarquia(datosEnriquecidos.codigo_completo)
      };

      if (editingAccount) {
        await actualizarCuenta(editingAccount.id, datosCompletos);
      } else {
        await crearCuenta(datosCompletos);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      // El error ya se maneja en los hooks
    }
  };

  const editarCuenta = (cuenta) => {
    setEditingAccount(cuenta);
    setFormData({
      codigo_completo: cuenta.codigo_completo,
      descripcion: cuenta.descripcion || '',
      naturaleza: cuenta.naturaleza,
      tipo_cuenta: cuenta.tipo_cuenta,
      acepta_movimientos: cuenta.acepta_movimientos,
      codigo_padre: cuenta.codigo_padre || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      codigo_completo: '',
      descripcion: '',
      naturaleza: 'DEBITO',
      tipo_cuenta: 'DETALLE',
      acepta_movimientos: true,
      codigo_padre: ''
    });
  };

  const verDetalleCuenta = (cuenta) => {
    setSelectedAccount(cuenta);
    setShowDetailModal(true);
  };

  const handleEliminarCuenta = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cuenta?')) return;
    await eliminarCuenta(id);
  };

  // ===============================================
  // 🎨 HANDLERS PARA COMPONENTES
  // ===============================================
  const handleNuevaCuenta = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAccount(null);
  };

  // ===============================================
  // 🎨 COMPONENTE PRINCIPAL CON ESTILOS MEJORADOS
  // ===============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-gradient-shift relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 space-y-6">
        
        {/* Header con estadísticas y botones principales - Animado */}
        <div className="animate-fade-in-down">
          <PucHeader
            estadisticas={estadisticas}
            onNuevaCuenta={handleNuevaCuenta}
            onImportar={() => setShowImportModal(true)}
            onExportar={() => setShowExportModal(true)}
            onDescargarTemplate={descargarTemplate}
            loading={loading}
          />
        </div>

        {/* Notificaciones de error/éxito - Animadas */}
        <div className="animate-fade-in-up">
          <PucNotifications
            error={error}
            success={success}
            onClearError={limpiarError}
            onClearSuccess={limpiarSuccess}
          />
        </div>

        {/* Panel de filtros inteligentes - Animado */}
        <div className="animate-fade-in-left">
          <PucFilters
            filtros={filtros}
            setFiltros={setFiltros}
            vistaArbol={vistaArbol}
            setVistaArbol={setVistaArbol}
            vistaExpandida={vistaExpandida}
            setVistaExpandida={setVistaExpandida}
            onLimpiarFiltros={limpiarFiltros}
            onAplicarFiltros={cargarDatos}
            onExportar={() => setShowExportModal(true)}
            onExpandirTodos={expandirTodos}
            onContraerTodos={contraerTodos}
            onExpandirSoloClases={expandirSoloClases}
            aplicarFiltroInteligentePorTipo={aplicarFiltroInteligentePorTipo}
          />
        </div>

        {/* Tabla/Árbol principal con diseño mejorado */}
        <div className="animate-fade-in-right">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 interactive-card">
            <div className="p-6 sm:p-8">
              {/* Header de la tabla con gradiente */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${
                    vistaArbol 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  }`}>
                    {vistaArbol ? <FaTree className="text-xl" /> : <FaList className="text-xl" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {vistaArbol ? 'Vista Árbol Jerárquico' : 'Vista Lista Detallada'}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Plan Único de Cuentas</p>
                  </div>
                </div>
                
                {/* Estadísticas en tiempo real */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200">
                    <FaChartLine className="text-blue-600" />
                    <span className="font-semibold text-blue-700">{cuentas.length}</span>
                    <span className="text-gray-600">mostradas</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-xl border border-purple-200">
                    <FaRocket className="text-purple-600" />
                    <span className="font-semibold text-purple-700">{paginacion.total}</span>
                    <span className="text-gray-600">total</span>
                  </div>
                  
                  {vistaArbol && (
                    <>
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
                        <FaTree className="text-green-600" />
                        <span className="font-semibold text-green-700">{arbolConstruido.length}</span>
                        <span className="text-gray-600">nodos raíz</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-yellow-50 px-4 py-2 rounded-xl border border-orange-200">
                        <span className="font-semibold text-orange-700">{nodosExpandidos.size}</span>
                        <span className="text-gray-600">expandidos</span>
                      </div>
                    </>
                  )}
                  
                  {paginacion.totalPaginas > 1 && (
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-2 rounded-xl border border-gray-200">
                      <span className="text-gray-600">Página</span>
                      <span className="font-semibold text-gray-700">{paginacion.paginaActual}</span>
                      <span className="text-gray-600">de</span>
                      <span className="font-semibold text-gray-700">{paginacion.totalPaginas}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido principal con estados mejorados */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <FaSpinner className="animate-spin text-5xl text-blue-500" />
                    <div className="absolute inset-0 animate-ping">
                      <FaSpinner className="text-5xl text-blue-300 opacity-75" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-700">Cargando cuentas</h3>
                    <p className="text-gray-500">Organizando la información del PUC...</p>
                  </div>
                  {/* Barra de progreso animada */}
                  <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : cuentas.length === 0 ? (
                <div className="text-center py-16 space-y-6">
                  <div className="relative inline-block">
                    <FaFileAlt className="text-8xl text-gray-300 mx-auto animate-pulse" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-600">No se encontraron cuentas</h3>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                      Parece que no hay cuentas que mostrar con los filtros actuales
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                      <button
                        onClick={limpiarFiltros}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        Limpiar Filtros
                      </button>
                      <button
                        onClick={() => setShowImportModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        Importar desde Excel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="transition-all duration-500 ease-in-out">
                  {vistaArbol ? (
                    /* Vista de Árbol Jerárquico con efectos */
                    <div className="animate-fade-in">
                      <PucTree
                        arbolConstruido={arbolConstruido}
                        nodosExpandidos={nodosExpandidos}
                        onToggleNodo={toggleNodo}
                        onVerDetalle={verDetalleCuenta}
                        onEditar={editarCuenta}
                        onEliminar={handleEliminarCuenta}
                        estaExpandido={estaExpandido}
                      />
                    </div>
                  ) : (
                    /* Vista de Tabla con efectos */
                    <div className="animate-fade-in">
                      <PucTable
                        cuentas={cuentas}
                        paginacion={paginacion}
                        filtros={filtros}
                        onVerDetalle={verDetalleCuenta}
                        onEditar={editarCuenta}
                        onEliminar={handleEliminarCuenta}
                        onCambiarPagina={cambiarPagina}
                        setFiltros={setFiltros}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leyenda de colores y niveles - Animada */}
        <div className="animate-fade-in-up">
          <PucLegend />
        </div>

        {/* Modal Crear/Editar Cuenta */}
        <PucFormModal
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editingAccount={editingAccount}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
        />

        {/* Modal Detalle Completo */}
        <PucDetailModal
          show={showDetailModal}
          onClose={handleCloseDetailModal}
          selectedAccount={selectedAccount}
          onEditar={editarCuenta}
        />

        {/* Modales de importación y exportación */}
        <ImportPucExcelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportSuccess}
          loading={loading}
        />

        <ExportPucModal
          visible={showExportModal}
          onCancel={() => setShowExportModal(false)}
        />

        {/* Ayuda flotante */}
        <PucHelp />
      </div>
    </div>
  );
};

export default PucPage;
// pages/PucPage.jsx - REFACTORIZADO CON COMPONENTES SEPARADOS
import React, { useState, useEffect } from 'react';
import { FaSpinner, FaFileAlt, FaTree, FaList } from 'react-icons/fa';

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
  // 🎨 COMPONENTE PRINCIPAL
  // ===============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-6">
        
        {/* Header con estadísticas y botones principales */}
        <PucHeader
          estadisticas={estadisticas}
          onNuevaCuenta={handleNuevaCuenta}
          onImportar={() => setShowImportModal(true)}
          onExportar={() => setShowExportModal(true)}
          onDescargarTemplate={descargarTemplate}
          loading={loading}
        />

        {/* Notificaciones de error/éxito */}
        <PucNotifications
          error={error}
          success={success}
          onClearError={limpiarError}
          onClearSuccess={limpiarSuccess}
        />

        {/* Panel de filtros inteligentes */}
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

        {/* Tabla/Árbol principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                {vistaArbol ? <FaTree className="text-green-600" /> : <FaList className="text-blue-600" />}
                <span>
                  {vistaArbol ? 'Vista Árbol Jerárquico' : 'Vista Lista Detallada'} - Cuentas PUC
                </span>
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{cuentas.length} cuentas mostradas</span>
                <span>•</span>
                <span>{paginacion.total} total</span>
                {vistaArbol && (
                  <>
                    <span>•</span>
                    <span>{arbolConstruido.length} nodos raíz</span>
                    <span>•</span>
                    <span>{nodosExpandidos.size} expandidos</span>
                  </>
                )}
                {paginacion.totalPaginas > 1 && (
                  <>
                    <span>•</span>
                    <span>Página {paginacion.paginaActual} de {paginacion.totalPaginas}</span>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-blue-600" />
                <span className="ml-3 text-gray-600">Cargando cuentas...</span>
              </div>
            ) : cuentas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaFileAlt className="text-6xl mx-auto mb-4" />
                </div>
                <p className="text-gray-500 text-lg">No se encontraron cuentas</p>
                <p className="text-gray-400 text-sm">Intenta ajustar los filtros o importar cuentas desde Excel</p>
              </div>
            ) : (
              <>
                {vistaArbol ? (
                  /* Vista de Árbol Jerárquico */
                  <PucTree
                    arbolConstruido={arbolConstruido}
                    nodosExpandidos={nodosExpandidos}
                    onToggleNodo={toggleNodo}
                    onVerDetalle={verDetalleCuenta}
                    onEditar={editarCuenta}
                    onEliminar={handleEliminarCuenta}
                    estaExpandido={estaExpandido}
                  />
                ) : (
                  /* Vista de Tabla */
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
                )}
              </>
            )}
          </div>
        </div>

        {/* Leyenda de colores y niveles */}
        <PucLegend />

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

        {/* Estilos CSS adicionales */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          
          .bg-gray-25 {
            background-color: #fafafa;
          }
          
          .bg-purple-25 {
            background-color: #faf5ff;
          }
          
          .bg-blue-25 {
            background-color: #eff6ff;
          }
          
          .bg-green-25 {
            background-color: #f0fdf4;
          }
          
          .bg-yellow-25 {
            background-color: #fefce8;
          }
          
          .bg-orange-25 {
            background-color: #fff7ed;
          }
          
          .hover\\:scale-105:hover {
            transform: scale(1.05);
          }
          
          .transition-all {
            transition: all 0.2s ease;
          }

          /* Scroll personalizado para tablas */
          .overflow-x-auto::-webkit-scrollbar,
          .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          .overflow-x-auto::-webkit-scrollbar-track,
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }
          
          .overflow-x-auto::-webkit-scrollbar-thumb,
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          
          .overflow-x-auto::-webkit-scrollbar-thumb:hover,
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          /* Mejoras para la vista de árbol */
          .select-none {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }

          /* Efectos hover mejorados */
          .transition-colors {
            transition-property: color, background-color, border-color;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PucPage;
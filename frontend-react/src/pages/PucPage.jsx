// pages/PucPage.jsx - DISEÑO ULTRA MINIMALISTA Y MODERNO
import React, { useState, useEffect } from 'react';
import { 
  FaSpinner, 
  FaFileAlt, 
  FaTree, 
  FaList, 
  FaRocket, 
  FaChartLine,
  FaDatabase,
  FaLayerGroup
} from 'react-icons/fa';

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
  } = usePucTree(cuentas || [], filtros);

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

  // Valores seguros para evitar errores de renderizado
  const safeCuentas = cuentas || [];
  const safePaginacion = paginacion || { total: 0, paginaActual: 1, totalPaginas: 1 };
  const safeArbolConstruido = arbolConstruido || [];
  const safeNodosExpandidos = nodosExpandidos || new Set();

  // ===============================================
  // 🎨 COMPONENTE PRINCIPAL - DISEÑO ULTRA MINIMALISTA
  // ===============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-white to-slate-50/60">
      {/* Contenedor principal ultra limpio */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header ultra minimalista con animación suave */}
        <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-top-4 fade-in">
          <div className="mb-8">
            <PucHeader
              estadisticas={estadisticas}
              onNuevaCuenta={handleNuevaCuenta}
              onImportar={() => setShowImportModal(true)}
              onExportar={() => setShowExportModal(true)}
              onDescargarTemplate={descargarTemplate}
              loading={loading}
            />
          </div>
        </div>

        {/* Notificaciones flotantes discretas */}
        <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-top-2 fade-in animation-delay-200">
          <PucNotifications
            error={error}
            success={success}
            onClearError={limpiarError}
            onClearSuccess={limpiarSuccess}
          />
        </div>

        {/* Panel de filtros con glassmorphism */}
        <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-left-4 fade-in animation-delay-300">
          <div className="mb-6">
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
        </div>

        {/* Contenedor principal con diseño ultra limpio */}
        <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-right-4 fade-in animation-delay-400">
          <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10">
            
            {/* Efectos de fondo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-gray-50/30 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="absolute -inset-px bg-gradient-to-r from-transparent via-gray-200/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Header del contenido ultra minimalista */}
            <div className="relative px-8 py-6 border-b border-gray-100/60">
              <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                
                {/* Título con iconografía moderna */}
                <div className="flex items-center space-x-4">
                  <div className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                    vistaArbol 
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-lg shadow-emerald-500/20' 
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-lg shadow-blue-500/20'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                    {vistaArbol ? <FaTree className="relative text-xl" /> : <FaList className="relative text-xl" />}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {vistaArbol ? 'Vista Jerárquica' : 'Vista Tabular'}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      Plan Único de Cuentas
                    </p>
                  </div>
                </div>
                
                {/* Métricas modernas con micro-animaciones */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="group flex items-center space-x-2 rounded-xl bg-gray-50/80 px-4 py-2.5 backdrop-blur-sm transition-all duration-200 hover:bg-gray-100/80 hover:scale-105">
                    <FaDatabase className="text-sm text-gray-600 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-sm font-semibold text-gray-700">{safeCuentas.length}</span>
                    <span className="text-xs font-medium text-gray-500">mostradas</span>
                  </div>
                  
                  <div className="group flex items-center space-x-2 rounded-xl bg-blue-50/80 px-4 py-2.5 backdrop-blur-sm transition-all duration-200 hover:bg-blue-100/80 hover:scale-105">
                    <FaChartLine className="text-sm text-blue-600 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-sm font-semibold text-blue-700">{safePaginacion.total}</span>
                    <span className="text-xs font-medium text-blue-500">total</span>
                  </div>
                  
                  {vistaArbol && (
                    <>
                      <div className="group flex items-center space-x-2 rounded-xl bg-emerald-50/80 px-4 py-2.5 backdrop-blur-sm transition-all duration-200 hover:bg-emerald-100/80 hover:scale-105">
                        <FaLayerGroup className="text-sm text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
                        <span className="text-sm font-semibold text-emerald-700">{safeArbolConstruido.length}</span>
                        <span className="text-xs font-medium text-emerald-500">raíz</span>
                      </div>
                      
                      <div className="group flex items-center space-x-2 rounded-xl bg-orange-50/80 px-4 py-2.5 backdrop-blur-sm transition-all duration-200 hover:bg-orange-100/80 hover:scale-105">
                        <span className="text-sm font-semibold text-orange-700">{safeNodosExpandidos.size}</span>
                        <span className="text-xs font-medium text-orange-500">expandidos</span>
                      </div>
                    </>
                  )}
                  
                  {safePaginacion.totalPaginas > 1 && (
                    <div className="group flex items-center space-x-2 rounded-xl bg-purple-50/80 px-4 py-2.5 backdrop-blur-sm transition-all duration-200 hover:bg-purple-100/80 hover:scale-105">
                      <span className="text-xs font-medium text-purple-500">Pág.</span>
                      <span className="text-sm font-semibold text-purple-700">{safePaginacion.paginaActual}</span>
                      <span className="text-xs font-medium text-purple-500">/</span>
                      <span className="text-sm font-semibold text-purple-700">{safePaginacion.totalPaginas}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido principal con estados ultra pulidos */}
            <div className="relative px-8 py-8">
              {loading ? (
                /* Estado de carga ultra moderno */
                <div className="flex flex-col items-center justify-center py-24 space-y-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                    <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-300 animate-spin opacity-60" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-semibold text-gray-800">Cargando datos</h3>
                    <p className="text-gray-500 max-w-sm">Organizando la información del Plan Único de Cuentas...</p>
                    <div className="h-1 w-48 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : safeCuentas.length === 0 ? (
                /* Estado vacío ultra elegante */
                <div className="text-center py-24 space-y-8">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl shadow-gray-500/10">
                      <FaFileAlt className="text-5xl text-gray-400" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <span className="text-xs text-white font-bold">!</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-700">No hay cuentas disponibles</h3>
                      <p className="text-gray-500 max-w-lg mx-auto mt-2 leading-relaxed">
                        No se encontraron cuentas que coincidan con los criterios de búsqueda actuales
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={limpiarFiltros}
                        className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-semibold shadow-xl shadow-gray-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-500/40 hover:scale-105"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative">Limpiar Filtros</span>
                      </button>
                      <button
                        onClick={() => setShowImportModal(true)}
                        className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative">Importar Datos</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Contenido principal con transición ultra suave */
                <div className="transition-all duration-500 ease-out">
                  {vistaArbol ? (
                    <div className="transform transition-all duration-500">
                      <PucTree
                        arbolConstruido={safeArbolConstruido}
                        nodosExpandidos={safeNodosExpandidos}
                        onToggleNodo={toggleNodo}
                        onVerDetalle={verDetalleCuenta}
                        onEditar={editarCuenta}
                        onEliminar={handleEliminarCuenta}
                        estaExpandido={estaExpandido}
                      />
                    </div>
                  ) : (
                    <div className="transform transition-all duration-500">
                      <PucTable
                        cuentas={safeCuentas}
                        paginacion={safePaginacion}
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

        {/* Leyenda ultra discreta */}
        <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-bottom-4 fade-in animation-delay-500">
          <div className="mt-8">
            <PucLegend />
          </div>
        </div>

        {/* Modales con diseño perfeccionado */}
        <PucFormModal
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editingAccount={editingAccount}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
        />

        <PucDetailModal
          show={showDetailModal}
          onClose={handleCloseDetailModal}
          selectedAccount={selectedAccount}
          onEditar={editarCuenta}
        />

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

        {/* Ayuda flotante ultra discreta */}
        <PucHelp />
      </div>

      {/* Estilos CSS personalizados para animaciones ultra suaves */}
      <style jsx global>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: var(--animate-enter-transform, translateY(16px));
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: animate-in 0.6s ease-out forwards;
        }

        .slide-in-from-top-4 {
          --animate-enter-transform: translateY(-16px);
        }

        .slide-in-from-top-2 {
          --animate-enter-transform: translateY(-8px);
        }

        .slide-in-from-left-4 {
          --animate-enter-transform: translateX(-16px);
        }

        .slide-in-from-right-4 {
          --animate-enter-transform: translateX(16px);
        }

        .slide-in-from-bottom-4 {
          --animate-enter-transform: translateY(16px);
        }

        .fade-in {
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        /* Scroll personalizado ultra minimalista */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }

        /* Smooth focus para accesibilidad */
        *:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default PucPage;
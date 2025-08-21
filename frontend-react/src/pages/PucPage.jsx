// pages/PucPage.jsx - DISEÑO ULTRA CLARO Y PRESENTABLE
import React, { useState, useEffect } from 'react';
import { 
  FaSpinner, 
  FaFileAlt, 
  FaTree, 
  FaList, 
  FaRocket, 
  FaChartLine,
  FaDatabase,
  FaLayerGroup,
  FaChartBar,
  FaCog,
  FaExpand,
  FaCompress,
  FaSearch,
  FaFilter,
  FaEye
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
  // 🔄 HOOKS Y ESTADOS
  // ===============================================
  const {
    cuentas,
    loading,
    error,
    success,
    estadisticas,
    filtros,
    paginacion,
    setFiltros,
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

  const {
    arbolConstruido,
    nodosExpandidos,
    toggleNodo,
    expandirTodos,
    contraerTodos,
    expandirSoloClases,
    estaExpandido
  } = usePucTree(cuentas || [], filtros);

  // Estados locales
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [vistaArbol, setVistaArbol] = useState(true);
  const [vistaExpandida, setVistaExpandida] = useState(false);
  
  const [formData, setFormData] = useState({
    codigo_completo: '',
    descripcion: '',
    naturaleza: 'DEBITO',
    tipo_cuenta: 'DETALLE',
    acepta_movimientos: true,
    codigo_padre: ''
  });

  // ===============================================
  // 📝 FUNCIONES
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

  const handleSubmit = async (datosEnriquecidos) => {
    try {
      const validacion = validarCodigoJerarquia(
        datosEnriquecidos.codigo_completo,
        datosEnriquecidos.tipo_cuenta,
        datosEnriquecidos.codigo_padre
      );

      if (!validacion.valido) {
        throw new Error(`Errores de validación:\n${validacion.errores.join('\n')}`);
      }

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

  // Valores seguros
  const safeCuentas = cuentas || [];
  const safePaginacion = paginacion || { total: 0, paginaActual: 1, totalPaginas: 1 };
  const safeArbolConstruido = arbolConstruido || [];
  const safeNodosExpandidos = nodosExpandidos || new Set();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* =============================================== */}
      {/* 🎨 FONDO DECORATIVO SUTIL */}
      {/* =============================================== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* =============================================== */}
      {/* 📱 CONTENEDOR PRINCIPAL */}
      {/* =============================================== */}
      <div className="relative z-10">
        
        {/* HEADER PRINCIPAL */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
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
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
          
          {/* NOTIFICACIONES */}
          <div className="animate-fade-in-up animation-delay-200">
            <PucNotifications
              error={error}
              success={success}
              onClearError={limpiarError}
              onClearSuccess={limpiarSuccess}
            />
          </div>

          {/* PANEL DE FILTROS Y CONTROLES */}
          <div className="animate-fade-in-left animation-delay-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
              <div className="p-6">
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
          </div>

          {/* ÁREA PRINCIPAL DE DATOS */}
          <div className="animate-fade-in-right animation-delay-400">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
              
              {/* HEADER DE LA VISTA */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/80 px-8 py-6">
                <div className="flex items-center justify-between">
                  
                  {/* TÍTULO DE LA VISTA */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className={`p-4 rounded-xl transition-all duration-300 ${
                        vistaArbol 
                          ? 'bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-200' 
                          : 'bg-blue-100 text-blue-700 shadow-lg shadow-blue-200'
                      }`}>
                        {vistaArbol ? (
                          <FaTree className="text-2xl" />
                        ) : (
                          <FaList className="text-2xl" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {vistaArbol ? 'Vista Jerárquica' : 'Vista Tabular'}
                      </h1>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            Plan Único de Cuentas
                          </span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div className="flex items-center space-x-1">
                          <FaChartBar className="text-sm text-gray-500" />
                          <span className="text-sm font-medium text-gray-500">Sistema Contable</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MÉTRICAS DISTRIBUIDAS */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    
                    {/* Cuentas Mostradas */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/60 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <FaEye className="text-lg text-gray-700" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-800">{safeCuentas.length}</div>
                          <div className="text-xs text-gray-600 font-medium uppercase">Mostradas</div>
                        </div>
                      </div>
                    </div>

                    {/* Total de Cuentas */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200/60 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-200 rounded-lg">
                          <FaDatabase className="text-lg text-blue-700" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-800">{safePaginacion.total}</div>
                          <div className="text-xs text-blue-600 font-medium uppercase">Total</div>
                        </div>
                      </div>
                    </div>

                    {/* Métricas del Árbol (solo si vista árbol) */}
                    {vistaArbol && (
                      <>
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200/60 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-200 rounded-lg">
                              <FaLayerGroup className="text-lg text-emerald-700" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-emerald-800">{safeArbolConstruido.length}</div>
                              <div className="text-xs text-emerald-600 font-medium uppercase">Raíz</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-amber-200 rounded-lg">
                              <FaExpand className="text-lg text-amber-700" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-amber-800">{safeNodosExpandidos.size}</div>
                              <div className="text-xs text-amber-600 font-medium uppercase">Expandidos</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Paginación (solo si hay múltiples páginas) */}
                    {safePaginacion.totalPaginas > 1 && (
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200/60 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-200 rounded-lg">
                            <FaFileAlt className="text-lg text-purple-700" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-800">
                              {safePaginacion.paginaActual}/{safePaginacion.totalPaginas}
                            </div>
                            <div className="text-xs text-purple-600 font-medium uppercase">Páginas</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botón de Configuración */}
                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300/60 hover:shadow-md transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center justify-center h-full">
                        <FaCog className="text-2xl text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTENIDO DINÁMICO */}
              <div className="p-8">
                {loading ? (
                  /* ESTADO DE CARGA */
                  <div className="flex flex-col items-center justify-center py-24 space-y-8">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                      <div className="absolute inset-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" 
                           style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaDatabase className="text-blue-600 text-lg animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="text-center max-w-md space-y-4">
                      <h3 className="text-2xl font-bold text-gray-800">Cargando datos...</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Organizando la información del Plan Único de Cuentas y construyendo la estructura jerárquica.
                      </p>
                      <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-loading-bar"></div>
                      </div>
                    </div>
                  </div>
                ) : safeCuentas.length === 0 ? (
                  /* ESTADO VACÍO */
                  <div className="text-center py-24 space-y-8">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaFileAlt className="text-5xl text-gray-400" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                    </div>
                    
                    <div className="max-w-lg mx-auto space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">No hay cuentas disponibles</h3>
                        <p className="text-gray-600 mt-2 leading-relaxed">
                          No se encontraron cuentas que coincidan con los criterios de búsqueda actuales. 
                          Puedes limpiar los filtros o importar nuevos datos.
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={limpiarFiltros}
                          className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                          Limpiar Filtros
                        </button>
                        <button
                          onClick={() => setShowImportModal(true)}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
                        >
                          <FaRocket className="text-lg" />
                          <span>Importar Datos</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CONTENIDO PRINCIPAL */
                  <div className="space-y-6">
                    {vistaArbol ? (
                      <PucTree
                        arbolConstruido={safeArbolConstruido}
                        nodosExpandidos={safeNodosExpandidos}
                        onToggleNodo={toggleNodo}
                        onVerDetalle={verDetalleCuenta}
                        onEditar={editarCuenta}
                        onEliminar={handleEliminarCuenta}
                        estaExpandido={estaExpandido}
                      />
                    ) : (
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
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LEYENDA */}
          <div className="animate-fade-in-up animation-delay-600">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
              <div className="p-6">
                <PucLegend />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALES */}
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

      <PucHelp />

      {/* ESTILOS PERSONALIZADOS */}
      <style jsx global>{`
        /* Animaciones suaves */
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        /* Clases de animación */
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out forwards;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }

        /* Delays */
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Scrollbar mejorado */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.7);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.9);
        }

        /* Focus mejorado */
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

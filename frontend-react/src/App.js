// src/App.js - Versión corregida con Enhanced ErrorBoundary y patches de seguridad
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Páginas públicas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutSIFO from './pages/AboutSIFO';
import AboutUs from './pages/AboutUs';
import ProjectVision from './pages/ProjectVision';

// Layout del Dashboard
import DashboardLayout from './components/DashboardLayout';

// Páginas del Dashboard
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MenuFinanciero from './pages/dashboard/MenuFinanciero';
import Produccion from './pages/dashboard/Produccion';
import Presupuesto from './pages/dashboard/Presupuesto';
import PlaceholderPage from './pages/dashboard/PlaceholderPage';

// Componentes de utilidad - CAMBIO AQUÍ
import EnhancedErrorBoundary from './components/ErrorBoundary'; // Usar el Enhanced ErrorBoundary
import { enhancedDOMPatch } from './utils/domPatch';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    // Aplicar el patch del DOM cuando la app se monta (redundante pero seguro)
    if (process.env.NODE_ENV === 'development') {
      enhancedDOMPatch();
    }

    // Verificar que el patch esté aplicado en producción también
    if (!window.__ENHANCED_DOM_PATCH_APPLIED__) {
      console.warn('🔧 Aplicando DOM patch tardío...');
      enhancedDOMPatch();
    }

    // Función de limpieza para errores no manejados específicos de React 19
    const handleUnhandledErrors = (event) => {
      const error = event.error || event.reason;
      if (error && error.message) {
        if (error.message.includes('insertBefore') || 
            error.message.includes('removeChild') ||
            error.message.includes('not a child of this node')) {
          console.warn('🛡️ Error de DOM interceptado globalmente:', error.message);
          event.preventDefault();
          event.stopPropagation();
          return true;
        }
      }
    };

    // Agregar listeners para errores no manejados
    window.addEventListener('error', handleUnhandledErrors);
    window.addEventListener('unhandledrejection', handleUnhandledErrors);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleUnhandledErrors);
      window.removeEventListener('unhandledrejection', handleUnhandledErrors);
    };
  }, []);

  return (
    <EnhancedErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/aboutsifo" element={<AboutSIFO />} />
            <Route path="/nosotros" element={<AboutUs />} />
            <Route path="/vision" element={<ProjectVision />} />

            {/* Rutas del Dashboard - Todas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <EnhancedErrorBoundary>
                  <DashboardLayout />
                </EnhancedErrorBoundary>
              </ProtectedRoute>
            }>
              {/* Rutas anidadas del dashboard - Cada una protegida por su propio ErrorBoundary */}
              <Route index element={
                <EnhancedErrorBoundary>
                  <DashboardOverview />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="menu-financiero" element={
                <EnhancedErrorBoundary>
                  <MenuFinanciero />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="produccion" element={
                <EnhancedErrorBoundary>
                  <Produccion />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="ordenes-compra" element={
                <EnhancedErrorBoundary>
                  <Produccion />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="presupuesto" element={
                <EnhancedErrorBoundary>
                  <Presupuesto />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="reportes" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Reportes Financieros" 
                    icon="📊" 
                    description="Genera reportes detallados sobre el estado financiero de tu empresa con gráficos interactivos y análisis profundos."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="cuentas-pagar" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Cuentas por Pagar/Cobrar" 
                    icon="💰" 
                    description="Gestiona eficientemente todas las cuentas por pagar y cobrar, con recordatorios automáticos y seguimiento de vencimientos."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="tesoreria" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Tesorería" 
                    icon="🏦" 
                    description="Administra la liquidez de tu empresa, planifica flujos de caja y optimiza la gestión financiera diaria."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="conciliacion" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Conciliación Bancaria" 
                    icon="⚖️" 
                    description="Automatiza el proceso de conciliación bancaria y mantén tus registros contables siempre actualizados."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="procesos-ia" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Procesos IA" 
                    icon="🤖" 
                    description="Aprovecha la inteligencia artificial para automatizar procesos financieros y obtener insights predictivos."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="proyectos" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Proyectos Financieros" 
                    icon="📈" 
                    description="Gestiona proyectos con componente financiero, realiza seguimiento de presupuestos y analiza rentabilidad."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="caja-bancos" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Caja y Bancos" 
                    icon="💳" 
                    description="Controla todos los movimientos de efectivo y cuentas bancarias en tiempo real con reconciliación automática."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="contabilidad" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Contabilidad NIIF" 
                    icon="📋" 
                    description="Mantén tu contabilidad bajo estándares NIIF con asientos automáticos y reportes de cumplimiento."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="nomina" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Nómina" 
                    icon="👥" 
                    description="Gestiona la nómina de empleados, cálculos automáticos de prestaciones y cumplimiento legal laboral."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="facturacion" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Facturación Electrónica" 
                    icon="🧾" 
                    description="Genera facturas electrónicas cumpliendo con la normativa DIAN, con envío automático y seguimiento."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="migracion" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Migración de Datos" 
                    icon="📁" 
                    description="Importa datos desde otros sistemas de manera segura y confiable, con validación automática."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="crm" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Integración CRM" 
                    icon="🔗" 
                    description="Conecta tu sistema financiero con CRM para una visión 360° de clientes y oportunidades comerciales."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="plan-cuentas" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Plan de Cuentas" 
                    icon="📝" 
                    description="Define y gestiona tu plan de cuentas contable con estructura jerárquica y clasificaciones personalizadas."
                  />
                </EnhancedErrorBoundary>
              } />
              
              <Route path="configuracion" element={
                <EnhancedErrorBoundary>
                  <PlaceholderPage 
                    title="Configuración" 
                    icon="⚙️" 
                    description="Personaliza el sistema según las necesidades de tu empresa, usuarios, permisos y preferencias."
                  />
                </EnhancedErrorBoundary>
              } />
            </Route>

            {/* Ruta de fallback */}
            <Route path="*" element={
              <EnhancedErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-4xl font-bold text-gray-700 mb-4">404</h1>
                    <p className="text-gray-500 mb-6">
                      La página que buscas no existe o ha sido movida.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.history.back()}
                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        ← Volver Atrás
                      </button>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      >
                        🏠 Ir al Inicio
                      </button>
                    </div>
                  </div>
                </div>
              </EnhancedErrorBoundary>
            } />
          </Routes>
        </div>
      </Router>
    </EnhancedErrorBoundary>
  );
}

export default App;
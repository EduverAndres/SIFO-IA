// src/App.js - Estructura mejorada con rutas separadas
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

// Componentes de utilidad
import ErrorBoundary from './components/ErrorBoundary';
import { patchDOMRemoval } from './utils/domPatch';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    // Aplicar el patch del DOM cuando la app se monta
    if (process.env.NODE_ENV === 'development') {
      patchDOMRemoval();
    }
  }, []);

  return (
    <ErrorBoundary>
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
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Rutas anidadas del dashboard */}
              <Route index element={<DashboardOverview />} />
              <Route path="menu-financiero" element={<MenuFinanciero />} />
              <Route path="produccion" element={<Produccion />} />
              <Route path="ordenes-compra" element={<Produccion />} />
              <Route path="presupuesto" element={<Presupuesto />} />
              <Route path="reportes" element={
                <PlaceholderPage 
                  title="Reportes Financieros" 
                  icon="📊" 
                  description="Genera reportes detallados sobre el estado financiero de tu empresa con gráficos interactivos y análisis profundos."
                />
              } />
              <Route path="cuentas-pagar" element={
                <PlaceholderPage 
                  title="Cuentas por Pagar/Cobrar" 
                  icon="💰" 
                  description="Gestiona eficientemente todas las cuentas por pagar y cobrar, con recordatorios automáticos y seguimiento de vencimientos."
                />
              } />
              <Route path="tesoreria" element={
                <PlaceholderPage 
                  title="Tesorería" 
                  icon="🏦" 
                  description="Administra la liquidez de tu empresa, planifica flujos de caja y optimiza la gestión financiera diaria."
                />
              } />
              <Route path="conciliacion" element={
                <PlaceholderPage 
                  title="Conciliación Bancaria" 
                  icon="⚖️" 
                  description="Automatiza el proceso de conciliación bancaria y mantén tus registros contables siempre actualizados."
                />
              } />
              <Route path="procesos-ia" element={
                <PlaceholderPage 
                  title="Procesos IA" 
                  icon="🤖" 
                  description="Aprovecha la inteligencia artificial para automatizar procesos financieros y obtener insights predictivos."
                />
              } />
              <Route path="proyectos" element={
                <PlaceholderPage 
                  title="Proyectos Financieros" 
                  icon="📈" 
                  description="Gestiona proyectos con componente financiero, realiza seguimiento de presupuestos y analiza rentabilidad."
                />
              } />
              <Route path="caja-bancos" element={
                <PlaceholderPage 
                  title="Caja y Bancos" 
                  icon="💳" 
                  description="Controla todos los movimientos de efectivo y cuentas bancarias en tiempo real con reconciliación automática."
                />
              } />
              <Route path="contabilidad" element={
                <PlaceholderPage 
                  title="Contabilidad NIIF" 
                  icon="📋" 
                  description="Mantén tu contabilidad bajo estándares NIIF con asientos automáticos y reportes de cumplimiento."
                />
              } />
              <Route path="nomina" element={
                <PlaceholderPage 
                  title="Nómina" 
                  icon="👥" 
                  description="Gestiona la nómina de empleados, cálculos automáticos de prestaciones y cumplimiento legal laboral."
                />
              } />
              <Route path="facturacion" element={
                <PlaceholderPage 
                  title="Facturación Electrónica" 
                  icon="🧾" 
                  description="Genera facturas electrónicas cumpliendo con la normativa DIAN, con envío automático y seguimiento."
                />
              } />
              <Route path="migracion" element={
                <PlaceholderPage 
                  title="Migración de Datos" 
                  icon="📁" 
                  description="Importa datos desde otros sistemas de manera segura y confiable, con validación automática."
                />
              } />
              <Route path="crm" element={
                <PlaceholderPage 
                  title="Integración CRM" 
                  icon="🔗" 
                  description="Conecta tu sistema financiero con CRM para una visión 360° de clientes y oportunidades comerciales."
                />
              } />
              <Route path="plan-cuentas" element={
                <PlaceholderPage 
                  title="Plan de Cuentas" 
                  icon="📝" 
                  description="Define y gestiona tu plan de cuentas contable con estructura jerárquica y clasificaciones personalizadas."
                />
              } />
              <Route path="configuracion" element={
                <PlaceholderPage 
                  title="Configuración" 
                  icon="⚙️" 
                  description="Personaliza el sistema según las necesidades de tu empresa, usuarios, permisos y preferencias."
                />
              } />
            </Route>

            {/* Ruta de fallback */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-700 mb-4">404</h1>
                  <p className="text-gray-500">Página no encontrada</p>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
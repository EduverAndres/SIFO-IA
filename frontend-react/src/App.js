import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './components/Dashboard';
import AboutSIFO from './pages/AboutSIFO';
import AboutUs from './pages/AboutUs';
import ProjectVision from './pages/ProjectVision';

// Importar el Error Boundary y el DOM patch
import ErrorBoundary from './components/ErrorBoundary';
import { patchDOMRemoval } from './utils/domPatch';

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
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            } />
            <Route path="/aboutsifo" element={<AboutSIFO />} />
            <Route path="/nosotros" element={<AboutUs />} />
            <Route path="/vision" element={<ProjectVision />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
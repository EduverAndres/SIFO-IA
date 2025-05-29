// src/pages/HomePage.jsx - Versión mejorada con diseño moderno y responsive
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaRocket,
  FaLightbulb,
  FaShieldAlt,
  FaChartLine,
  FaCog,
  FaUsers,
  FaBrain,
  FaDatabase,
  FaCloudUploadAlt,
  FaPlay,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaQuoteLeft,
  FaGlobe,
  FaMoneyBillWave,
  FaCalculator,
  FaFileInvoiceDollar,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaAward,
  FaHandshake
} from 'react-icons/fa';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState({});
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    companies: 0,
    transactions: 0,
    savings: 0,
    satisfaction: 0
  });

  // Animación de números (counter)
  useEffect(() => {
    const targetStats = {
      companies: 500,
      transactions: 1000000,
      savings: 85,
      satisfaction: 98
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const counters = Object.keys(targetStats).map(key => ({
      key,
      current: 0,
      target: targetStats[key],
      increment: targetStats[key] / steps
    }));

    const timer = setInterval(() => {
      let allComplete = true;
      
      counters.forEach(counter => {
        if (counter.current < counter.target) {
          allComplete = false;
          counter.current = Math.min(counter.current + counter.increment, counter.target);
          setStats(prev => ({
            ...prev,
            [counter.key]: Math.floor(counter.current)
          }));
        }
      });

      if (allComplete) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  // Intersection Observer para animaciones
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Testimonials data
  const testimonials = [
    {
      name: "María González",
      position: "CEO, TechCorp",
      content: "SIFO-IA transformó completamente nuestra gestión contable. La precisión de la IA nos ahorró 20 horas semanales.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Carlos Martínez",
      position: "CFO, InnovaFinance",
      content: "La automatización de procesos y los insights predictivos nos ayudaron a tomar mejores decisiones financieras.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Ana Rodríguez",
      position: "Contadora, StartupPlus",
      content: "Increíble facilidad de uso. La interfaz es intuitiva y la IA realmente entiende nuestras necesidades contables.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  // Cambio automático de testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const features = [
    {
      icon: FaBrain,
      title: "Inteligencia Artificial Avanzada",
      description: "Algoritmos de ML que aprenden de tus patrones financieros para optimizar procesos automáticamente.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: FaDatabase,
      title: "Extracción Automática de Datos",
      description: "Captura información de facturas, recibos y documentos con precisión del 99.8%.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: FaChartLine,
      title: "Análisis Predictivo",
      description: "Predicciones financieras inteligentes que te ayudan a planificar el futuro de tu empresa.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: FaShieldAlt,
      title: "Seguridad Empresarial",
      description: "Encriptación de nivel bancario y cumplimiento con estándares internacionales de seguridad.",
      color: "from-red-500 to-orange-600"
    },
    {
      icon: FaCloudUploadAlt,
      title: "Acceso en la Nube",
      description: "Disponible 24/7 desde cualquier dispositivo, con sincronización en tiempo real.",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: FaCog,
      title: "Automatización Completa",
      description: "Automatiza tareas repetitivas y enfócate en decisiones estratégicas importantes.",
      color: "from-yellow-500 to-amber-600"
    }
  ];

  const moduleCards = [
    {
      icon: FaMoneyBillWave,
      title: "Gestión Financiera",
      description: "Control total de ingresos, gastos y flujo de caja",
      link: "/dashboard/tesoreria"
    },
    {
      icon: FaCalculator,
      title: "Contabilidad NIIF",
      description: "Cumplimiento normativo y reportes automáticos",
      link: "/dashboard/contabilidad"
    },
    {
      icon: FaFileInvoiceDollar,
      title: "Facturación Electrónica",
      description: "Integración directa con la DIAN",
      link: "/dashboard/facturacion"
    },
    {
      icon: FaChartLine,
      title: "Reportes Inteligentes",
      description: "Analytics avanzados con IA predictiva",
      link: "/dashboard/reportes"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans text-gray-900 overflow-hidden">
      {/* Header Mejorado */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg px-4 md:px-8 h-20 flex items-center sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between h-full">
          <Link 
            to="/" 
            className="text-3xl font-extrabold text-blue-700 tracking-tight hover:scale-105 transition-transform duration-300"
          >
            <span className="text-indigo-600">SIFO</span>-IA
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 items-center h-full">
            <Link
              to="/"
              className="text-blue-600 font-semibold text-lg border-b-2 border-blue-600 pb-1"
            >
              Inicio
            </Link>
            <Link
              to="/aboutsifo"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg relative group"
            >
              SIFO-IA
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/nosotros"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg relative group"
            >
              Nosotros
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/vision"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg relative group"
            >
              Visión del Proyecto
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/login"
              className="ml-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105"
            >
              Acceder
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 animate-slide-in-up">
            <nav className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/aboutsifo"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SIFO-IA
              </Link>
              <Link
                to="/nosotros"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                to="/vision"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Visión del Proyecto
              </Link>
              <Link
                to="/login"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Acceder
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section Mejorado */}
      <section 
        id="hero"
        data-animate
        className={`container mx-auto py-16 md:py-24 lg:py-32 px-4 md:px-8 relative overflow-hidden transform transition-all duration-1000 ${
          isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft animation-delay-4000"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Contenido del Hero */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
                El Futuro de la{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 animate-gradient-shift">
                  Contabilidad
                </span>{' '}
                es Hoy
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl">
                Revoluciona tu gestión financiera con <strong>SIFO-IA</strong>. 
                Inteligencia artificial que automatiza, optimiza y predice para que 
                tú te enfoques en hacer crecer tu negocio.
              </p>
            </div>

            {/* Características destacadas */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span className="text-sm font-medium">99.8% Precisión</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span className="text-sm font-medium">24/7 Disponible</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span className="text-sm font-medium">NIIF Compliant</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/aboutsifo"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <FaRocket className="mr-3 group-hover:animate-bounce" />
                Explorar SIFO-IA
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/login"
                className="group px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <FaPlay className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                Comenzar Ahora
              </Link>
            </div>
          </div>

          {/* Imagen/Ilustración del Hero */}
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Dashboard SIFO-IA</h3>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Ingresos del mes</span>
                      <span className="text-lg font-bold text-green-600">+24.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Facturas procesadas</span>
                      <span className="text-lg font-bold text-blue-600">1,247</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Tiempo ahorrado</span>
                      <span className="text-lg font-bold text-purple-600">85 hrs</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">IA Prediction</p>
                        <p className="text-lg font-bold">Flujo de caja optimizado</p>
                      </div>
                      <FaBrain className="text-2xl opacity-80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elementos flotantes decorativos */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-400 rounded-full opacity-80 animate-bounce animation-delay-1000"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-pink-400 rounded-full opacity-80 animate-bounce animation-delay-2000"></div>
            <div className="absolute top-1/2 -left-8 w-12 h-12 bg-green-400 rounded-full opacity-80 animate-bounce animation-delay-3000"></div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <FaChevronDown className="text-2xl text-gray-400" />
        </div>
      </section>

      {/* Estadísticas Impactantes */}
      <section 
        id="stats"
        data-animate
        className={`py-16 md:py-24 bg-white transform transition-all duration-1000 delay-300 ${
          isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Resultados que Hablan por Sí Solos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Miles de empresas ya confían en SIFO-IA para transformar su gestión financiera
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="text-2xl text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {stats.companies.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Empresas Activas</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaFileInvoiceDollar className="text-2xl text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {(stats.transactions / 1000000).toFixed(1)}M+
              </div>
              <div className="text-gray-600 font-medium">Transacciones Procesadas</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="text-2xl text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {stats.savings}%
              </div>
              <div className="text-gray-600 font-medium">Ahorro en Tiempo</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaStar className="text-2xl text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {stats.satisfaction}%
              </div>
              <div className="text-gray-600 font-medium">Satisfacción Cliente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section 
        id="features"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 transform transition-all duration-1000 delay-500 ${
          isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Tecnología que Marca la{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Diferencia
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Descubre las capacidades avanzadas que hacen de SIFO-IA la solución contable más innovadora del mercado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 cursor-pointer border border-gray-100"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span className="mr-2">Saber más</span>
                    <FaArrowRight className="text-sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Módulos Principales */}
      <section 
        id="modules"
        data-animate
        className={`py-16 md:py-24 bg-white transform transition-all duration-1000 delay-700 ${
          isVisible.modules ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Todo lo que Necesitas en un Solo Lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Módulos integrados que cubren todos los aspectos de tu gestión financiera empresarial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {moduleCards.map((module, index) => {
              const IconComponent = module.icon;
              return (
                <Link
                  key={index}
                  to={module.link}
                  className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="text-xl text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {module.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                    <span className="mr-2">Explorar</span>
                    <FaArrowRight className="text-xs" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/dashboard/menu-financiero"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FaGlobe className="mr-3" />
              Ver Todos los Módulos
              <FaArrowRight className="ml-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimoniales */}
      <section 
        id="testimonials"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden transform transition-all duration-1000 delay-900 ${
          isVisible.testimonials ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mt-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mb-48"></div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Empresas de todos los tamaños confían en SIFO-IA para transformar su gestión financiera
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
              <FaQuoteLeft className="text-4xl text-blue-300 mb-6" />
              
              <div className="mb-8">
                <p className="text-xl md:text-2xl leading-relaxed text-white/90 mb-6">
                  "{testimonials[currentTestimonial].content}"
                </p>
                
                <div className="flex items-center">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full border-4 border-white/30 mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-blue-200">
                      {testimonials[currentTestimonial].position}
                    </p>
                  </div>
                  <div className="ml-auto flex space-x-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Indicadores de testimonial */}
              <div className="flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por Qué Elegir SIFO-IA */}
      <section 
        id="why-choose"
        data-animate
        className={`py-16 md:py-24 bg-white transform transition-all duration-1000 delay-1100 ${
          isVisible['why-choose'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
                ¿Por Qué Elegir{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  SIFO-IA?
                </span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                    <FaCheckCircle className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Implementación Instantánea
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Comienza a usar SIFO-IA en minutos, no en meses. Nuestra plataforma 
                      está lista para trabajar desde el primer día.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                    <FaAward className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Soporte Especializado 24/7
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Nuestro equipo de expertos contables y técnicos está disponible 
                      cuando lo necesites, sin costo adicional.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
                    <FaHandshake className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Escalabilidad Garantizada
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Desde startups hasta grandes corporaciones, SIFO-IA crece 
                      contigo sin límites ni restricciones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
                    <FaShieldAlt className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Seguridad de Nivel Bancario
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Encriptación end-to-end, cumplimiento SOC 2 Type II y 
                      certificaciones internacionales de seguridad.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/aboutsifo"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FaLightbulb className="mr-3" />
                  Descubre Más Ventajas
                  <FaArrowRight className="ml-3" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      ROI Promedio
                    </h3>
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      340%
                    </div>
                    <p className="text-gray-600">en el primer año</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Tiempo ahorrado</span>
                      <span className="font-bold text-blue-600">40+ hrs/mes</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Errores reducidos</span>
                      <span className="font-bold text-green-600">-95%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Costos operativos</span>
                      <span className="font-bold text-purple-600">-60%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-400 rounded-full opacity-80 animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section 
        id="final-cta"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden transform transition-all duration-1000 delay-1300 ${
          isVisible['final-cta'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              ¿Listo para Revolucionar tu{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Contabilidad?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Únete a las miles de empresas que ya han transformado su gestión financiera con SIFO-IA. 
              El futuro de la contabilidad está aquí, y es inteligente.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <FaRocket className="mr-3" />
                Comenzar Gratis
              </Link>
              <Link
                to="/aboutsifo"
                className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <FaPlay className="mr-3" />
                Ver Demo
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center">
                <FaCheckCircle className="mr-2 text-green-400" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-2 text-green-400" />
                <span>Setup en 5 minutos</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-2 text-green-400" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Mejorado */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Información de la empresa */}
            <div className="lg:col-span-2">
              <Link to="/" className="text-3xl font-bold text-white mb-4 block">
                <span className="text-blue-400">SIFO</span>-IA
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                Revolucionando la contabilidad empresarial con inteligencia artificial avanzada. 
                Automatiza, optimiza y predice para hacer crecer tu negocio.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 p-2 bg-gray-800 rounded-full hover:bg-blue-600">
                  <FaUsers className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 p-2 bg-gray-800 rounded-full hover:bg-blue-600">
                  <FaGlobe className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 p-2 bg-gray-800 rounded-full hover:bg-blue-600">
                  <FaHandshake className="text-xl" />
                </a>
              </div>
            </div>
            
            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Producto</h3>
              <ul className="space-y-3">
                <li><Link to="/aboutsifo" className="text-gray-300 hover:text-white transition-colors duration-300">Características</Link></li>
                <li><Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300">Dashboard</Link></li>
                <li><Link to="/vision" className="text-gray-300 hover:text-white transition-colors duration-300">Visión</Link></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors duration-300">Iniciar Sesión</Link></li>
              </ul>
            </div>
            
            {/* Información de contacto */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Contacto</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <FaUsers className="mr-3 text-blue-400" />
                  Soporte 24/7
                </li>
                <li className="flex items-center text-gray-300">
                  <FaGlobe className="mr-3 text-blue-400" />
                  www.sifo-ia.com
                </li>
                <li className="flex items-center text-gray-300">
                  <FaHandshake className="mr-3 text-blue-400" />
                  Demos personalizadas
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} SIFO-IA. Todos los derechos reservados. Hecho con ❤️ para el futuro de la contabilidad.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Términos</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
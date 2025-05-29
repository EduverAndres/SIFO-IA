// src/pages/AboutSIFO.jsx - Versión mejorada con diseño moderno y responsive
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBrain,
  FaCalculator,
  FaChartLine,
  FaLightbulb,
  FaShieldAlt,
  FaLaptopCode,
  FaDatabase,
  FaRocket,
  FaCog,
  FaUsers,
  FaGlobe,
  FaCloudUploadAlt,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaArrowRight,
  FaPlay,
  FaCheckCircle,
  FaAward,
  FaStar,
  FaQuoteLeft,
  FaBars,
  FaTimes,
  FaDownload,
  FaEye,
  FaHandshake,
  FaCode,
  FaMobile,
  FaLock,
  FaSync,
  FaClock,
  FaChevronDown,
  FaLinkedin,
  FaTwitter,
  FaGithub
} from 'react-icons/fa';

const AboutSIFO = () => {
  const [isVisible, setIsVisible] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % mainFeatures.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const mainFeatures = [
    {
      icon: FaBrain,
      title: "Inteligencia Artificial Avanzada",
      description: "Algoritmos de machine learning que aprenden de tus patrones contables para automatizar procesos y sugerir optimizaciones financieras.",
      benefits: ["Automatización inteligente", "Predicciones precisas", "Aprendizaje continuo", "Optimización de flujos"],
      color: "from-blue-500 to-cyan-600",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop"
    },
    {
      icon: FaDatabase,
      title: "Extracción Automática de Datos",
      description: "Tecnología OCR y NLP avanzada que captura información de facturas, recibos y documentos con precisión del 99.8%.",
      benefits: ["OCR de alta precisión", "Procesamiento multiidioma", "Validación automática", "Integración seamless"],
      color: "from-purple-500 to-pink-600",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
    },
    {
      icon: FaChartLine,
      title: "Análisis Predictivo",
      description: "Predicciones financieras inteligentes basadas en big data que te ayudan a planificar el futuro de tu empresa con confianza.",
      benefits: ["Forecasting avanzado", "Análisis de tendencias", "Alertas proactivas", "Insights accionables"],
      color: "from-green-500 to-emerald-600",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
    }
  ];

  const features = [
    {
      icon: FaCalculator,
      title: "Contabilidad Automatizada",
      description: "Simplifica tus registros contables con automatización inteligente que categoriza transacciones y genera asientos contables automáticamente.",
      stats: "95% menos errores manuales"
    },
    {
      icon: FaFileInvoiceDollar,
      title: "Facturación Electrónica",
      description: "Genera facturas electrónicas cumpliendo con la normativa DIAN, con envío automático y seguimiento en tiempo real.",
      stats: "100% cumplimiento DIAN"
    },
    {
      icon: FaShieldAlt,
      title: "Máxima Seguridad",
      description: "Protege tus datos financieros con encriptación de nivel bancario y cumplimiento de estándares internacionales.",
      stats: "Seguridad SOC 2 Type II"
    },
    {
      icon: FaLaptopCode,
      title: "Experiencia Superior",
      description: "Interfaz intuitiva diseñada pensando en el usuario, con workflows optimizados y navegación simplificada.",
      stats: "4.9/5 satisfacción usuario"
    },
    {
      icon: FaCloudUploadAlt,
      title: "Acceso en la Nube",
      description: "Disponible 24/7 desde cualquier dispositivo con sincronización en tiempo real y backups automáticos.",
      stats: "99.9% uptime garantizado"
    },
    {
      icon: FaCog,
      title: "Innovación Constante",
      description: "Actualizaciones regulares y nuevas funcionalidades que mantienen tu sistema siempre a la vanguardia tecnológica.",
      stats: "Actualizaciones mensuales"
    }
  ];

  const technologies = [
    { name: "React", description: "Frontend moderno", progress: 95 },
    { name: "Node.js", description: "Backend escalable", progress: 90 },
    { name: "TensorFlow", description: "Machine Learning", progress: 88 },
    { name: "PostgreSQL", description: "Base de datos", progress: 92 },
    { name: "Docker", description: "Containerización", progress: 85 },
    { name: "AWS", description: "Cloud computing", progress: 90 }
  ];

  const testimonials = [
    {
      name: "María Rodríguez",
      position: "CFO, InnovaTech",
      content: "SIFO-IA transformó completamente nuestra gestión contable. La precisión de la IA nos ha ahorrado más de 30 horas semanales y reducido errores en un 98%.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
      company: "InnovaTech Solutions"
    },
    {
      name: "Carlos Martínez",
      position: "CEO, StartupPlus",
      content: "La automatización de procesos y los insights predictivos nos ayudaron a identificar oportunidades de ahorro que no habríamos visto de otra manera.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      company: "StartupPlus Inc."
    },
    {
      name: "Ana García",
      position: "Contadora Senior, FinanceCorpn",
      content: "La interfaz es increíblemente intuitiva y la IA realmente entiende nuestras necesidades contables. Es como tener un asistente financiero experto 24/7.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      company: "FinanceCorp"
    }
  ];

  const integrations = [
    { name: "QuickBooks", logo: "📊" },
    { name: "SAP", logo: "🏢" },
    { name: "Oracle", logo: "🔶" },
    { name: "Microsoft", logo: "🪟" },
    { name: "Google", logo: "🔍" },
    { name: "AWS", logo: "☁️" }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans text-gray-900 overflow-hidden">
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
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg relative group"
            >
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/aboutsifo"
              className="text-blue-600 font-semibold text-lg border-b-2 border-blue-600 pb-1"
            >
              SIFO-IA
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
              Comenzar
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
                className="block text-blue-600 font-semibold py-2"
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
                Comenzar
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section 
        id="hero"
        data-animate
        className={`container mx-auto py-16 md:py-24 lg:py-32 px-4 md:px-8 text-center relative overflow-hidden transform transition-all duration-1000 ${
          isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft animation-delay-2000"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-800 leading-tight mb-8 tracking-tight">
            Descubre el Poder de{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 animate-gradient-shift">
              SIFO-IA
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-5xl mx-auto leading-relaxed mb-12">
            El software de contabilidad más avanzado del mercado, potenciado por inteligencia artificial de última generación, 
            diseñado para revolucionar la gestión financiera de tu negocio.
          </p>

          {/* Quick Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <FaCheckCircle className="text-green-500 mr-3 text-lg" />
              <span className="font-semibold">Implementación en 24h</span>
            </div>
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <FaCheckCircle className="text-green-500 mr-3 text-lg" />
              <span className="font-semibold">ROI del 340% primer año</span>
            </div>
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <FaCheckCircle className="text-green-500 mr-3 text-lg" />
              <span className="font-semibold">Soporte 24/7 incluido</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/login"
              className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg"
            >
              <FaRocket className="mr-3 group-hover:animate-bounce" />
              Comenzar Ahora
              <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <button className="group px-10 py-4 bg-white text-blue-600 font-bold rounded-full shadow-xl hover:shadow-2xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg">
              <FaPlay className="mr-3 group-hover:scale-110 transition-transform duration-300" />
              Ver Demo en Vivo
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <FaChevronDown className="text-2xl text-gray-400" />
        </div>
      </section>

      {/* Características Principales Interactivas */}
      <section 
        id="main-features"
        data-animate
        className={`py-16 md:py-24 bg-white transform transition-all duration-1000 delay-300 ${
          isVisible['main-features'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Tecnología que{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Marca la Diferencia
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Descubre las capacidades revolucionarias que hacen de SIFO-IA la solución contable más avanzada del mercado
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Feature Navigation */}
            <div className="space-y-4">
              {mainFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-500 transform ${
                      activeFeature === index
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 scale-105 shadow-xl'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:scale-102'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg flex-shrink-0 transform transition-transform duration-300 ${
                        activeFeature === index ? 'scale-110' : ''
                      }`}>
                        <IconComponent className="text-2xl text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                          activeFeature === index ? 'text-blue-600' : 'text-gray-800'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {feature.description}
                        </p>
                        {activeFeature === index && (
                          <div className="grid grid-cols-2 gap-2 animate-fade-in">
                            {feature.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center text-sm text-blue-600">
                                <FaCheckCircle className="mr-2 text-xs" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                      {mainFeatures[activeFeature].title}
                    </h3>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Dynamic content based on active feature */}
                  <div className="space-y-4">
                    {activeFeature === 0 && (
                      <>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm opacity-90">IA Processing</p>
                              <p className="text-lg font-bold">Analizando 1,247 transacciones</p>
                            </div>
                            <FaBrain className="text-2xl opacity-80 animate-pulse" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Precisión</p>
                            <p className="text-xl font-bold text-green-600">99.8%</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Velocidad</p>
                            <p className="text-xl font-bold text-blue-600">2.3s</p>
                          </div>
                        </div>
                      </>
                    )}
                    {activeFeature === 1 && (
                      <>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm opacity-90">OCR Engine</p>
                              <p className="text-lg font-bold">Procesando factura #4521</p>
                            </div>
                            <FaDatabase className="text-2xl opacity-80 animate-spin-slow" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">Fecha extraída</span>
                            <span className="text-sm font-bold text-green-600">✓ 2025-01-15</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">Monto detectado</span>
                            <span className="text-sm font-bold text-green-600">✓ $125,450</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">IVA calculado</span>
                            <span className="text-sm font-bold text-green-600">✓ $23,835</span>
                          </div>
                        </div>
                      </>
                    )}
                    {activeFeature === 2 && (
                      <>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm opacity-90">Predicción Q2 2025</p>
                              <p className="text-lg font-bold">Flujo de caja: +15%</p>
                            </div>
                            <FaChartLine className="text-2xl opacity-80" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <span className="text-sm">Ingresos proyectados</span>
                            <span className="text-sm font-bold text-green-600">↗ $2.4M</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                            <span className="text-sm">Riesgo de liquidez</span>
                            <span className="text-sm font-bold text-yellow-600">⚠ Bajo</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                            <span className="text-sm">Recomendación</span>
                            <span className="text-sm font-bold text-blue-600">💡 Invertir</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Feature indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {mainFeatures.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeFeature 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Características */}
      <section 
        id="features-grid"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 transform transition-all duration-1000 delay-500 ${
          isVisible['features-grid'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Características que Transforman tu Negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Cada funcionalidad ha sido diseñada para maximizar tu eficiencia y minimizar el tiempo dedicado a tareas repetitivas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 cursor-pointer border border-gray-100 hover:border-blue-200 relative overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {feature.stats}
                      </span>
                      <FaArrowRight className="text-blue-600 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tecnologías Stack */}
      <section 
        id="technologies"
        data-animate
        className={`py-16 md:py-24 bg-white transform transition-all duration-1000 delay-700 ${
          isVisible.technologies ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Construido con las{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Mejores Tecnologías
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Utilizamos un stack tecnológico de vanguardia para garantizar rendimiento, escalabilidad y seguridad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{tech.name}</h3>
                  <span className="text-sm text-gray-600">{tech.progress}%</span>
                </div>
                <p className="text-gray-600 mb-4">{tech.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${tech.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Integrations */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Integraciones Disponibles</h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {integrations.map((integration, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
                >
                  <span className="text-2xl">{integration.logo}</span>
                  <span className="font-semibold text-gray-800">{integration.name}</span>
                </div>
              ))}
            </div>
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
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white opacity-5 rounded-full"></div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Historias de Éxito Reales
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Descubre cómo empresas como la tuya han transformado su gestión financiera con SIFO-IA
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
              <FaQuoteLeft className="text-4xl text-blue-300 mb-8" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <p className="text-xl md:text-2xl leading-relaxed text-white/90 mb-8">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  
                  <div className="flex items-center justify-between">
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
                        <p className="text-blue-300 text-sm">
                          {testimonials[currentTestimonial].company}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <h4 className="text-lg font-bold text-white mb-4">Resultados Obtenidos</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Tiempo ahorrado</span>
                      <span className="font-bold text-white">30+ hrs/semana</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Reducción errores</span>
                      <span className="font-bold text-green-300">-98%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">ROI primer año</span>
                      <span className="font-bold text-yellow-300">+340%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Satisfacción</span>
                      <span className="font-bold text-pink-300">⭐ 5/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicadores de testimonial */}
              <div className="flex justify-center space-x-2 mt-8">
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

      {/* Estadísticas de Impacto */}
      <section 
        id="impact-stats"
        data-animate
        className={`py-16 md:py-24 bg-white transform transition-all duration-1000 delay-1100 ${
          isVisible['impact-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Impacto Medible en tu Negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Números reales que demuestran el valor de implementar SIFO-IA en tu empresa
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FaUsers className="text-2xl text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">Empresas Confiaron</div>
              <div className="text-sm text-green-600 font-semibold mt-1">+25% este año</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FaClock className="text-2xl text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">2.5M</div>
              <div className="text-gray-600 font-medium">Horas Ahorradas</div>
              <div className="text-sm text-green-600 font-semibold mt-1">Anualmente</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FaAward className="text-2xl text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">99.8%</div>
              <div className="text-gray-600 font-medium">Precisión IA</div>
              <div className="text-sm text-green-600 font-semibold mt-1">Certificada</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FaStar className="text-2xl text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">4.9/5</div>
              <div className="text-gray-600 font-medium">Satisfacción</div>
              <div className="text-sm text-green-600 font-semibold mt-1">+95% recomiendan</div>
            </div>
          </div>

          {/* ROI Calculator Preview */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 md:p-12 border border-blue-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Calcula tu ROI Potencial
              </h3>
              <p className="text-lg text-gray-600">
                Empresa típica de 50-100 empleados puede ahorrar:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$85,000</div>
                <div className="text-gray-800 font-semibold mb-2">Ahorro Anual</div>
                <div className="text-sm text-gray-600">En costos operativos y tiempo</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">40+</div>
                <div className="text-gray-800 font-semibold mb-2">Horas/Semana</div>
                <div className="text-sm text-gray-600">Liberadas para tareas estratégicas</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">6 meses</div>
                <div className="text-gray-800 font-semibold mb-2">Payback Period</div>
                <div className="text-sm text-gray-600">Recuperación de la inversión</div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <FaCalculator className="mr-3" />
                Calcular Mi ROI Personalizado
              </button>
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
              ¿Listo para Transformar tu{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Gestión Financiera?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Únete a miles de empresas que ya han revolucionado su contabilidad con SIFO-IA. 
              Comienza tu transformación digital hoy mismo.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-12">
              <Link
                to="/register"
                className="w-full sm:flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <FaRocket className="mr-3" />
                Comenzar Prueba Gratuita
              </Link>
              <button className="w-full sm:flex-1 px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <FaPlay className="mr-3" />
                Agendar Demo Personal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
              <div className="flex flex-col items-center">
                <FaCheckCircle className="text-2xl text-green-400 mb-2" />
                <span>Implementación en 24 horas</span>
              </div>
              <div className="flex flex-col items-center">
                <FaCheckCircle className="text-2xl text-green-400 mb-2" />
                <span>Soporte dedicado incluido</span>
              </div>
              <div className="flex flex-col items-center">
                <FaCheckCircle className="text-2xl text-green-400 mb-2" />
                <span>Sin compromisos a largo plazo</span>
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
                La plataforma de contabilidad más avanzada del mercado. Potenciada por inteligencia artificial 
                para automatizar, optimizar y revolucionar tu gestión financiera empresarial.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 p-2 bg-gray-800 rounded-full hover:bg-blue-600">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 p-2 bg-gray-800 rounded-full hover:bg-blue-600">
                  <FaTwitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 p-2 bg-gray-800 rounded-full hover:bg-blue-600">
                  <FaGithub className="text-xl" />
                </a>
              </div>
            </div>
            
            {/* Producto */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Producto</h3>
              <ul className="space-y-3">
                <li><Link to="/aboutsifo" className="text-gray-300 hover:text-white transition-colors duration-300">Características</Link></li>
                <li><Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300">Dashboard</Link></li>
                <li><Link to="/vision" className="text-gray-300 hover:text-white transition-colors duration-300">Roadmap</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">API</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Integraciones</a></li>
              </ul>
            </div>
            
            {/* Soporte */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Soporte</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Centro de Ayuda</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Documentación</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Tutoriales</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Webinars</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Contacto</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} SIFO-IA. Todos los derechos reservados. Innovando el futuro de la contabilidad.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Términos</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Cookies</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Seguridad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutSIFO;
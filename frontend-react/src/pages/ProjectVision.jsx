// src/pages/ProjectVision.jsx - Versión mejorada con diseño moderno y responsive
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEye,
  FaGlobe,
  FaLightbulb,
  FaUsersCog,
  FaHandshake,
  FaDatabase,
  FaRocket,
  FaBrain,
  FaChartLine,
  FaCog,
  FaShieldAlt,
  FaUsers,
  FaAward,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaCheckCircle,
  FaTimes,
  FaBars,
  FaQuoteLeft,
  FaCalendarAlt,
  FaFlag,
  FaBuilding,
  FaIndustry,
  FaUniversity,
  FaHeart,
  FaCode,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';

const ProjectVision = () => {
  const [isVisible, setIsVisible] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [currentYear] = useState(new Date().getFullYear());

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

  // Auto-rotate roadmap phases
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhase(prev => (prev + 1) % roadmapPhases.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const visionPillars = [
    {
      icon: FaEye,
      title: "Software Contable Líder con IA",
      subtitle: "Liderazgo Global",
      description: "Consolidar SIFO-IA como la plataforma contable de referencia a nivel global, reconocida por su robustez, capacidad de adaptación y integración superior de inteligencia artificial.",
      details: [
        "Reconocimiento internacional como líder en innovación contable",
        "Presencia en más de 50 países para 2030",
        "Certificaciones ISO y SOC 2 Type II",
        "Partnerships estratégicos con las Big Four"
      ],
      color: "from-blue-500 to-cyan-600",
      impact: "Transformar la industria contable global",
      timeline: "2025-2030"
    },
    {
      icon: FaDatabase,
      title: "Procesos de Extracción sin Fallos",
      subtitle: "Precisión Absoluta",
      description: "Perfeccionar nuestros algoritmos de IA para ofrecer una precisión del 100% en la extracción, clasificación y análisis de datos financieros, eliminando completamente la entrada manual.",
      details: [
        "Precisión del 99.99% en extracción de datos",
        "Procesamiento multiidioma y multiformato",
        "Validación automática con blockchain",
        "Zero-touch data processing"
      ],
      color: "from-purple-500 to-pink-600",
      impact: "Eliminar errores humanos en contabilidad",
      timeline: "2025-2027"
    },
    {
      icon: FaGlobe,
      title: "Ecosistema Financiero Global",
      subtitle: "Conectividad Universal",
      description: "Desarrollar una red interconectada de servicios financieros donde SIFO-IA sea el hub central, facilitando la colaboración entre empresas, contadores y entidades bancarias mundialmente.",
      details: [
        "API abierta para 1000+ integraciones",
        "Red de partners certificados global",
        "Marketplace de apps financieras",
        "Colaboración en tiempo real multiplataforma"
      ],
      color: "from-green-500 to-emerald-600",
      impact: "Crear el estándar de conectividad financiera",
      timeline: "2026-2035"
    },
    {
      icon: FaUsersCog,
      title: "Experiencia Totalmente Personalizable",
      subtitle: "Adaptabilidad Inteligente",
      description: "Ofrecer una plataforma que se adapte de forma inteligente y dinámica a las necesidades únicas de cada usuario y empresa, desde configuración de reportes hasta automatización de flujos específicos.",
      details: [
        "IA que aprende patrones de uso individuales",
        "Interfaces adaptativas por rol y preferencias",
        "Workflows personalizables sin código",
        "Recomendaciones proactivas contextuales"
      ],
      color: "from-red-500 to-orange-600",
      impact: "Democratizar la contabilidad avanzada",
      timeline: "2025-2028"
    },
    {
      icon: FaHandshake,
      title: "Impulsor de Decisiones Estratégicas",
      subtitle: "Inteligencia Accionable",
      description: "Transformar los datos contables en inteligencia accionable, permitiendo a nuestros usuarios tomar decisiones financieras más informadas, rápidas y estratégicas para impulsar crecimiento sostenible.",
      details: [
        "Análisis predictivo con 95% de precisión",
        "Simulaciones de escenarios en tiempo real",
        "Alertas proactivas de oportunidades",
        "Dashboard ejecutivo con insights automáticos"
      ],
      color: "from-indigo-500 to-blue-600",
      impact: "Empoderar decisiones basadas en datos",
      timeline: "2025-2029"
    },
    {
      icon: FaLightbulb,
      title: "Vanguardia Tecnológica Constante",
      subtitle: "Innovación Perpetua",
      description: "Mantenernos a la vanguardia de tecnologías emergentes (IA, Blockchain, Big Data, IoT), integrándolas para asegurar que SIFO-IA siempre ofrezca las soluciones más avanzadas del mercado.",
      details: [
        "Inversión del 25% de ingresos en I+D",
        "Laboratorio de innovación permanente",
        "Colaboración con universidades líderes",
        "Early adoption de tecnologías emergentes"
      ],
      color: "from-yellow-500 to-amber-600",
      impact: "Definir el futuro de la tecnología contable",
      timeline: "Continuo 2025+"
    }
  ];

  const roadmapPhases = [
    {
      phase: "Fase 1",
      year: "2025",
      title: "Fundación Sólida",
      description: "Establecer las bases tecnológicas y de mercado",
      milestones: [
        "Lanzamiento oficial de SIFO-IA",
        "10,000 empresas adoptando la plataforma",
        "Integración con principales ERPs",
        "Certificación SOC 2 Type II"
      ],
      color: "from-blue-500 to-cyan-600",
      status: "En Progreso"
    },
    {
      phase: "Fase 2",
      year: "2026-2027",
      title: "Expansión Internacional",
      description: "Escalamiento global y perfeccionamiento de IA",
      milestones: [
        "Presencia en 15 países",
        "IA con 99.9% de precisión",
        "50,000+ empresas activas",
        "Partnerships con Big Four"
      ],
      color: "from-green-500 to-emerald-600",
      status: "Planificado"
    },
    {
      phase: "Fase 3",
      year: "2028-2030",
      title: "Liderazgo de Mercado",
      description: "Consolidación como líder global indiscutible",
      milestones: [
        "Presencia en 35+ países",
        "500,000+ empresas en la plataforma",
        "Ecosystem de 1000+ integraciones",
        "IPO exitosa en NASDAQ"
      ],
      color: "from-purple-500 to-pink-600",
      status: "Visión"
    },
    {
      phase: "Fase 4",
      year: "2031-2035",
      title: "Transformación Total",
      description: "Redefinir completamente la industria contable",
      milestones: [
        "Hub financiero global dominante",
        "IA que predice tendencias económicas",
        "1M+ empresas conectadas",
        "Estándar mundial de facto"
      ],
      color: "from-indigo-500 to-purple-600",
      status: "Aspiracional"
    }
  ];

  const impactMetrics = [
    {
      metric: "10M+",
      description: "Empresas Transformadas",
      icon: FaBuilding,
      year: "2035"
    },
    {
      metric: "$50B+",
      description: "Valor Económico Creado",
      icon: FaChartLine,
      year: "2035"
    },
    {
      metric: "100M+",
      description: "Horas Ahorradas Anualmente",
      icon: FaCog,
      year: "2035"
    },
    {
      metric: "50+",
      description: "Países con Presencia",
      icon: FaGlobe,
      year: "2030"
    }
  ];

  const testimonialVision = {
    quote: "SIFO-IA no es solo una herramienta, es el futuro de cómo entendemos y gestionamos las finanzas empresariales. Estamos construyendo el sistema nervioso financiero del mundo.",
    author: "Equipo Fundador SIFO-IA",
    role: "Visionarios Tecnológicos"
  };

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
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300 ease-in-out text-lg relative group"
            >
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
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
              className="text-blue-600 font-semibold text-lg border-b-2 border-blue-600 pb-1"
            >
              Visión del Proyecto
            </Link>
            <Link
              to="/login"
              className="ml-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105"
            >
              Unirse a la Visión
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
                className="block text-blue-600 font-semibold py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Visión del Proyecto
              </Link>
              <Link
                to="/login"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Unirse a la Visión
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft animation-delay-4000"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-semibold mb-6 border border-blue-200">
              <FaRocket className="inline mr-2" />
              Construyendo el Futuro de la Contabilidad
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-800 leading-tight mb-8 tracking-tight">
            Nuestra{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 animate-gradient-shift">
              Visión a Futuro
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-5xl mx-auto leading-relaxed mb-12">
            En SIFO-IA, no solo desarrollamos software. Estamos <strong>redefiniendo el futuro</strong> de la gestión contable y financiera 
            global, creando el ecosistema que transformará cómo las empresas entienden y manejan sus finanzas.
          </p>

          {/* Timeline Preview */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-blue-100">
              <FaCalendarAlt className="text-blue-500 mr-3" />
              <span className="font-semibold">Horizonte 2025-2035</span>
            </div>
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-green-100">
              <FaFlag className="text-green-500 mr-3" />
              <span className="font-semibold">6 Pilares Estratégicos</span>
            </div>
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-purple-100">
              <FaGlobe className="text-purple-500 mr-3" />
              <span className="font-semibold">Impacto Global</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/aboutsifo"
              className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg"
            >
              <FaEye className="mr-3 group-hover:scale-110 transition-transform duration-300" />
              Explorar la Visión
              <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <button className="group px-10 py-4 bg-white text-blue-600 font-bold rounded-full shadow-xl hover:shadow-2xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg">
              <FaPlay className="mr-3 group-hover:scale-110 transition-transform duration-300" />
              Ver Roadmap Completo
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <FaChevronDown className="text-2xl text-gray-400" />
        </div>
      </section>

      {/* Vision Statement */}
      <section 
        id="vision-statement"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden transform transition-all duration-1000 delay-300 ${
          isVisible['vision-statement'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 -mt-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mb-48"></div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <FaQuoteLeft className="text-4xl md:text-5xl text-blue-300 mx-auto mb-8 opacity-50" />
            
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-8">
              "{testimonialVision.quote}"
            </blockquote>
            
            <cite className="text-lg md:text-xl font-semibold text-blue-200 block mb-2">
              — {testimonialVision.author}
            </cite>
            <span className="text-blue-300">{testimonialVision.role}</span>
          </div>
        </div>
      </section>

      {/* Pilares de la Visión */}
      <section 
        id="vision-pillars"
        data-animate
        className={`py-16 md:py-24 bg-white transform transition-all duration-1000 delay-500 ${
          isVisible['vision-pillars'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Los{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                6 Pilares
              </span>{' '}
              de Nuestra Visión
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Cada pilar representa un compromiso fundamental con la transformación de la industria contable y financiera
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {visionPillars.map((pillar, index) => {
              const IconComponent = pillar.icon;
              const isExpanded = expandedPillar === index;
              
              return (
                <div
                  key={index}
                  className={`group bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-blue-200 ${
                    isExpanded ? 'ring-2 ring-blue-500 shadow-2xl' : ''
                  }`}
                  onClick={() => setExpandedPillar(isExpanded ? null : index)}
                >
                  {/* Header del Pilar */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${pillar.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="text-2xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                          {pillar.title}
                        </h3>
                        <p className="text-sm font-semibold text-blue-600">{pillar.subtitle}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                      {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </button>
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                    {pillar.description}
                  </p>

                  {/* Timeline e Impacto */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                      <FaCalendarAlt className="text-blue-500 mr-2 text-sm" />
                      <span className="text-sm font-medium text-blue-700">{pillar.timeline}</span>
                    </div>
                    <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                      <FaFlag className="text-green-500 mr-2 text-sm" />
                      <span className="text-sm font-medium text-green-700">{pillar.impact}</span>
                    </div>
                  </div>

                  {/* Detalles Expandibles */}
                  {isExpanded && (
                    <div className="animate-fade-in border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Objetivos Específicos:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pillar.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Indicador de Expansión */}
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                      {isExpanded ? 'Ver menos detalles' : 'Ver más detalles'}
                    </span>
                    <FaArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roadmap Interactivo */}
      <section 
        id="roadmap"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 transform transition-all duration-1000 delay-700 ${
          isVisible.roadmap ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Roadmap de{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Transformación
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Nuestro plan estratégico para revolucionar la industria contable en la próxima década
            </p>
          </div>

          {/* Timeline Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {roadmapPhases.map((phase, index) => (
              <button
                key={index}
                onClick={() => setActivePhase(index)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform ${
                  activePhase === index
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-700 shadow-lg hover:shadow-xl hover:scale-102'
                }`}
              >
                {phase.phase} - {phase.year}
              </button>
            ))}
          </div>

          {/* Active Phase Display */}
          <div className="max-w-4xl mx-auto">
            <div className={`bg-gradient-to-r ${roadmapPhases[activePhase].color} rounded-3xl p-8 md:p-12 text-white shadow-2xl transform hover:scale-105 transition-all duration-500`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-2">
                    {roadmapPhases[activePhase].title}
                  </h3>
                  <p className="text-xl opacity-90">{roadmapPhases[activePhase].year}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="font-semibold">{roadmapPhases[activePhase].status}</span>
                </div>
              </div>
              
              <p className="text-xl leading-relaxed mb-8 opacity-90">
                {roadmapPhases[activePhase].description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-bold mb-4">Hitos Principales:</h4>
                  <div className="space-y-3">
                    {roadmapPhases[activePhase].milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <FaCheckCircle className="text-white/80 mt-1 flex-shrink-0" />
                        <span className="leading-relaxed">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h4 className="text-lg font-bold mb-4">Métricas Objetivo</h4>
                  <div className="space-y-3">
                    {activePhase === 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Empresas activas</span>
                          <span className="font-bold">10,000+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Países presentes</span>
                          <span className="font-bold">5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precisión IA</span>
                          <span className="font-bold">99.5%</span>
                        </div>
                      </>
                    )}
                    {activePhase === 1 && (
                      <>
                        <div className="flex justify-between">
                          <span>Empresas activas</span>
                          <span className="font-bold">50,000+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Países presentes</span>
                          <span className="font-bold">15</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precisión IA</span>
                          <span className="font-bold">99.9%</span>
                        </div>
                      </>
                    )}
                    {activePhase === 2 && (
                      <>
                        <div className="flex justify-between">
                          <span>Empresas activas</span>
                          <span className="font-bold">500,000+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Países presentes</span>
                          <span className="font-bold">35+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Share</span>
                          <span className="font-bold">25%</span>
                        </div>
                      </>
                    )}
                    {activePhase === 3 && (
                      <>
                        <div className="flex justify-between">
                          <span>Empresas activas</span>
                          <span className="font-bold">1M+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Países presentes</span>
                          <span className="font-bold">50+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Leadership</span>
                          <span className="font-bold">#1 Global</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Phase Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {roadmapPhases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhase(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activePhase 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Métricas de Impacto Proyectadas */}
      <section 
        id="impact-metrics"
        data-animate
        className={`py-16 md:py-24 bg-white transform transition-all duration-1000 delay-900 ${
          isVisible['impact-metrics'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Impacto{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Global Proyectado
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Las métricas que demuestran el alcance transformador de nuestra visión
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {impactMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={index}
                  className="text-center group bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="text-2xl text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {metric.metric}
                  </div>
                  <div className="text-gray-600 font-medium mb-2">{metric.description}</div>
                  <div className="text-sm text-blue-600 font-semibold">
                    Meta {metric.year}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Proyección de Crecimiento */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 md:p-12 border border-blue-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Trayectoria de Crecimiento
              </h3>
              <p className="text-lg text-gray-600">
                Evolución proyectada de adopción y impacto ({currentYear}-2035)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Fase Inicial</div>
                <div className="text-4xl font-bold text-gray-800 mb-2">2025-2027</div>
                <div className="text-gray-600 mb-4">Establecimiento y validación</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Adopción</span>
                    <span className="font-bold text-green-600">Exponencial</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Geografía</span>
                    <span className="font-bold text-blue-600">Regional</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">Fase Expansión</div>
                <div className="text-4xl font-bold text-gray-800 mb-2">2028-2032</div>
                <div className="text-gray-600 mb-4">Escalamiento global</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Adopción</span>
                    <span className="font-bold text-green-600">Masiva</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Geografía</span>
                    <span className="font-bold text-blue-600">Global</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">Fase Dominio</div>
                <div className="text-4xl font-bold text-gray-800 mb-2">2033-2035</div>
                <div className="text-gray-600 mb-4">Liderazgo indiscutible</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Adopción</span>
                    <span className="font-bold text-green-600">Universal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posición</span>
                    <span className="font-bold text-blue-600">Estándar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Llamada a la Acción de Visión */}
      <section 
        id="vision-cta"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden transform transition-all duration-1000 delay-1100 ${
          isVisible['vision-cta'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Sé Parte de la{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Revolución Contable
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Esta visión no es solo nuestra. Es el futuro que construiremos juntos. 
              Únete a nosotros para redefinir la industria contable y crear un impacto que trascienda generaciones.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-3xl mx-auto mb-16">
              <Link
                to="/register"
                className="w-full sm:flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <FaRocket className="mr-3" />
                Únete a la Visión
              </Link>
              <Link
                to="/nosotros"
                className="w-full sm:flex-1 px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <FaUsers className="mr-3" />
                Conoce al Equipo
              </Link>
              <Link
                to="/aboutsifo"
                className="w-full sm:flex-1 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center justify-center border border-white/30"
              >
                <FaEye className="mr-3" />
                Ver el Producto
              </Link>
            </div>

            {/* Estadísticas de Compromiso */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
              <div className="flex flex-col items-center">
                <FaHeart className="text-3xl text-red-400 mb-4" />
                <div className="text-2xl font-bold text-white mb-1">10+ años</div>
                <div>Compromiso a largo plazo</div>
              </div>
              <div className="flex flex-col items-center">
                <FaAward className="text-3xl text-yellow-400 mb-4" />
                <div className="text-2xl font-bold text-white mb-1">$100M+</div>
                <div>Inversión en I+D proyectada</div>
              </div>
              <div className="flex flex-col items-center">
                <FaGlobe className="text-3xl text-green-400 mb-4" />
                <div className="text-2xl font-bold text-white mb-1">Global</div>
                <div>Alcance e impacto mundial</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Información de la empresa */}
            <div className="lg:col-span-2">
              <Link to="/" className="text-3xl font-bold text-white mb-4 block">
                <span className="text-blue-400">SIFO</span>-IA
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                Construyendo el futuro de la contabilidad empresarial. Nuestra visión trasciende el software tradicional 
                para crear un ecosistema que transforme completamente la gestión financiera global.
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
            
            {/* Visión */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Nuestra Visión</h3>
              <ul className="space-y-3">
                <li><Link to="/vision" className="text-gray-300 hover:text-white transition-colors duration-300">Pilares Estratégicos</Link></li>
                <li><a href="#roadmap" className="text-gray-300 hover:text-white transition-colors duration-300">Roadmap 2025-2035</a></li>
                <li><a href="#impact-metrics" className="text-gray-300 hover:text-white transition-colors duration-300">Impacto Global</a></li>
                <li><Link to="/aboutsifo" className="text-gray-300 hover:text-white transition-colors duration-300">Producto</Link></li>
              </ul>
            </div>
            
            {/* Únete */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Únete a Nosotros</h3>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-gray-300 hover:text-white transition-colors duration-300">Ser Parte de la Visión</Link></li>
                <li><Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors duration-300">Conocer al Equipo</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Carreras</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Inversores</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} SIFO-IA. Todos los derechos reservados. Construyendo el futuro de la contabilidad.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Términos</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Visión</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectVision;
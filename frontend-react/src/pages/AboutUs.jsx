// src/pages/AboutUs.jsx - Versión mejorada con diseño moderno y responsive
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaLightbulb,
  FaRocket,
  FaHandshake,
  FaBrain,
  FaDatabase,
  FaEye,
  FaShieldAlt,
  FaUsers,
  FaAward,
  FaHeart,
  FaCode,
  FaChartLine,
  FaGlobe,
  FaCog,
  FaArrowRight,
  FaQuoteLeft,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaEnvelope
} from 'react-icons/fa';

const AboutUs = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Detectar cuando los elementos entran al viewport
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

    // Observar todos los elementos con data-animate
    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const valores = [
    {
      icon: FaLightbulb,
      title: "Innovación Constante",
      description: "Siempre a la vanguardia tecnológica, desarrollando soluciones que anticipan las necesidades del futuro.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      icon: FaShieldAlt,
      title: "Integridad y Transparencia",
      description: "Construimos relaciones basadas en la confianza, honestidad y comunicación clara con nuestros clientes.",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: FaUsers,
      title: "Orientación al Cliente",
      description: "Cada decisión que tomamos tiene como centro el éxito y la satisfacción de nuestros usuarios.",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: FaAward,
      title: "Excelencia y Precisión",
      description: "No nos conformamos con lo bueno, buscamos la perfección en cada línea de código y cada funcionalidad.",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: FaHeart,
      title: "Pasión por la Calidad",
      description: "Amamos lo que hacemos y eso se refleja en cada proyecto que entregamos a nuestros clientes.",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: FaHandshake,
      title: "Colaboración y Crecimiento",
      description: "Creemos en el poder del trabajo en equipo y en el crecimiento mutuo con nuestros clientes y partners.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    }
  ];

  const estadisticas = [
    { numero: "2025", etiqueta: "Año de Fundación", icono: FaRocket },
    { numero: "100%", etiqueta: "Satisfacción Cliente", icono: FaHeart },
    { numero: "24/7", etiqueta: "Soporte Técnico", icono: FaCog },
    { numero: "∞", etiqueta: "Innovación", icono: FaLightbulb }
  ];

  const equipo = [
    {
      nombre: "Ana García",
      posicion: "CEO & Fundadora",
      descripcion: "Visionaria en tecnología financiera con más de 15 años de experiencia.",
      imagen: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face",
      redes: { linkedin: "#", twitter: "#", email: "ana@sifo-ia.com" }
    },
    {
      nombre: "Carlos Martínez",
      posicion: "CTO",
      descripcion: "Experto en IA y arquitectura de software, impulsor de nuestras soluciones técnicas.",
      imagen: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      redes: { linkedin: "#", github: "#", email: "carlos@sifo-ia.com" }
    },
    {
      nombre: "María Rodríguez",
      posicion: "Head of Product",
      descripcion: "Especialista en UX/UI con pasión por crear experiencias de usuario excepcionales.",
      imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      redes: { linkedin: "#", twitter: "#", email: "maria@sifo-ia.com" }
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg px-4 md:px-8 h-20 flex items-center sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between h-full">
          <Link to="/" className="text-3xl font-extrabold text-blue-700 tracking-tight hover:scale-105 transition-transform duration-300">
            <span className="text-indigo-600">SIFO</span>-IA
          </Link>
          <nav className="hidden md:flex space-x-8 items-center h-full">
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
              className="text-blue-600 font-semibold text-lg border-b-2 border-blue-600 pb-1"
            >
              Nosotros
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
              Login
            </Link>
          </nav>
          
          {/* Menú móvil */}
          <div className="md:hidden">
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full text-sm hover:bg-blue-700 transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="hero"
        data-animate
        className={`container mx-auto py-16 md:py-24 px-4 md:px-8 text-center transform transition-all duration-1000 ${
          isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-800 leading-tight mb-6 tracking-tight">
            Conoce la Visión Detrás de{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 animate-gradient-shift">
              SIFO-IA
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-12">
            Somos un equipo apasionado por la innovación y la eficiencia, construyendo el futuro de la contabilidad con inteligencia artificial.
          </p>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-12">
            {estadisticas.map((stat, index) => {
              const IconComponent = stat.icono;
              return (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <IconComponent className="text-2xl md:text-3xl text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{stat.numero}</div>
                  <div className="text-sm md:text-base text-gray-600">{stat.etiqueta}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores */}
      <section 
        id="mission-vision"
        data-animate
        className={`py-16 md:py-24 transform transition-all duration-1000 delay-300 ${
          isVisible['mission-vision'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-16">
            {/* Misión */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="text-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRocket className="text-5xl md:text-6xl mx-auto" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Nuestra Misión</h3>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed text-center">
                Democratizar el acceso a herramientas contables de alta tecnología, permitiendo a empresas de todos los tamaños optimizar sus operaciones financieras y enfocarse en el crecimiento estratégico.
              </p>
            </div>

            {/* Visión */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="text-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaLightbulb className="text-5xl md:text-6xl mx-auto" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Nuestra Visión</h3>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed text-center mb-6">
                Ser el software contable líder a nivel global, reconocido por su innovación impulsada por la Inteligencia Artificial y su contribución al éxito empresarial.
              </p>
              <Link
                to="/vision"
                className="inline-flex items-center justify-center w-full px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-600 hover:text-white font-semibold transition-all duration-300 group"
              >
                <FaEye className="mr-2 group-hover:scale-110 transition-transform duration-300" /> 
                Explora nuestra Visión del Proyecto
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* Valores */}
          <div id="valores" data-animate className={`transform transition-all duration-1000 delay-500 ${
            isVisible.valores ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">Nuestros Valores</h3>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Los principios que guían cada decisión y cada línea de código que escribimos
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {valores.map((valor, index) => {
                const IconComponent = valor.icon;
                return (
                  <div
                    key={index}
                    className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer"
                  >
                    <div className={`${valor.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`text-2xl ${valor.color}`} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">{valor.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{valor.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Sección sobre IA y Tecnología */}
      <section 
        id="technology"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden transform transition-all duration-1000 delay-700 ${
          isVisible.technology ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mt-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mb-48"></div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">La IA en el Corazón de SIFO-IA</h2>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
                Nuestra plataforma va más allá de la contabilidad tradicional. Hemos integrado inteligencia artificial avanzada para transformar cómo gestionas tus finanzas.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-4 rounded-2xl flex-shrink-0">
                    <FaBrain className="text-3xl md:text-4xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-3">Análisis Predictivo Avanzado</h3>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      Nuestra IA analiza patrones históricos para predecir flujos de caja, identificar riesgos financieros y sugerir oportunidades de inversión antes de que se materialicen.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-4 rounded-2xl flex-shrink-0">
                    <FaDatabase className="text-3xl md:text-4xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-3">Extracción Inteligente de Datos</h3>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      Automatizamos la captura de información de documentos complejos con precisión del 99.8%, eliminando errores manuales y acelerando procesos contables.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-4 rounded-2xl flex-shrink-0">
                    <FaChartLine className="text-3xl md:text-4xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-3">Insights Automatizados</h3>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      Generamos reportes inteligentes que no solo muestran datos, sino que explican tendencias y sugieren acciones específicas para optimizar tu gestión financiera.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12">
                  <div className="text-center">
                    <FaCode className="text-6xl md:text-8xl text-white mb-6 mx-auto opacity-80" />
                    <h4 className="text-2xl md:text-3xl font-bold mb-4">Tecnología de Vanguardia</h4>
                    <p className="text-lg text-blue-100 mb-6">
                      Utilizamos las tecnologías más avanzadas en machine learning, procesamiento de lenguaje natural y visión computacional.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">TensorFlow</span>
                      <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">Python</span>
                      <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">React</span>
                      <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">Node.js</span>
                      <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">PostgreSQL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section 
        id="team"
        data-animate
        className={`py-16 md:py-24 transform transition-all duration-1000 delay-900 ${
          isVisible.team ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Conoce a Nuestro Equipo</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profesionales apasionados trabajando juntos para revolucionar la contabilidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {equipo.map((miembro, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  <img 
                    src={miembro.imagen} 
                    alt={miembro.nombre}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{miembro.nombre}</h3>
                  <p className="text-blue-600 font-semibold mb-4">{miembro.posicion}</p>
                  <p className="text-gray-600 leading-relaxed mb-6">{miembro.descripcion}</p>
                  
                  <div className="flex space-x-4">
                    {miembro.redes.linkedin && (
                      <a href={miembro.redes.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                        <FaLinkedin className="text-xl" />
                      </a>
                    )}
                    {miembro.redes.twitter && (
                      <a href={miembro.redes.twitter} className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                        <FaTwitter className="text-xl" />
                      </a>
                    )}
                    {miembro.redes.github && (
                      <a href={miembro.redes.github} className="text-gray-400 hover:text-gray-800 transition-colors duration-300">
                        <FaGithub className="text-xl" />
                      </a>
                    )}
                    {miembro.redes.email && (
                      <a href={`mailto:${miembro.redes.email}`} className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                        <FaEnvelope className="text-xl" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <FaQuoteLeft className="text-4xl md:text-5xl text-blue-600 mx-auto mb-8 opacity-50" />
            <blockquote className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed mb-8">
              "En SIFO-IA no solo desarrollamos software, creamos el futuro de la gestión financiera empresarial."
            </blockquote>
            <cite className="text-lg font-semibold text-blue-600">— Equipo SIFO-IA</cite>
          </div>
        </div>
      </section>

      {/* Llamada a la acción final */}
      <section 
        id="cta"
        data-animate
        className={`py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white transform transition-all duration-1000 delay-1100 ${
          isVisible.cta ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Quieres saber más sobre nosotros?</h2>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
            Descubre cómo podemos ayudarte a transformar la gestión financiera de tu empresa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Link
              to="/aboutsifo"
              className="flex-1 px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <FaGlobe className="mr-2" />
              Nuestras Soluciones
            </Link>
            <Link
              to="/vision"
              className="flex-1 px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600 transition duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <FaEye className="mr-2" />
              Visión del Proyecto
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="text-2xl font-bold text-white mb-4 block">
                <span className="text-blue-400">SIFO</span>-IA
              </Link>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Revolucionando la contabilidad empresarial con inteligencia artificial y tecnología de vanguardia.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <FaTwitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <FaGithub className="text-xl" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white transition-colors duration-300">Inicio</Link></li>
                <li><Link to="/aboutsifo" className="text-gray-300 hover:text-white transition-colors duration-300">SIFO-IA</Link></li>
                <li><Link to="/vision" className="text-gray-300 hover:text-white transition-colors duration-300">Visión</Link></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors duration-300">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <FaEnvelope className="mr-2 text-sm" />
                  info@sifo-ia.com
                </li>
                <li className="flex items-center text-gray-300">
                  <FaGlobe className="mr-2 text-sm" />
                  www.sifo-ia.com
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} SIFO-IA. Todos los derechos reservados. Hecho con ❤️ para revolucionar la contabilidad.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
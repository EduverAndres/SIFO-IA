import React, { useEffect, useState, useRef } from 'react';
import { FaTimes, FaExpand, FaCompress, FaGripVertical, FaExclamationTriangle } from 'react-icons/fa';

const Modal = ({
  isOpen,
  show, // Compatibilidad con ambas props
  onClose,
  title,
  subtitle,
  children,
  size = 'xl', // Por defecto más grande
  maxWidth = 'xl', // Compatibilidad adicional
  showCloseButton = true,
  closeOnOverlayClick = true,
  closable = true, // Compatibilidad adicional
  className = '',
  variant = 'default', // default, success, warning, error, info
  animation = 'scale', // scale, slide, fade, bounce
  backdrop = 'blur', // blur, dark, gradient
  draggable = false,
  resizable = false,
  fullscreenToggle = false,
  headerGradient = false,
  glassmorphism = false,
  loading = false,
  autoFocus = true,
  ...props
}) => {
  // Estados locales
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const modalRef = useRef(null);
  const headerRef = useRef(null);

  // Normalizar la prop de visibilidad
  const shouldShow = isOpen || show;

  // Manejar animaciones de entrada/salida
  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    } else if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShow, isVisible]);

  // Manejar tecla Escape y eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'Escape':
          if (closable && !isDragging) {
            onClose?.();
          }
          break;
        case 'F11':
          if (fullscreenToggle) {
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
          }
          break;
        default:
          break;
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      // Auto focus en el modal
      if (autoFocus && modalRef.current) {
        modalRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose, closable, isDragging, isFullscreen, fullscreenToggle, autoFocus]);

  // Sistema de arrastre
  useEffect(() => {
    if (!draggable || !isDragging) return;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, draggable]);

  if (!isVisible) return null;

  // 🎨 Variantes de colores
  const variants = {
    default: {
      border: 'border-slate-200',
      header: 'from-slate-50 to-white',
      headerText: 'text-slate-900',
      accent: 'blue'
    },
    success: {
      border: 'border-emerald-200',
      header: 'from-emerald-50 to-white',
      headerText: 'text-emerald-900',
      accent: 'emerald'
    },
    warning: {
      border: 'border-amber-200',
      header: 'from-amber-50 to-white',
      headerText: 'text-amber-900',
      accent: 'amber'
    },
    error: {
      border: 'border-red-200',
      header: 'from-red-50 to-white',
      headerText: 'text-red-900',
      accent: 'red'
    },
    info: {
      border: 'border-blue-200',
      header: 'from-blue-50 to-white',
      headerText: 'text-blue-900',
      accent: 'blue'
    }
  };

  // 📏 Mapear tamaños - TAMAÑOS GRANDES POR DEFECTO
  const sizeClasses = {
    sm: 'max-w-2xl',      // Era md - ahora más grande
    md: 'max-w-4xl',      // Era lg - mucho más grande
    lg: 'max-w-5xl',      // Era 2xl - muy grande
    xl: 'max-w-6xl',      // Era 4xl - extra grande
    '2xl': 'max-w-7xl',   // Era 6xl - súper grande
    '3xl': 'max-w-[90vw]', // Nuevo - casi pantalla completa
    '4xl': 'max-w-[95vw]', // Nuevo - pantalla completa con margen
    full: 'max-w-full'     // Pantalla completa
  };

  // 🎭 Animaciones de entrada
  const animations = {
    scale: shouldShow && !isAnimating 
      ? 'animate-scale-in opacity-100' 
      : 'scale-95 opacity-0',
    slide: shouldShow && !isAnimating 
      ? 'animate-fade-in-down opacity-100' 
      : 'transform -translate-y-full opacity-0',
    fade: shouldShow && !isAnimating 
      ? 'animate-fade-in opacity-100' 
      : 'opacity-0',
    bounce: shouldShow && !isAnimating 
      ? 'animate-bounce-in opacity-100' 
      : 'scale-50 opacity-0'
  };

  // 🌫️ Tipos de backdrop
  const backdrops = {
    blur: 'bg-black/60 backdrop-blur-lg',
    dark: 'bg-black/80',
    gradient: 'bg-gradient-to-br from-black/60 via-blue-900/20 to-purple-900/30 backdrop-blur-sm'
  };

  // Determinar clases
  const currentVariant = variants[variant];
  const sizeClass = isFullscreen ? 'max-w-full h-full' : (sizeClasses[size] || sizeClasses[maxWidth] || sizeClasses.xl);
  const animationClass = animations[animation];
  const backdropClass = backdrops[backdrop];

  // Handlers
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && closable && e.target === e.currentTarget && !isDragging) {
      onClose?.();
    }
  };

  const handleMouseDown = (e) => {
    if (!draggable || !headerRef.current) return;
    
    const rect = headerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setPosition({ x: 0, y: 0 }); // Reset position en fullscreen
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay mejorado con efectos */}
      <div 
        className={`
          flex items-center justify-center min-h-screen p-2 sm:p-4 lg:p-6 text-center
          transition-all duration-300 ease-out
          ${backdropClass}
        `}
        onClick={handleOverlayClick}
      >
        {/* Elementos decorativos del backdrop */}
        {backdrop === 'gradient' && (
          <>
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </>
        )}

        {/* Modal panel GRANDE Y RESPONSIVE */}
        <div 
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative inline-block text-left overflow-hidden 
            transform transition-all duration-300 ease-out
            w-full
            ${isFullscreen 
              ? 'h-full rounded-none' 
              : `${sizeClass} rounded-2xl max-h-[95vh]`
            }
            ${glassmorphism 
              ? 'bg-white/90 backdrop-blur-xl border border-white/20' 
              : 'bg-white border'
            }
            ${currentVariant.border}
            ${isFullscreen ? 'shadow-none' : 'shadow-2xl'}
            ${animationClass}
            focus:outline-none focus:ring-4 focus:ring-blue-500/20
          `}
          style={{
            transform: draggable && !isFullscreen 
              ? `translate(${position.x}px, ${position.y}px)` 
              : undefined,
            cursor: isDragging ? 'grabbing' : 'default',
            minHeight: isFullscreen ? '100vh' : '500px' // Altura mínima más grande
          }}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {/* Header con efectos mejorados */}
          {(title || showCloseButton || fullscreenToggle || draggable) && (
            <div 
              ref={headerRef}
              className={`
                relative px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 pb-4 sm:pb-6 
                ${headerGradient 
                  ? `bg-gradient-to-r ${currentVariant.header}` 
                  : 'bg-slate-50/50'
                }
                ${!isFullscreen ? 'border-b border-slate-200/60' : ''}
                ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
                transition-all duration-200
              `}
              onMouseDown={handleMouseDown}
            >
              {/* Efecto de brillo en header */}
              {headerGradient && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Indicador de arrastre */}
                  {draggable && (
                    <FaGripVertical className="text-slate-400 text-sm" />
                  )}
                  
                  {/* Título y subtítulo */}
                  <div>
                    {title && (
                      <h3 
                        className={`
                          text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight
                          ${currentVariant.headerText}
                        `}
                        id="modal-title"
                      >
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Botones de control */}
                <div className="flex items-center space-x-2">
                  {/* Botón fullscreen */}
                  {fullscreenToggle && (
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-2 sm:p-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-all duration-200"
                      title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    >
                      {isFullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                  )}

                  {/* Botón cerrar */}
                  {showCloseButton && closable && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={`
                        p-2 sm:p-3 rounded-xl transition-all duration-200
                        text-slate-400 hover:text-slate-600
                        bg-white/60 hover:bg-white/80
                        border border-slate-200/60 hover:border-slate-300
                        shadow-sm hover:shadow-md
                        transform hover:scale-105 active:scale-95
                        focus:outline-none focus:ring-2 focus:ring-${currentVariant.accent}-500
                      `}
                    >
                      <span className="sr-only">Cerrar</span>
                      <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-600 font-medium">Cargando...</p>
              </div>
            </div>
          )}

          {/* Contenido principal CON MÁS ESPACIO */}
          <div className={`
            relative px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10
            ${isFullscreen 
              ? 'h-full overflow-y-auto' 
              : 'max-h-[calc(95vh-180px)] overflow-y-auto'
            }
            ${glassmorphism ? 'bg-transparent' : 'bg-white'}
          `}>
            {/* Scroll indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            
            <div className="space-y-6 sm:space-y-8">
              {children}
            </div>
          </div>

          {/* Resize handle (esquina inferior derecha) */}
          {resizable && !isFullscreen && (
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
              <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-slate-400 opacity-50"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🎨 Componentes especializados con tamaños grandes
export const ConfirmModal = ({ onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", ...props }) => (
  <Modal variant="warning" size="md" {...props}>
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
        <FaExclamationTriangle className="h-6 w-6 text-amber-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-900">
          {props.title || "¿Estás seguro?"}
        </h3>
        <p className="text-sm text-slate-500">
          Esta acción no se puede deshacer.
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </Modal>
);

export const SuccessModal = (props) => (
  <Modal variant="success" animation="bounce" size="lg" {...props} />
);

export const ErrorModal = (props) => (
  <Modal variant="error" animation="slide" size="lg" {...props} />
);

export const FullscreenModal = (props) => (
  <Modal 
    size="3xl" 
    fullscreenToggle 
    draggable 
    headerGradient 
    backdrop="gradient"
    {...props} 
  />
);

export const GlassModal = (props) => (
  <Modal 
    glassmorphism 
    backdrop="blur" 
    headerGradient 
    animation="scale"
    size="2xl"
    {...props} 
  />
);

// Modal grande para formularios
export const FormModal = (props) => (
  <Modal 
    size="xl"
    headerGradient
    backdrop="blur"
    {...props} 
  />
);

// Modal extra grande para tablas y listados
export const TableModal = (props) => (
  <Modal 
    size="3xl"
    fullscreenToggle
    backdrop="gradient"
    {...props} 
  />
);

export default Modal;
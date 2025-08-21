import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Button = ({ 
  children, 
  onClick, 
  className = '', 
  icon: Icon,
  disabled = false,
  loading = false,
  type = 'button',
  variant = 'primary', // primary, secondary, success, danger, warning, info, ghost, outline
  size = 'md', // xs, sm, md, lg, xl
  fullWidth = false,
  rounded = 'md', // none, sm, md, lg, xl, full
  shadow = true,
  gradient = false,
  pulse = false,
  glow = false,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // 🎨 Variantes de colores
  const variants = {
    primary: gradient
      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent hover:from-blue-600 hover:to-indigo-700 focus:from-blue-600 focus:to-indigo-700'
      : 'bg-blue-600 text-white border-transparent hover:bg-blue-700 focus:bg-blue-700',
    
    secondary: gradient
      ? 'bg-gradient-to-r from-gray-500 to-slate-600 text-white border-transparent hover:from-gray-600 hover:to-slate-700 focus:from-gray-600 focus:to-slate-700'
      : 'bg-gray-600 text-white border-transparent hover:bg-gray-700 focus:bg-gray-700',
    
    success: gradient
      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent hover:from-green-600 hover:to-emerald-700 focus:from-green-600 focus:to-emerald-700'
      : 'bg-green-600 text-white border-transparent hover:bg-green-700 focus:bg-green-700',
    
    danger: gradient
      ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-transparent hover:from-red-600 hover:to-rose-700 focus:from-red-600 focus:to-rose-700'
      : 'bg-red-600 text-white border-transparent hover:bg-red-700 focus:bg-red-700',
    
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-transparent hover:from-yellow-600 hover:to-orange-700 focus:from-yellow-600 focus:to-orange-700'
      : 'bg-yellow-500 text-white border-transparent hover:bg-yellow-600 focus:bg-yellow-600',
    
    info: gradient
      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent hover:from-cyan-600 hover:to-blue-700 focus:from-cyan-600 focus:to-blue-700'
      : 'bg-cyan-500 text-white border-transparent hover:bg-cyan-600 focus:bg-cyan-600',
    
    ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:bg-gray-100 hover:text-gray-900 focus:text-gray-900',
    
    outline: 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 focus:bg-blue-50 hover:border-blue-700 focus:border-blue-700'
  };

  // 📏 Tamaños
  const sizes = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[56px]'
  };

  // 🔄 Bordes redondeados
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // ✨ Efectos de sombra
  const shadowStyles = shadow 
    ? 'shadow-lg hover:shadow-xl transition-shadow duration-300' 
    : '';

  // 🌟 Efecto de brillo (glow)
  const glowStyles = glow 
    ? 'shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300' 
    : '';

  // 💫 Efecto pulse
  const pulseStyles = pulse 
    ? 'animate-pulse' 
    : '';

  // 🎯 Clases base del botón
  const baseClasses = `
    relative
    inline-flex
    items-center
    justify-center
    font-medium
    border
    transition-all
    duration-200
    ease-in-out
    focus:outline-none
    focus:ring-4
    focus:ring-opacity-50
    active:scale-95
    select-none
    overflow-hidden
    ${variants[variant]}
    ${sizes[size]}
    ${roundedStyles[rounded]}
    ${shadowStyles}
    ${glowStyles}
    ${pulseStyles}
    ${fullWidth ? 'w-full' : ''}
    ${isDisabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : 'hover:scale-105 cursor-pointer'}
    ${variant === 'primary' ? 'focus:ring-blue-300' : ''}
    ${variant === 'success' ? 'focus:ring-green-300' : ''}
    ${variant === 'danger' ? 'focus:ring-red-300' : ''}
    ${variant === 'warning' ? 'focus:ring-yellow-300' : ''}
    ${variant === 'info' ? 'focus:ring-cyan-300' : ''}
    ${variant === 'secondary' ? 'focus:ring-gray-300' : ''}
    ${variant === 'ghost' ? 'focus:ring-gray-300' : ''}
    ${variant === 'outline' ? 'focus:ring-blue-300' : ''}
    group
  `;

  return (
    <button
      type={type}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {/* Efecto de ondas en hover */}
      <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-inherit"></span>
      
      {/* Efecto de brillo */}
      {gradient && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out rounded-inherit"></span>
      )}
      
      {/* Contenido del botón */}
      <span className="relative flex items-center justify-center space-x-2">
        {/* Spinner de carga o icono */}
        {loading ? (
          <FaSpinner className={`animate-spin ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}`} />
        ) : Icon ? (
          <Icon className={`
            transition-transform duration-200 group-hover:scale-110
            ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}
          `} />
        ) : null}
        
        {/* Texto del botón */}
        <span className="font-semibold tracking-wide">
          {children}
        </span>
      </span>
    </button>
  );
};

// 🎨 Componentes de botón especializados para uso común
export const PrimaryButton = (props) => (
  <Button variant="primary" gradient shadow {...props} />
);

export const SecondaryButton = (props) => (
  <Button variant="secondary" {...props} />
);

export const SuccessButton = (props) => (
  <Button variant="success" gradient shadow {...props} />
);

export const DangerButton = (props) => (
  <Button variant="danger" gradient shadow {...props} />
);

export const WarningButton = (props) => (
  <Button variant="warning" gradient shadow {...props} />
);

export const InfoButton = (props) => (
  <Button variant="info" gradient shadow {...props} />
);

export const GhostButton = (props) => (
  <Button variant="ghost" {...props} />
);

export const OutlineButton = (props) => (
  <Button variant="outline" {...props} />
);

// 🌟 Botón con efectos especiales
export const GlowButton = (props) => (
  <Button variant="primary" gradient shadow glow {...props} />
);

export const PulseButton = (props) => (
  <Button variant="success" gradient shadow pulse {...props} />
);

// 📱 Botones responsive para móviles
export const MobileButton = (props) => (
  <Button 
    size="lg" 
    fullWidth 
    rounded="lg" 
    gradient 
    shadow 
    className="sm:w-auto sm:size-md" 
    {...props} 
  />
);

// 🎯 Botón de acción flotante (FAB)
export const FloatingActionButton = ({ icon: Icon, ...props }) => (
  <Button
    variant="primary"
    size="lg"
    rounded="full"
    shadow
    glow
    className="fixed bottom-6 right-6 z-50 w-14 h-14 p-0"
    icon={Icon}
    {...props}
  />
);

// 🔗 Grupo de botones
export const ButtonGroup = ({ children, className = '', orientation = 'horizontal' }) => {
  const orientationClasses = {
    horizontal: 'flex-row space-x-0',
    vertical: 'flex-col space-y-0'
  };

  return (
    <div className={`
      inline-flex 
      ${orientationClasses[orientation]}
      rounded-lg 
      overflow-hidden 
      shadow-lg 
      border 
      border-gray-200
      ${className}
    `}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: `
              ${child.props.className || ''}
              ${orientation === 'horizontal' ? 'rounded-none border-r border-gray-200 last:border-r-0' : 'rounded-none border-b border-gray-200 last:border-b-0'}
              ${index === 0 && orientation === 'horizontal' ? 'rounded-l-lg' : ''}
              ${index === React.Children.count(children) - 1 && orientation === 'horizontal' ? 'rounded-r-lg' : ''}
              ${index === 0 && orientation === 'vertical' ? 'rounded-t-lg' : ''}
              ${index === React.Children.count(children) - 1 && orientation === 'vertical' ? 'rounded-b-lg' : ''}
              shadow-none
            `,
            shadow: false
          });
        }
        return child;
      })}
    </div>
  );
};

export default Button;
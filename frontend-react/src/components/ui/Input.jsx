import React, { useState, useRef, useEffect } from 'react';
import { 
  FaEye, 
  FaEyeSlash, 
  FaCheck, 
  FaExclamationTriangle, 
  FaSpinner,
  FaSearch,
  FaTimes
} from 'react-icons/fa';

const Input = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  className = '',
  type = 'text',
  variant = 'default', // default, success, error, warning, info
  size = 'md', // sm, md, lg, xl
  disabled = false,
  required = false,
  loading = false,
  clearable = false,
  searchable = false,
  floating = false,
  helperText,
  errorText,
  successText,
  maxLength,
  showCounter = false,
  autoFocus = false,
  autoComplete = 'off',
  pattern,
  validation,
  debounceMs = 0,
  onFocus,
  onBlur,
  onClear,
  onSearch,
  gradient = false,
  glow = false,
  rounded = 'lg', // sm, md, lg, xl, full
  ...props
}) => {
  // Estados locales
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [localValue, setLocalValue] = useState(value || '');
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  const inputRef = useRef(null);
  
  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sincronizar valor externo
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Validación en tiempo real
  useEffect(() => {
    if (validation && localValue) {
      const result = validation(localValue);
      setIsValid(result);
    } else if (pattern && localValue) {
      const regex = new RegExp(pattern);
      setIsValid(regex.test(localValue));
    } else {
      setIsValid(null);
    }
  }, [localValue, validation, pattern]);

  // 🎨 Variantes de colores
  const variants = {
    default: {
      border: isFocused 
        ? 'border-blue-500 ring-4 ring-blue-100' 
        : 'border-gray-300 hover:border-gray-400',
      bg: 'bg-white',
      text: 'text-gray-900',
      placeholder: 'placeholder-gray-400'
    },
    success: {
      border: 'border-green-500 ring-4 ring-green-100',
      bg: 'bg-green-50',
      text: 'text-green-900',
      placeholder: 'placeholder-green-400'
    },
    error: {
      border: 'border-red-500 ring-4 ring-red-100',
      bg: 'bg-red-50',
      text: 'text-red-900',
      placeholder: 'placeholder-red-400'
    },
    warning: {
      border: 'border-yellow-500 ring-4 ring-yellow-100',
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      placeholder: 'placeholder-yellow-400'
    },
    info: {
      border: 'border-cyan-500 ring-4 ring-cyan-100',
      bg: 'bg-cyan-50',
      text: 'text-cyan-900',
      placeholder: 'placeholder-cyan-400'
    }
  };

  // 📏 Tamaños
  const sizes = {
    sm: {
      input: 'px-3 py-2 text-sm min-h-[36px]',
      icon: 'text-sm',
      label: 'text-xs',
      helper: 'text-xs'
    },
    md: {
      input: 'px-4 py-3 text-base min-h-[44px]',
      icon: 'text-base',
      label: 'text-sm',
      helper: 'text-sm'
    },
    lg: {
      input: 'px-5 py-4 text-lg min-h-[52px]',
      icon: 'text-lg',
      label: 'text-base',
      helper: 'text-sm'
    },
    xl: {
      input: 'px-6 py-5 text-xl min-h-[60px]',
      icon: 'text-xl',
      label: 'text-lg',
      helper: 'text-base'
    }
  };

  // 🔄 Bordes redondeados
  const roundedStyles = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Determinar variante actual
  const currentVariant = errorText ? 'error' 
    : successText ? 'success' 
    : isValid === false ? 'error'
    : isValid === true ? 'success'
    : variant;

  // Manejar cambios con debounce
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        onChange?.(e);
      }, debounceMs);
      setDebounceTimer(timer);
    } else {
      onChange?.(e);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    const syntheticEvent = {
      target: { value: '' }
    };
    setLocalValue('');
    onChange?.(syntheticEvent);
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSearch = () => {
    onSearch?.(localValue);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Calcular padding para iconos
  const leftPadding = Icon ? 'pl-12' : sizes[size].input.includes('px-3') ? 'pl-3' : 
                     sizes[size].input.includes('px-4') ? 'pl-4' : 
                     sizes[size].input.includes('px-5') ? 'pl-5' : 'pl-6';
  
  const rightPadding = (type === 'password' || clearable || searchable || loading || isValid !== null) 
    ? 'pr-12' : sizes[size].input.includes('px-3') ? 'pr-3' : 
      sizes[size].input.includes('px-4') ? 'pr-4' : 
      sizes[size].input.includes('px-5') ? 'pr-5' : 'pr-6';

  // Calcular clases del input
  const inputClasses = `
    w-full
    transition-all
    duration-300
    ease-in-out
    outline-none
    ${variants[currentVariant].bg}
    ${variants[currentVariant].text}
    ${variants[currentVariant].placeholder}
    ${variants[currentVariant].border}
    ${sizes[size].input.replace(/px-\d+/, '')}
    ${Icon ? leftPadding : sizes[size].input.match(/px-\d+/)?.[0] || 'px-4'}
    ${rightPadding}
    ${roundedStyles[rounded]}
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-text'}
    ${gradient ? 'bg-gradient-to-r from-white to-gray-50' : ''}
    ${glow && isFocused ? 'shadow-2xl shadow-blue-500/25' : 'shadow-sm'}
    ${floating && (isFocused || localValue) ? 'pt-6 pb-2' : ''}
    group-hover:shadow-md
    transform
    ${isFocused ? 'scale-[1.02]' : 'scale-100'}
  `;

  // Obtener el tipo de input real
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`group space-y-2 ${className}`}>
      {/* Label */}
      {label && !floating && (
        <label 
          className={`
            block font-semibold transition-colors duration-200
            ${sizes[size].label}
            ${currentVariant === 'error' ? 'text-red-600' : 
              currentVariant === 'success' ? 'text-green-600' :
              currentVariant === 'warning' ? 'text-yellow-600' :
              currentVariant === 'info' ? 'text-cyan-600' : 'text-gray-700'}
            ${isFocused ? 'text-blue-600' : ''}
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Floating Label */}
        {floating && label && (
          <label 
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${(isFocused || localValue) 
                ? `top-2 ${sizes[size].helper} text-blue-600 font-medium` 
                : `top-1/2 -translate-y-1/2 ${sizes[size].label} text-gray-400`
              }
              ${Icon && !(isFocused || localValue) ? 'left-12' : 'left-4'}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Left Icon */}
        {Icon && (
          <div className={`
            absolute left-4 top-1/2 transform -translate-y-1/2 
            transition-colors duration-200 pointer-events-none
            ${sizes[size].icon}
            ${currentVariant === 'error' ? 'text-red-500' : 
              currentVariant === 'success' ? 'text-green-500' :
              currentVariant === 'warning' ? 'text-yellow-500' :
              currentVariant === 'info' ? 'text-cyan-500' : 
              isFocused ? 'text-blue-500' : 'text-gray-400'}
          `}>
            <Icon />
          </div>
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          type={inputType}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={floating ? '' : placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          pattern={pattern}
          className={inputClasses}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Loading Spinner */}
          {loading && (
            <FaSpinner className={`animate-spin text-blue-500 ${sizes[size].icon}`} />
          )}

          {/* Validation Icon */}
          {!loading && isValid === true && (
            <FaCheck className={`text-green-500 ${sizes[size].icon} animate-fade-in`} />
          )}
          
          {!loading && isValid === false && (
            <FaExclamationTriangle className={`text-red-500 ${sizes[size].icon} animate-fade-in`} />
          )}

          {/* Clear Button */}
          {!loading && clearable && localValue && (
            <button
              type="button"
              onClick={handleClear}
              className={`
                text-gray-400 hover:text-gray-600 transition-colors duration-200
                ${sizes[size].icon}
              `}
            >
              <FaTimes />
            </button>
          )}

          {/* Search Button */}
          {!loading && searchable && (
            <button
              type="button"
              onClick={handleSearch}
              className={`
                text-gray-400 hover:text-blue-500 transition-colors duration-200
                ${sizes[size].icon}
              `}
            >
              <FaSearch />
            </button>
          )}

          {/* Password Toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={`
                text-gray-400 hover:text-gray-600 transition-colors duration-200
                ${sizes[size].icon}
              `}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          )}
        </div>

        {/* Progress Bar for Loading */}
        {loading && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full loading-shimmer"></div>
          </div>
        )}
      </div>

      {/* Helper Text / Counter */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Error Text */}
          {errorText && (
            <p className={`${sizes[size].helper} text-red-600 flex items-center space-x-1 animate-fade-in`}>
              <FaExclamationTriangle className="flex-shrink-0" />
              <span>{errorText}</span>
            </p>
          )}

          {/* Success Text */}
          {!errorText && successText && (
            <p className={`${sizes[size].helper} text-green-600 flex items-center space-x-1 animate-fade-in`}>
              <FaCheck className="flex-shrink-0" />
              <span>{successText}</span>
            </p>
          )}

          {/* Helper Text */}
          {!errorText && !successText && helperText && (
            <p className={`${sizes[size].helper} text-gray-500`}>
              {helperText}
            </p>
          )}
        </div>

        {/* Character Counter */}
        {showCounter && maxLength && (
          <div className={`
            ${sizes[size].helper} text-gray-400 ml-4 tabular-nums
            ${localValue.length > maxLength * 0.9 ? 'text-yellow-500' : ''}
            ${localValue.length >= maxLength ? 'text-red-500 font-semibold' : ''}
          `}>
            {localValue.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

// 🎨 Componentes especializados para casos comunes
export const SearchInput = (props) => (
  <Input 
    searchable 
    clearable 
    icon={FaSearch} 
    placeholder="Buscar..." 
    {...props} 
  />
);

export const PasswordInput = (props) => (
  <Input 
    type="password" 
    {...props} 
  />
);

export const EmailInput = (props) => (
  <Input 
    type="email" 
    autoComplete="email"
    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
    {...props} 
  />
);

export const PhoneInput = (props) => (
  <Input 
    type="tel" 
    autoComplete="tel"
    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
    placeholder="123-456-7890"
    {...props} 
  />
);

export const NumberInput = (props) => (
  <Input 
    type="number" 
    {...props} 
  />
);

export const FloatingInput = (props) => (
  <Input 
    floating 
    {...props} 
  />
);

export const GradientInput = (props) => (
  <Input 
    gradient 
    glow 
    rounded="xl" 
    {...props} 
  />
);

export default Input;
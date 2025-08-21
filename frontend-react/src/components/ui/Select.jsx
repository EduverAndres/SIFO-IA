import React, { useState, useRef, useEffect } from 'react';
import { 
  FaChevronDown, 
  FaCheck, 
  FaExclamationTriangle, 
  FaSpinner,
  FaSearch,
  FaTimes
} from 'react-icons/fa';

const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Seleccionar...",
  icon: Icon,
  className = '',
  variant = 'default', // default, success, error, warning, info
  size = 'md', // sm, md, lg, xl
  disabled = false,
  required = false,
  loading = false,
  clearable = false,
  searchable = false,
  multiple = false,
  floating = false,
  helperText,
  errorText,
  successText,
  autoFocus = false,
  validation,
  onFocus,
  onBlur,
  onClear,
  onSearch,
  gradient = false,
  glow = false,
  rounded = 'lg', // sm, md, lg, xl, full
  customOption, // Función para renderizar opciones personalizadas
  groupBy, // Campo para agrupar opciones
  filterFunction, // Función de filtrado personalizada
  ...props
}) => {
  // Estados locales
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isValid, setIsValid] = useState(null);
  
  const selectRef = useRef(null);
  const optionsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Auto focus
  useEffect(() => {
    if (autoFocus && selectRef.current) {
      selectRef.current.focus();
    }
  }, [autoFocus]);

  // Validación
  useEffect(() => {
    if (validation && value) {
      const result = validation(value);
      setIsValid(result);
    } else {
      setIsValid(null);
    }
  }, [value, validation]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      const filteredOptions = getFilteredOptions();
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, highlightedIndex]);

  // 🎨 Variantes de colores
  const variants = {
    default: {
      border: isFocused 
        ? 'border-blue-500 ring-4 ring-blue-100' 
        : 'border-gray-300 hover:border-gray-400',
      bg: 'bg-white',
      text: 'text-gray-900',
      placeholder: 'text-gray-400'
    },
    success: {
      border: 'border-green-500 ring-4 ring-green-100',
      bg: 'bg-green-50',
      text: 'text-green-900',
      placeholder: 'text-green-400'
    },
    error: {
      border: 'border-red-500 ring-4 ring-red-100',
      bg: 'bg-red-50',
      text: 'text-red-900',
      placeholder: 'text-red-400'
    },
    warning: {
      border: 'border-yellow-500 ring-4 ring-yellow-100',
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      placeholder: 'text-yellow-400'
    },
    info: {
      border: 'border-cyan-500 ring-4 ring-cyan-100',
      bg: 'bg-cyan-50',
      text: 'text-cyan-900',
      placeholder: 'text-cyan-400'
    }
  };

  // 📏 Tamaños
  const sizes = {
    sm: {
      select: 'px-3 py-2 text-sm min-h-[36px]',
      icon: 'text-sm',
      label: 'text-xs',
      helper: 'text-xs',
      option: 'px-3 py-2 text-sm'
    },
    md: {
      select: 'px-4 py-3 text-base min-h-[44px]',
      icon: 'text-base',
      label: 'text-sm',
      helper: 'text-sm',
      option: 'px-4 py-3 text-base'
    },
    lg: {
      select: 'px-5 py-4 text-lg min-h-[52px]',
      icon: 'text-lg',
      label: 'text-base',
      helper: 'text-sm',
      option: 'px-5 py-4 text-lg'
    },
    xl: {
      select: 'px-6 py-5 text-xl min-h-[60px]',
      icon: 'text-xl',
      label: 'text-lg',
      helper: 'text-base',
      option: 'px-6 py-5 text-xl'
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

  // Filtrar opciones
  const getFilteredOptions = () => {
    if (!searchable || !searchTerm) return options;
    
    if (filterFunction) {
      return options.filter(option => filterFunction(option, searchTerm));
    }
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Agrupar opciones
  const getGroupedOptions = () => {
    const filteredOptions = getFilteredOptions();
    
    if (!groupBy) return { '': filteredOptions };
    
    return filteredOptions.reduce((groups, option) => {
      const group = option[groupBy] || 'Otros';
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
      return groups;
    }, {});
  };

  // Obtener valor mostrado
  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option ? option.label : value[0];
      }
      return `${value.length} elementos seleccionados`;
    }
    
    const option = options.find(opt => opt.value === value);
    return option ? option.label : (value || placeholder);
  };

  // Manejar selección de opción
  const handleOptionSelect = (option) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(option.value);
      
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(option.value);
      }
      
      const syntheticEvent = { target: { value: newValue } };
      onChange?.(syntheticEvent);
    } else {
      const syntheticEvent = { target: { value: option.value } };
      onChange?.(syntheticEvent);
      setIsOpen(false);
      setSearchTerm('');
    }
    
    setHighlightedIndex(-1);
  };

  // Manejar apertura/cierre
  const handleToggle = () => {
    if (disabled || loading) return;
    
    setIsOpen(!isOpen);
    setSearchTerm('');
    setHighlightedIndex(-1);
    
    if (!isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  // Manejar focus/blur
  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Limpiar selección
  const handleClear = () => {
    const syntheticEvent = { target: { value: multiple ? [] : '' } };
    onChange?.(syntheticEvent);
    onClear?.();
  };

  // Clases del select
  const selectClasses = `
    relative w-full cursor-pointer transition-all duration-300 ease-in-out
    outline-none flex items-center justify-between
    ${variants[currentVariant].bg}
    ${variants[currentVariant].text}
    ${variants[currentVariant].border}
    ${sizes[size].select}
    ${roundedStyles[rounded]}
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
    ${gradient ? 'bg-gradient-to-r from-white to-gray-50' : ''}
    ${glow && isFocused ? 'shadow-2xl shadow-blue-500/25' : 'shadow-sm'}
    ${floating && (isFocused || value) ? 'pt-6 pb-2' : ''}
    group-hover:shadow-md
    transform
    ${isFocused ? 'scale-[1.02]' : 'scale-100'}
  `;

  // Verificar si una opción está seleccionada
  const isOptionSelected = (option) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(option.value);
    }
    return value === option.value;
  };

  return (
    <div ref={selectRef} className={`group relative space-y-2 ${className}`}>
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

      {/* Select Container */}
      <div className="relative">
        {/* Floating Label */}
        {floating && label && (
          <label 
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none z-10
              ${(isFocused || value) 
                ? `top-2 ${sizes[size].helper} text-blue-600 font-medium` 
                : `top-1/2 -translate-y-1/2 ${sizes[size].label} text-gray-400`
              }
              ${Icon && !(isFocused || value) ? 'left-12' : 'left-4'}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Left Icon */}
        {Icon && (
          <div className={`
            absolute left-4 top-1/2 transform -translate-y-1/2 z-10
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

        {/* Select Field */}
        <div
          onClick={handleToggle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={disabled ? -1 : 0}
          className={selectClasses}
          style={{
            paddingLeft: Icon ? '3rem' : undefined,
            paddingRight: '3rem'
          }}
          {...props}
        >
          {/* Contenido del select */}
          <span className={`
            truncate flex-1 
            ${!value || (multiple && Array.isArray(value) && value.length === 0) 
              ? variants[currentVariant].placeholder 
              : variants[currentVariant].text
            }
            ${floating ? 'pt-2' : ''}
          `}>
            {getDisplayValue()}
          </span>

          {/* Iconos del lado derecho */}
          <div className="flex items-center space-x-2">
            {/* Loading Spinner */}
            {loading && (
              <FaSpinner className={`animate-spin text-blue-500 ${sizes[size].icon}`} />
            )}

            {/* Validation Icon */}
            {!loading && isValid === true && (
              <FaCheck className={`text-green-500 ${sizes[size].icon}`} />
            )}
            
            {!loading && isValid === false && (
              <FaExclamationTriangle className={`text-red-500 ${sizes[size].icon}`} />
            )}

            {/* Clear Button */}
            {!loading && clearable && value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className={`
                  text-gray-400 hover:text-gray-600 transition-colors duration-200
                  ${sizes[size].icon}
                `}
              >
                <FaTimes />
              </button>
            )}

            {/* Dropdown Arrow */}
            <FaChevronDown 
              className={`
                transition-transform duration-200 text-gray-400
                ${sizes[size].icon}
                ${isOpen ? 'transform rotate-180' : ''}
              `} 
            />
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div 
            ref={optionsRef}
            className={`
              absolute top-full left-0 right-0 z-50 mt-1
              bg-white border border-gray-200 ${roundedStyles[rounded]}
              shadow-xl max-h-60 overflow-y-auto
              animate-fade-in-down
            `}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="py-1">
              {Object.entries(getGroupedOptions()).map(([groupName, groupOptions]) => (
                <div key={groupName}>
                  {/* Group Header */}
                  {groupBy && groupName && (
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                      {groupName}
                    </div>
                  )}
                  
                  {/* Group Options */}
                  {groupOptions.map((option, index) => {
                    const globalIndex = Object.values(getGroupedOptions())
                      .flat()
                      .findIndex(opt => opt.value === option.value);
                    
                    return (
                      <div
                        key={option.value}
                        onClick={() => handleOptionSelect(option)}
                        className={`
                          cursor-pointer transition-colors duration-150 flex items-center justify-between
                          ${sizes[size].option}
                          ${globalIndex === highlightedIndex 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'hover:bg-gray-50'
                          }
                          ${isOptionSelected(option) 
                            ? 'bg-blue-100 text-blue-800 font-medium' 
                            : 'text-gray-700'
                          }
                        `}
                      >
                        {/* Custom Option Renderer */}
                        {customOption ? (
                          customOption(option, isOptionSelected(option))
                        ) : (
                          <>
                            <span className="truncate">{option.label}</span>
                            {isOptionSelected(option) && (
                              <FaCheck className="text-blue-600 text-sm ml-2 flex-shrink-0" />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* No options found */}
              {getFilteredOptions().length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="text-sm">No se encontraron opciones</p>
                  {searchTerm && (
                    <p className="text-xs text-gray-400 mt-1">
                      para "{searchTerm}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text / Error */}
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

        {/* Selection Counter para multiple */}
        {multiple && Array.isArray(value) && value.length > 0 && (
          <div className={`
            ${sizes[size].helper} text-gray-400 ml-4 tabular-nums
            ${value.length > 10 ? 'text-yellow-500' : ''}
            ${value.length > 20 ? 'text-red-500 font-semibold' : ''}
          `}>
            {value.length} / {options.length}
          </div>
        )}
      </div>
    </div>
  );
};

// 🎨 Componentes especializados
export const CountrySelect = ({ countries, ...props }) => (
  <Select 
    searchable
    options={countries}
    placeholder="Seleccionar país..."
    {...props} 
  />
);

export const MultiSelect = (props) => (
  <Select 
    multiple 
    clearable 
    searchable 
    {...props} 
  />
);

export const GroupedSelect = ({ groupBy, ...props }) => (
  <Select 
    groupBy={groupBy}
    searchable
    {...props} 
  />
);

export const AsyncSelect = ({ loadOptions, ...props }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loadOptions) {
      setLoading(true);
      loadOptions().then(setOptions).finally(() => setLoading(false));
    }
  }, [loadOptions]);

  return (
    <Select 
      options={options} 
      loading={loading} 
      searchable 
      {...props} 
    />
  );
};

export const FloatingSelect = (props) => (
  <Select 
    floating 
    {...props} 
  />
);

export const GradientSelect = (props) => (
  <Select 
    gradient 
    glow 
    rounded="xl" 
    {...props} 
  />
);

export default Select;
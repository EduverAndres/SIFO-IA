// src/components/puc/CreateCuentaModal.jsx
import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaTimes,
  FaCode,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaEye,
  FaSearch,
  FaArrowRight,
  FaShieldAlt,
  FaRocket,
  FaWizardHat,
  FaThumbsUp,
  FaChevronRight,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaCopy,
  FaHistory,
  FaGraduationCap
} from 'react-icons/fa';
import Modal from '../Modal';
import Button from '../Button';

const CreateCuentaModal = ({ isOpen, onClose, onSubmit, codigoPadre = '', existingCodes = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo_cuenta: 'AUXILIAR',
    naturaleza: 'DEBITO',
    estado: 'ACTIVA',
    codigo_padre: codigoPadre,
    acepta_movimientos: true,
    requiere_tercero: false,
    requiere_centro_costo: false,
    dinamica: '',
    es_cuenta_niif: false,
    codigo_niif: '',
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [codigoInfo, setCodigoInfo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [smartTips, setSmartTips] = useState([]);
  const [showSmartAssistant, setShowSmartAssistant] = useState(true);
  const [codigoExists, setCodigoExists] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Base de datos enriquecida de sugerencias por clase
  const claseSuggestions = {
    '1': {
      nombre: 'ACTIVOS',
      descripcion: 'Recursos controlados por la empresa',
      naturaleza: 'DEBITO',
      emoji: '💰',
      ejemplos: [
        { codigo: '1105', nombre: 'Caja', descripcion: 'Dinero en efectivo' },
        { codigo: '1110', nombre: 'Bancos', descripcion: 'Cuentas bancarias' },
        { codigo: '1205', nombre: 'Inversiones', descripcion: 'Inversiones temporales' },
        { codigo: '1305', nombre: 'Clientes', descripcion: 'Cuentas por cobrar' }
      ],
      dinamica: 'Se DEBITA cuando aumenta el activo (entrada de recursos), se ACREDITA cuando disminuye (salida de recursos)',
      consejos: ['Generalmente requieren tercero', 'Importante para el control de inventarios', 'Base del balance general']
    },
    '2': {
      nombre: 'PASIVOS',
      descripcion: 'Obligaciones de la empresa',
      naturaleza: 'CREDITO',
      emoji: '📋',
      ejemplos: [
        { codigo: '2105', nombre: 'Proveedores', descripcion: 'Cuentas por pagar' },
        { codigo: '2205', nombre: 'Préstamos bancarios', descripcion: 'Obligaciones financieras' },
        { codigo: '2365', nombre: 'Retenciones', descripcion: 'Retenciones por pagar' }
      ],
      dinamica: 'Se ACREDITA cuando aumenta la obligación (contraer deudas), se DEBITA cuando disminuye (pagar deudas)',
      consejos: ['Siempre requieren tercero', 'Control estricto de vencimientos', 'Impacto en flujo de caja']
    },
    '3': {
      nombre: 'PATRIMONIO',
      descripcion: 'Capital y utilidades de la empresa',
      naturaleza: 'CREDITO',
      emoji: '🏛️',
      ejemplos: [
        { codigo: '3105', nombre: 'Capital suscrito', descripcion: 'Capital inicial' },
        { codigo: '3605', nombre: 'Utilidades acumuladas', descripcion: 'Ganancias retenidas' }
      ],
      dinamica: 'Se ACREDITA cuando aumenta el patrimonio (aportes, utilidades), se DEBITA cuando disminuye (retiros, pérdidas)',
      consejos: ['Raramente requieren tercero', 'Base del patrimonio empresarial', 'Afecta indicadores financieros']
    },
    '4': {
      nombre: 'INGRESOS',
      descripcion: 'Aumentos en los beneficios económicos',
      naturaleza: 'CREDITO',
      emoji: '📈',
      ejemplos: [
        { codigo: '4135', nombre: 'Comercio al por mayor', descripcion: 'Ventas principales' },
        { codigo: '4220', nombre: 'Arrendamientos', descripcion: 'Ingresos por alquiler' }
      ],
      dinamica: 'Se ACREDITA cuando se genera el ingreso (ventas, servicios), se DEBITA en ajustes o devoluciones',
      consejos: ['Siempre requieren tercero', 'Base del estado de resultados', 'Sujetos a impuestos']
    },
    '5': {
      nombre: 'GASTOS',
      descripcion: 'Disminuciones en los beneficios económicos',
      naturaleza: 'DEBITO',
      emoji: '📉',
      ejemplos: [
        { codigo: '5105', nombre: 'Gastos de personal', descripcion: 'Sueldos y prestaciones' },
        { codigo: '5205', nombre: 'Gastos generales', descripcion: 'Gastos operativos' }
      ],
      dinamica: 'Se DEBITA cuando se incurre en el gasto (pagos, provisiones), se ACREDITA en correcciones',
      consejos: ['Requieren centro de costo', 'Control presupuestal', 'Deducibles de impuestos']
    },
    '6': {
      nombre: 'COSTOS',
      descripcion: 'Costos directos de producción',
      naturaleza: 'DEBITO',
      emoji: '⚙️',
      ejemplos: [
        { codigo: '6105', nombre: 'Materia prima', descripcion: 'Materiales directos' },
        { codigo: '6205', nombre: 'Mano de obra', descripcion: 'Trabajo directo' }
      ],
      dinamica: 'Se DEBITA cuando se incurre en costos de producción, se ACREDITA al trasladar a inventarios',
      consejos: ['Esenciales para centro de costo', 'Vinculados a producción', 'Afectan márgenes']
    }
  };

  // Efecto para actualizar código padre cuando cambia la prop
  useEffect(() => {
    if (codigoPadre) {
      setFormData(prev => ({ ...prev, codigo_padre: codigoPadre }));
    }
  }, [codigoPadre]);

  // Validar código en tiempo real con debounce
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      if (formData.codigo) {
        validateCodigo(formData.codigo);
        checkCodigoExists(formData.codigo);
        generateSmartSuggestions(formData.codigo);
        validateHierarchy(formData.codigo, formData.codigo_padre);
      } else {
        setCodigoInfo(null);
        setSuggestions([]);
        setCodigoExists(false);
      }
      setIsTyping(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.codigo, formData.codigo_padre]);

  // Auto-detectar naturaleza y generar recomendaciones inteligentes
  useEffect(() => {
    if (formData.codigo && formData.codigo.length >= 1) {
      const primerDigito = formData.codigo.charAt(0);
      const claseInfo = claseSuggestions[primerDigito];
      
      if (claseInfo) {
        // Auto-actualizar naturaleza si es diferente
        if (formData.naturaleza !== claseInfo.naturaleza) {
          setFormData(prev => ({ ...prev, naturaleza: claseInfo.naturaleza }));
        }
        
        // Auto-sugerir dinámica si está vacía
        if (!formData.dinamica && claseInfo.dinamica) {
          setFormData(prev => ({ ...prev, dinamica: claseInfo.dinamica }));
        }

        // Sugerir configuraciones inteligentes
        autoConfigureSettings(claseInfo, formData.codigo);
      }
      
      generateSmartTips();
    }
    
    // Calcular puntuación de completitud
    calculateCompletionScore();
  }, [formData]);

  const autoConfigureSettings = (claseInfo, codigo) => {
    const updates = {};
    
    // Sugerencias automáticas basadas en la clase
    if (codigo.startsWith('1') || codigo.startsWith('2') || codigo.startsWith('4')) {
      if (!formData.requiere_tercero) {
        updates.requiere_tercero = true;
      }
    }
    
    if (codigo.startsWith('5') || codigo.startsWith('6')) {
      if (!formData.requiere_centro_costo) {
        updates.requiere_centro_costo = true;
      }
    }
    
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  };

  const calculateCompletionScore = () => {
    let score = 0;
    const fields = [
      { field: 'codigo', weight: 25, valid: formData.codigo && codigoInfo?.valido },
      { field: 'nombre', weight: 20, valid: formData.nombre && formData.nombre.length >= 3 },
      { field: 'descripcion', weight: 15, valid: formData.descripcion && formData.descripcion.length >= 10 },
      { field: 'dinamica', weight: 15, valid: formData.dinamica && formData.dinamica.length >= 20 },
      { field: 'tipo_cuenta', weight: 10, valid: formData.tipo_cuenta },
      { field: 'naturaleza', weight: 10, valid: formData.naturaleza },
      { field: 'configuracion', weight: 5, valid: true }
    ];
    
    fields.forEach(field => {
      if (field.valid) score += field.weight;
    });
    
    setCompletionScore(score);
  };

  const validateHierarchy = (codigo, codigoPadre) => {
    if (!codigo || !codigoPadre) return;
    
    if (!codigo.startsWith(codigoPadre)) {
      setValidationErrors(prev => ({
        ...prev,
        hierarchy: `El código ${codigo} debe comenzar con el código padre ${codigoPadre}`
      }));
    } else if (codigo === codigoPadre) {
      setValidationErrors(prev => ({
        ...prev,
        hierarchy: 'El código no puede ser igual al código padre'
      }));
    } else if (codigo.length <= codigoPadre.length) {
      setValidationErrors(prev => ({
        ...prev,
        hierarchy: 'El código debe ser más largo que el código padre'
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.hierarchy;
        return newErrors;
      });
    }
  };

  const generateHierarchySuggestions = (codigoPadre) => {
    const suggestions = [];
    const padreLength = codigoPadre.length;
    
    if (padreLength === 1) {
      suggestions.push(`${codigoPadre}1`, `${codigoPadre}2`, `${codigoPadre}5`);
    } else if (padreLength === 2) {
      suggestions.push(`${codigoPadre}05`, `${codigoPadre}10`, `${codigoPadre}15`);
    } else if (padreLength === 4) {
      suggestions.push(`${codigoPadre}01`, `${codigoPadre}02`, `${codigoPadre}05`);
    } else if (padreLength >= 6) {
      suggestions.push(`${codigoPadre}1`, `${codigoPadre}2`, `${codigoPadre}3`);
    }
    
    return suggestions;
  };

  const checkCodigoExists = (codigo) => {
    const exists = existingCodes.includes(codigo);
    setCodigoExists(exists);
    
    if (exists) {
      setValidationErrors(prev => ({
        ...prev,
        codigo: 'Este código ya existe en el sistema'
      }));
    }
  };

  const generateSmartSuggestions = (codigo) => {
    const suggestions = [];
    const primerDigito = codigo.charAt(0);
    const claseInfo = claseSuggestions[primerDigito];
    
    if (claseInfo) {
      suggestions.push({
        type: 'class-info',
        icon: FaInfoCircle,
        emoji: claseInfo.emoji,
        title: `${claseInfo.emoji} Clase ${primerDigito}: ${claseInfo.nombre}`,
        message: claseInfo.descripcion,
        color: 'blue',
        priority: 'high'
      });
      
      if (codigo.length >= 2) {
        suggestions.push({
          type: 'examples',
          icon: FaLightbulb,
          emoji: '💡',
          title: 'Ejemplos similares en esta clase:',
          examples: claseInfo.ejemplos.slice(0, 3),
          color: 'yellow',
          priority: 'medium'
        });
      }
    }
    
    // Sugerencias de progreso
    if (codigo.length === 1) {
      suggestions.push({
        type: 'next-step',
        icon: FaArrowRight,
        emoji: '👉',
        title: '¡Siguiente paso!',
        message: 'Agrega un segundo dígito para definir el grupo específico',
        action: 'Continúa escribiendo...',
        color: 'green',
        priority: 'high'
      });
    } else if (codigo.length === 2) {
      suggestions.push({
        type: 'next-step',
        icon: FaArrowRight,
        emoji: '🎯',
        title: '¡Vas muy bien!',
        message: 'Completa con 4 dígitos para crear una cuenta funcional',
        action: 'Ej: ' + codigo + '05',
        color: 'green',
        priority: 'high'
      });
    } else if (codigo.length >= 4) {
      suggestions.push({
        type: 'success',
        icon: FaCheckCircle,
        emoji: '✅',
        title: '¡Código válido!',
        message: 'Este código tiene la longitud correcta para una cuenta funcional',
        color: 'green',
        priority: 'high'
      });
    }
    
    setSuggestions(suggestions);
  };

  const generateSmartTips = () => {
    const tips = [];
    const primerDigito = formData.codigo.charAt(0);
    const claseInfo = claseSuggestions[primerDigito];
    
    if (claseInfo) {
      // Consejos específicos de la clase
      claseInfo.consejos.forEach((consejo, index) => {
        tips.push({
          type: 'tip',
          icon: FaGraduationCap,
          emoji: '🎓',
          title: `Consejo ${index + 1}:`,
          message: consejo,
          color: 'blue'
        });
      });
      
      // Consejos sobre configuración
      if (formData.codigo.startsWith('5') || formData.codigo.startsWith('6')) {
        if (!formData.requiere_centro_costo) {
          tips.push({
            type: 'recommendation',
            icon: FaLightbulb,
            emoji: '💡',
            title: 'Recomendación inteligente:',
            message: 'Para cuentas de gastos/costos, activa "Requiere centro de costo" para mejor control',
            action: () => setFormData(prev => ({ ...prev, requiere_centro_costo: true })),
            actionText: 'Activar automáticamente',
            color: 'orange'
          });
        }
      }
    }
    
    setSmartTips(tips);
  };

  const validateCodigo = (codigo) => {
    const longitud = codigo.length;
    let info = {};
    
    if (!/^[0-9]+$/.test(codigo)) {
      info = {
        tipo: 'INVÁLIDO',
        nivel: 0,
        descripcion: 'El código debe contener solo números',
        valido: false,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300'
      };
    } else if (longitud === 1) {
      info = {
        tipo: 'CLASE',
        nivel: 1,
        descripcion: 'Clase principal del plan contable',
        valido: true,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        nextStep: 'Agregar segundo dígito para el grupo'
      };
    } else if (longitud === 2) {
      info = {
        tipo: 'GRUPO',
        nivel: 2,
        descripcion: 'Grupo de cuentas relacionadas',
        valido: true,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        nextStep: 'Completar a 4 dígitos para cuenta'
      };
    } else if (longitud === 4) {
      info = {
        tipo: 'CUENTA',
        nivel: 3,
        descripcion: 'Cuenta principal operativa',
        valido: true,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        nextStep: 'Opcional: extender para subcuentas'
      };
    } else if (longitud === 6) {
      info = {
        tipo: 'SUBCUENTA',
        nivel: 4,
        descripcion: 'Subcuenta para mayor detalle',
        valido: true,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        nextStep: 'Opcional: crear auxiliares'
      };
    } else if (longitud >= 7) {
      info = {
        tipo: 'AUXILIAR',
        nivel: 5,
        descripcion: 'Cuenta auxiliar detallada',
        valido: true,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300'
      };
    } else {
      info = {
        tipo: 'INCOMPLETO',
        nivel: 0,
        descripcion: 'Código incompleto',
        valido: false,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300'
      };
    }
    
    // Validar jerarquía
    if (formData.codigo_padre && codigo.length > 0) {
      if (!codigo.startsWith(formData.codigo_padre)) {
        info.valido = false;
        info.error = `Debe comenzar con: ${formData.codigo_padre}`;
        info.color = 'text-red-600';
        info.bgColor = 'bg-red-100';
        info.borderColor = 'border-red-300';
      } else if (codigo === formData.codigo_padre) {
        info.valido = false;
        info.error = 'No puede ser igual al código padre';
        info.color = 'text-red-600';
      } else if (codigo.length <= formData.codigo_padre.length) {
        info.valido = false;
        info.error = 'Debe ser más largo que el código padre';
        info.color = 'text-red-600';
      }
    }
    
    setCodigoInfo(info);
    
    // Auto-actualizar tipo de cuenta
    if (info.valido && info.tipo !== formData.tipo_cuenta) {
      setFormData(prev => ({ ...prev, tipo_cuenta: info.tipo }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validaciones críticas
    if (!formData.codigo) {
      errors.codigo = 'El código es obligatorio';
    } else if (codigoExists) {
      errors.codigo = 'Este código ya existe';
    } else if (codigoInfo && !codigoInfo.valido) {
      errors.codigo = codigoInfo.error || 'Código inválido';
    }
    
    if (!formData.nombre) {
      errors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 3) {
      errors.nombre = 'Mínimo 3 caracteres';
    }
    
    // Validación de jerarquía
    if (formData.codigo_padre && formData.codigo) {
      if (!formData.codigo.startsWith(formData.codigo_padre)) {
        errors.hierarchy = `El código debe comenzar con ${formData.codigo_padre}`;
      } else if (formData.codigo === formData.codigo_padre) {
        errors.hierarchy = 'No puede ser igual al código padre';
      } else if (formData.codigo.length <= formData.codigo_padre.length) {
        errors.hierarchy = 'Debe ser más largo que el código padre';
      }
    }
    
    if (formData.es_cuenta_niif && !formData.codigo_niif) {
      errors.codigo_niif = 'Código NIIF obligatorio';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await onSubmit(formData);
      
      if (result && result.success) {
        setTimeout(() => {
          handleClose();
        }, 500);
      } else if (result && result.error) {
        setValidationErrors(prev => ({
          ...prev,
          submit: result.error
        }));
      }
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      setValidationErrors(prev => ({
        ...prev,
        submit: error.message || 'Error al crear la cuenta'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo_cuenta: 'AUXILIAR',
      naturaleza: 'DEBITO',
      estado: 'ACTIVA',
      codigo_padre: codigoPadre,
      acepta_movimientos: true,
      requiere_tercero: false,
      requiere_centro_costo: false,
      dinamica: '',
      es_cuenta_niif: false,
      codigo_niif: '',
    });
    setValidationErrors({});
    setCodigoInfo(null);
    setSuggestions([]);
    setSmartTips([]);
    setCodigoExists(false);
    setLoading(false);
    setCurrentStep(1);
    setCompletionScore(0);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    if (validationErrors.submit) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.submit;
        return newErrors;
      });
    }
  };

  const applySuggestion = (codigo) => {
    handleInputChange('codigo', codigo);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedToStep = (step) => {
    switch(step) {
      case 2:
        return formData.codigo && codigoInfo?.valido && !codigoExists;
      case 3:
        return formData.nombre && formData.nombre.length >= 3;
      default:
        return true;
    }
  };

  const getClaseDescripcion = (primerDigito) => {
    const claseInfo = claseSuggestions[primerDigito];
    return claseInfo ? `${claseInfo.emoji} ${claseInfo.nombre} - ${claseInfo.descripcion}` : '';
  };

  const SmartCard = ({ suggestion, className = '' }) => (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{suggestion.emoji}</div>
        <div className="flex-1">
          <h5 className="font-semibold text-sm mb-1">{suggestion.title}</h5>
          <p className="text-xs text-gray-600 mb-2">{suggestion.message}</p>
          {suggestion.examples && (
            <div className="space-y-1">
              {suggestion.examples.map((example, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded-lg">
                  <span className="font-mono font-bold text-blue-600">{example.codigo}</span>
                  <span className="mx-2">-</span>
                  <span className="font-medium">{example.nombre}</span>
                  <div className="text-gray-500 text-xs mt-1">{example.descripcion}</div>
                </div>
              ))}
            </div>
          )}
          {suggestion.action && (
            <button
              type="button"
              onClick={() => suggestion.action()}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
            >
              {suggestion.actionText || suggestion.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Progreso de completitud</span>
        <span className="text-sm font-bold text-blue-600">{completionScore}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${completionScore}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">Información básica</span>
        <span className="text-xs text-gray-500">Configuración</span>
        <span className="text-xs text-gray-500">¡Completo!</span>
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            currentStep >= step 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-3">
          <FaWizardHat className="text-blue-500 text-xl" />
          <span>Asistente para Crear Cuenta PUC</span>
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Paso {currentStep} de 3
          </div>
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ProgressBar />
        <StepIndicator />

        {/* Errores críticos */}
        {validationErrors.hierarchy && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-2 mb-3">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
              <div>
                <h4 className="text-red-800 font-bold">🚨 Error de Jerarquía</h4>
                <p className="text-red-700 text-sm">{validationErrors.hierarchy}</p>
              </div>
            </div>
            
            {formData.codigo_padre && (
              <div className="bg-white rounded-lg p-3 border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-3">💡 Códigos válidos sugeridos:</p>
                <div className="flex flex-wrap gap-2">
                  {generateHierarchySuggestions(formData.codigo_padre).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => applySuggestion(suggestion)}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 text-sm rounded-lg font-mono border border-green-300 transition-all duration-200 hover:scale-105"
                    >
                      ✨ {suggestion}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  👆 Haz clic para aplicar automáticamente
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error de envío */}
        {validationErrors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-red-500 text-xl" />
              <div>
                <h4 className="text-red-800 font-medium">Error al crear la cuenta</h4>
                <p className="text-red-700 text-sm">{validationErrors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Asistente inteligente */}
        {showSmartAssistant && (suggestions.length > 0 || smartTips.length > 0) && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FaRocket className="text-blue-600 text-xl" />
                <h4 className="text-blue-800 font-bold">🤖 Asistente Inteligente</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSmartAssistant(!showSmartAssistant)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showSmartAssistant ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.slice(0, 2).map((suggestion, index) => (
                <SmartCard
                  key={`suggestion-${index}`}
                  suggestion={suggestion}
                  className={`${
                    suggestion.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                    suggestion.color === 'green' ? 'bg-green-50 border-green-200' :
                    suggestion.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* PASO 1: Código de la cuenta */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🎯 Paso 1: Define el código de tu cuenta
              </h3>
              <p className="text-gray-600">El código determina la estructura y jerarquía de tu cuenta</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código principal */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Código de la Cuenta ✨ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    pattern="[0-9]+"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 font-mono text-xl transition-all duration-200 ${
                      validationErrors.codigo ? 'border-red-400 bg-red-50' : 
                      codigoExists ? 'border-red-400 bg-red-50' :
                      codigoInfo?.valido ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="Ej: 1105, 110505..."
                  />
                  
                  {/* Indicadores de estado */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {isTyping && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    )}
                    {!isTyping && codigoExists && (
                      <FaExclamationTriangle className="text-red-500 text-xl" />
                    )}
                    {!isTyping && formData.codigo && codigoInfo && !codigoExists && (
                      codigoInfo.valido ? (
                        <FaCheckCircle className="text-green-500 text-xl animate-bounce" />
                      ) : (
                        <FaExclamationTriangle className="text-red-500 text-xl" />
                      )
                    )}
                  </div>
                </div>
                
                {/* Errores */}
                {validationErrors.codigo && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm flex items-center">
                      <FaExclamationTriangle className="mr-2" />
                      {validationErrors.codigo}
                    </p>
                  </div>
                )}
                
                {/* Información del código */}
                {codigoInfo && !codigoExists && (
                  <div className={`mt-3 p-4 rounded-xl border-2 ${codigoInfo.bgColor} ${codigoInfo.borderColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FaCode className={codigoInfo.color + ' text-lg'} />
                        <span className={`font-bold ${codigoInfo.color}`}>
                          {codigoInfo.tipo} - Nivel {codigoInfo.nivel}
                        </span>
                      </div>
                      {codigoInfo.valido && (
                        <FaShieldAlt className="text-green-500 text-lg" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{codigoInfo.descripcion}</p>
                    {codigoInfo.nextStep && (
                      <p className="text-sm text-blue-600 flex items-center">
                        <FaArrowRight className="mr-1" />
                        <strong>Siguiente:</strong> {codigoInfo.nextStep}
                      </p>
                    )}
                    {codigoInfo.error && (
                      <p className="text-sm text-red-600 flex items-center mt-2">
                        <FaExclamationTriangle className="mr-1" />
                        {codigoInfo.error}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Información de clase */}
                {formData.codigo && formData.codigo.length >= 1 && !codigoExists && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-100 border-2 border-indigo-200 rounded-xl">
                    <p className="text-sm text-indigo-800 font-medium flex items-center">
                      <FaInfoCircle className="mr-2 text-lg" />
                      {getClaseDescripcion(formData.codigo.charAt(0))}
                    </p>
                  </div>
                )}
              </div>

              {/* Código padre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Código Padre 👨‍👩‍👧‍👦
                  {formData.codigo_padre && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      📌 {formData.codigo_padre}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.codigo_padre}
                    onChange={(e) => handleInputChange('codigo_padre', e.target.value)}
                    pattern="[0-9]*"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 font-mono text-lg ${
                      validationErrors.codigo_padre ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Opcional - Ej: 1105"
                  />
                  {formData.codigo_padre && (
                    <FaInfoCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-lg" />
                  )}
                </div>
                
                <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h5 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
                    <FaGraduationCap className="mr-2" />
                    Reglas de Jerarquía:
                  </h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• El código debe comenzar con el código padre</li>
                    <li>• Debe ser más largo que el código padre</li>
                    <li>• No puede ser igual al código padre</li>
                  </ul>
                  {formData.codigo_padre && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-blue-200">
                      <p className="text-xs text-green-700 font-medium">
                        ✅ Ejemplos válidos: {generateHierarchySuggestions(formData.codigo_padre).slice(0, 3).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botón siguiente */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToStep(2)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                  canProceedToStep(2)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                icon={FaArrowRight}
              >
                Continuar al Paso 2 🚀
              </Button>
            </div>
          </div>
        )}

        {/* PASO 2: Información básica */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                📝 Paso 2: Información básica de la cuenta
              </h3>
              <p className="text-gray-600">Dale un nombre y descripción clara a tu cuenta</p>
            </div>

            <div className="space-y-6">
              {/* Nombre de la cuenta */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Nombre de la Cuenta 🏷️ <span className="text-red-500">*</span>
                  {formData.nombre && formData.nombre.length >= 3 && (
                    <FaCheckCircle className="inline ml-2 text-green-500 animate-bounce" />
                  )}
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all duration-200 ${
                    validationErrors.nombre ? 'border-red-400 bg-red-50' : 
                    formData.nombre && formData.nombre.length >= 3 ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Caja General, Proveedores Nacionales..."
                />
                <div className="flex justify-between items-center mt-2">
                  {validationErrors.nombre && (
                    <p className="text-red-500 text-sm flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {validationErrors.nombre}
                    </p>
                  )}
                  <p className={`text-sm ml-auto ${
                    formData.nombre.length < 3 ? 'text-gray-400' : 
                    formData.nombre.length < 50 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {formData.nombre.length}/50 caracteres
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Descripción 📋
                  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    Recomendado
                  </span>
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all duration-200"
                  placeholder="Describe el propósito y uso de esta cuenta de manera clara y detallada..."
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Una buena descripción ayuda al equipo a entender el uso de la cuenta
                  </p>
                  <p className="text-sm text-gray-400">
                    {formData.descripcion.length}/255 caracteres
                  </p>
                </div>
              </div>

              {/* Configuración básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Tipo de Cuenta 🏗️
                    {codigoInfo && codigoInfo.valido && (
                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Auto-detectado
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.tipo_cuenta}
                    onChange={(e) => handleInputChange('tipo_cuenta', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg"
                    disabled={codigoInfo && codigoInfo.valido}
                  >
                    <option value="CLASE">📚 Clase</option>
                    <option value="GRUPO">📂 Grupo</option>
                    <option value="CUENTA">📄 Cuenta</option>
                    <option value="SUBCUENTA">📋 Subcuenta</option>
                    <option value="AUXILIAR">🔧 Auxiliar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Naturaleza ⚖️
                    {formData.codigo && formData.codigo.length >= 1 && (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        Auto-sugerido
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.naturaleza}
                    onChange={(e) => handleInputChange('naturaleza', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg"
                  >
                    <option value="DEBITO">📈 Débito</option>
                    <option value="CREDITO">📉 Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Estado 🔄
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg"
                  >
                    <option value="ACTIVA">✅ Activa</option>
                    <option value="INACTIVA">❌ Inactiva</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Navegación */}
            <div className="flex justify-between">
              <Button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all duration-200"
                icon={FaArrowUp}
              >
                ⬅️ Paso Anterior
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToStep(3)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                  canProceedToStep(3)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                icon={FaArrowRight}
              >
                Continuar al Paso 3 🎯
              </Button>
            </div>
          </div>
        )}

        {/* PASO 3: Configuración avanzada */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ⚙️ Paso 3: Configuración avanzada
              </h3>
              <p className="text-gray-600">Personaliza el comportamiento de tu cuenta</p>
            </div>

            {/* Opciones de configuración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Acepta movimientos */}
                <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200">
                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.acepta_movimientos}
                      onChange={(e) => handleInputChange('acepta_movimientos', e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg font-bold text-gray-700 group-hover:text-gray-900">
                          💰 Acepta movimientos
                        </span>
                        {formData.acepta_movimientos ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Permite registrar transacciones directamente en esta cuenta
                      </p>
                      {!formData.acepta_movimientos && ['AUXILIAR', 'SUBCUENTA'].includes(formData.tipo_cuenta) && (
                        <p className="text-sm text-orange-600 mt-2 flex items-center">
                          <FaInfoCircle className="mr-1" />
                          ⚠️ Las cuentas {formData.tipo_cuenta.toLowerCase()}es generalmente aceptan movimientos
                        </p>
                      )}
                    </div>
                  </label>
                </div>

                {/* Requiere tercero */}
                <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200">
                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.requiere_tercero}
                      onChange={(e) => handleInputChange('requiere_tercero', e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg font-bold text-gray-700 group-hover:text-gray-900">
                          👥 Requiere tercero
                        </span>
                        {formData.requiere_tercero && <FaShieldAlt className="text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-600">
                        Obligatorio especificar un tercero en todos los movimientos
                      </p>
                      {(formData.codigo.startsWith('1105') || formData.codigo.startsWith('2105')) && !formData.requiere_tercero && (
                        <p className="text-sm text-blue-600 mt-2 flex items-center">
                          <FaLightbulb className="mr-1" />
                          💡 Recomendado para cuentas de caja y proveedores
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {/* Requiere centro de costo */}
                <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200">
                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.requiere_centro_costo}
                      onChange={(e) => handleInputChange('requiere_centro_costo', e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg font-bold text-gray-700 group-hover:text-gray-900">
                          🏢 Centro de costo
                        </span>
                        {formData.requiere_centro_costo && <FaShieldAlt className="text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-600">
                        Obligatorio especificar centro de costo en movimientos
                      </p>
                      {(formData.codigo.startsWith('5') || formData.codigo.startsWith('6')) && !formData.requiere_centro_costo && (
                        <p className="text-sm text-blue-600 mt-2 flex items-center">
                          <FaLightbulb className="mr-1" />
                          💡 Altamente recomendado para gastos y costos
                        </p>
                      )}
                    </div>
                  </label>
                </div>

                {/* Es cuenta NIIF */}
                <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200">
                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.es_cuenta_niif}
                      onChange={(e) => handleInputChange('es_cuenta_niif', e.target.checked)}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg font-bold text-gray-700 group-hover:text-gray-900">
                          🌍 Cuenta NIIF
                        </span>
                        {formData.es_cuenta_niif && <FaShieldAlt className="text-purple-500" />}
                      </div>
                      <p className="text-sm text-gray-600">
                        Cuenta según Normas Internacionales de Información Financiera
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Código NIIF condicional */}
            {formData.es_cuenta_niif && (
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <label className="block text-sm font-bold text-purple-800 mb-3">
                  🌍 Código NIIF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.codigo_niif}
                  onChange={(e) => handleInputChange('codigo_niif', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 font-mono text-lg ${
                    validationErrors.codigo_niif ? 'border-red-500' : 'border-purple-300'
                  }`}
                  placeholder="Código equivalente según NIIF"
                />
                {validationErrors.codigo_niif && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {validationErrors.codigo_niif}
                  </p>
                )}
              </div>
            )}

            {/* Dinámica contable */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📚 Dinámica Contable
                <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Auto-sugerido
                </span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.dinamica}
                  onChange={(e) => handleInputChange('dinamica', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all duration-200"
                  placeholder="Describe cuándo se debita y cuándo se acredita esta cuenta..."
                />
                {formData.dinamica && (
                  <FaCheckCircle className="absolute top-4 right-4 text-green-500 text-xl" />
                )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  📖 Explica las reglas de débito y crédito para esta cuenta
                </p>
                <p className="text-sm text-gray-400">
                  {formData.dinamica.length}/500 caracteres
                </p>
              </div>
            </div>

            {/* Resumen final */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FaEye className="mr-2 text-blue-500" />
                🎯 Resumen de tu cuenta
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-gray-600 font-medium">📋 Código:</span>
                    <span className="font-mono font-bold text-lg text-blue-600">
                      {formData.codigo || 'Sin definir'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-gray-600 font-medium">🏷️ Nombre:</span>
                    <span className="font-bold text-gray-800 truncate ml-2">
                      {formData.nombre || 'Sin definir'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-gray-600 font-medium">⚖️ Naturaleza:</span>
                    <span className={`font-bold ${formData.naturaleza === 'DEBITO' ? 'text-blue-600' : 'text-green-600'}`}>
                      {formData.naturaleza === 'DEBITO' ? '📈 Débito' : '📉 Crédito'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-gray-600 font-medium">🏗️ Tipo:</span>
                    <span className="font-bold text-gray-800">{formData.tipo_cuenta}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-gray-600 font-medium">💰 Movimientos:</span>
                    <span className={`font-bold ${formData.acepta_movimientos ? 'text-green-600' : 'text-orange-600'}`}>
                      {formData.acepta_movimientos ? '✅ Acepta' : '❌ No acepta'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-gray-600 font-medium">🛡️ Controles:</span>
                    <div className="flex space-x-1">
                      {formData.requiere_tercero && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">👥 Tercero</span>
                      )}
                      {formData.requiere_centro_costo && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">🏢 C.Costo</span>
                      )}
                      {formData.es_cuenta_niif && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">🌍 NIIF</span>
                      )}
                      {!formData.requiere_tercero && !formData.requiere_centro_costo && !formData.es_cuenta_niif && (
                        <span className="text-gray-500 text-sm">Ninguno</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Indicador de calidad */}
              <div className="mt-4 p-3 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-700">🎯 Calidad de la cuenta:</span>
                  <span className="font-bold text-2xl">{completionScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      completionScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      completionScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${completionScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {completionScore >= 80 ? '🌟 ¡Excelente! Tu cuenta está muy completa' :
                   completionScore >= 60 ? '👍 Bien, puedes agregar más detalles' :
                   '📝 Agrega más información para mejorar la calidad'}
                </p>
              </div>
            </div>

            {/* Navegación final */}
            <div className="flex justify-between">
              <Button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all duration-200"
                icon={FaArrowUp}
              >
                ⬅️ Paso Anterior
              </Button>
              <Button
                type="submit"
                disabled={loading || !codigoInfo?.valido || codigoExists || Object.keys(validationErrors).filter(key => key !== 'submit').length > 0}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                  loading || !codigoInfo?.valido || codigoExists || Object.keys(validationErrors).filter(key => key !== 'submit').length > 0
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                }`}
                icon={loading ? null : FaRocket}
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></div>
                    <span>🚀 Creando cuenta...</span>
                  </div>
                ) : codigoExists ? (
                  '❌ Código ya existe'
                ) : !codigoInfo?.valido ? (
                  '⚠️ Código inválido'
                ) : Object.keys(validationErrors).filter(key => key !== 'submit').length > 0 ? (
                  '📝 Corregir errores'
                ) : (
                  '🎉 ¡Crear Cuenta!'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Tips inteligentes flotantes */}
        {smartTips.length > 0 && currentStep === 3 && (
          <div className="fixed bottom-4 right-4 max-w-sm z-50">
            {smartTips.slice(0, 1).map((tip, index) => (
              <div key={index} className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-xl animate-bounce">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{tip.emoji}</div>
                  <div>
                    <h5 className="font-bold text-sm text-blue-800">{tip.title}</h5>
                    <p className="text-xs text-blue-700 mt-1">{tip.message}</p>
                    {tip.action && (
                      <button
                        type="button"
                        onClick={tip.action}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {tip.actionText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateCuentaModal;
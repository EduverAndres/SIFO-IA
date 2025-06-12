import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from './InputField';
import Button from './Button';
import { registerUser } from '../api/ordenesApi';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validaciones frontend
    if (!userData.username || !userData.email || !userData.password) {
      setError('Todos los campos son obligatorios.');
      setLoading(false);
      return;
    }

    if (userData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      setLoading(false);
      return;
    }

    if (userData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    // Validación de formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError('Por favor, ingresa un formato de correo electrónico válido.');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 [REGISTER] Enviando datos:', userData);
      
      const response = await registerUser(userData);
      
      console.log('✅ [REGISTER] Respuesta recibida:', response);

      // ✅ CORRECCIÓN: Verificar estructura de respuesta
      if (response.success && response.data) {
        setSuccessMessage(`¡Registro exitoso! Bienvenido, ${response.data.username}. Redirigiendo al login...`);
        
        // Limpiar formulario
        setUserData({ username: '', email: '', password: '' });
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
      } else {
        // Si la respuesta no tiene la estructura esperada
        setError('Registro completado, pero respuesta inesperada del servidor.');
        console.warn('⚠️ [REGISTER] Estructura de respuesta inesperada:', response);
        
        // Aún así redirigir al login después de un momento
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
      
    } catch (err) {
      console.error('💥 [REGISTER] Error capturado:', err);
      
      // ✅ MEJOR MANEJO DE ERRORES
      if (err.message) {
        // Errores específicos basados en el mensaje
        if (err.message.includes('nombre de usuario ya está en uso') || err.message.includes('username')) {
          setError('Este nombre de usuario ya está en uso. Prueba con otro.');
        } else if (err.message.includes('email ya está registrado') || err.message.includes('correo')) {
          setError('Este correo electrónico ya está registrado. ¿Quizás ya tienes una cuenta?');
        } else if (err.message.includes('email must be an email')) {
          setError('El formato del correo electrónico no es válido.');
        } else if (err.message.includes('400')) {
          setError('Datos inválidos. Verifica que todos los campos estén correctos.');
        } else if (err.message.includes('500')) {
          setError('Error interno del servidor. Inténtalo más tarde.');
        } else if (err.message.includes('ConflictException')) {
          setError('Ya existe un usuario con estos datos. Verifica tu email y nombre de usuario.');
        } else {
          setError(err.message);
        }
      } else {
        // Error de red o desconocido
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Nombre de Usuario"
          id="username"
          name="username"
          type="text"
          value={userData.username}
          onChange={handleChange}
          placeholder="Al menos 3 caracteres"
          required
        />
        
        <InputField
          label="Correo Electrónico"
          id="email"
          name="email"
          type="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="ejemplo@correo.com"
          required
        />
        
        <InputField
          label="Contraseña"
          id="password"
          name="password"
          type="password"
          value={userData.password}
          onChange={handleChange}
          placeholder="Al menos 6 caracteres"
          required
        />

        {/* Mostrar mensaje de éxito */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm font-medium text-center">
              ✅ {successMessage}
            </p>
          </div>
        )}

        {/* Mostrar mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium text-center">
              ❌ {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-3 text-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            </span>
          ) : (
            'Registrarse'
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:underline cursor-pointer font-medium transition duration-300"
            >
              Inicia sesión aquí
            </Link>
          </p>
          
          <p className="text-xs text-gray-400">
            Al registrarte, aceptas nuestros términos y condiciones.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
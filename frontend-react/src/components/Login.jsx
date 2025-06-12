import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from './InputField';
import Button from './Button';
import { loginUser } from '../api/ordenesApi';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validación básica en el frontend
    if (!credentials.email || !credentials.password) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }

    if (!credentials.email.includes('@')) {
      setError('Por favor, ingresa un email válido.');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 [LOGIN] Enviando credenciales:', credentials);
      
      const response = await loginUser(credentials);
      
      console.log('✅ [LOGIN] Respuesta recibida:', response);

      // ✅ CORRECCIÓN: Acceder correctamente a los datos de la respuesta
      if (response.success && response.data) {
        const { access_token, user } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('💾 [LOGIN] Datos guardados en localStorage');
        
        // Mensaje de éxito
        setSuccessMessage(`¡Bienvenido, ${user.username || user.email}! Redirigiendo...`);
        
        // Retraso para mostrar el mensaje antes de redirigir
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        
      } else {
        // Si la respuesta no tiene la estructura esperada
        setError('Respuesta del servidor inválida. Inténtalo de nuevo.');
        console.error('❌ [LOGIN] Estructura de respuesta inesperada:', response);
      }
      
    } catch (err) {
      console.error('💥 [LOGIN] Error capturado:', err);
      
      // ✅ MEJOR MANEJO DE ERRORES
      if (err.message) {
        // Si es un error de nuestra API (viene de ordenesApi.js)
        if (err.message.includes('Credenciales inválidas')) {
          setError('Email o contraseña incorrectos. Verifica tus datos.');
        } else if (err.message.includes('500')) {
          setError('Error interno del servidor. Inténtalo más tarde.');
        } else if (err.message.includes('400')) {
          setError('Datos inválidos. Verifica el formato de tu email.');
        } else if (err.message.includes('404')) {
          setError('Servicio no disponible. Contacta al administrador.');
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
          label="Correo Electrónico"
          id="email"
          name="email"
          type="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="ejemplo@correo.com"
          required={true}
        />
        <InputField
          label="Contraseña"
          id="password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Tu contraseña"
          required={true}
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
          className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando Sesión...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:underline cursor-pointer font-medium transition duration-300"
          >
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
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
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage(''); // Limpiar mensajes al cambiar los campos
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await loginUser(credentials);
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // **MENSAJE DE ÉXITO AQUÍ**
      setSuccessMessage(`¡Validación exitosa! Bienvenido, ${response.user.username}.`);
      
      // Retraso para que el usuario pueda leer el mensaje de éxito antes de la redirección
      setTimeout(() => {
        navigate('/dashboard'); // Redirige a la vista del usuario logueado
      }, 1500);
      
    } catch (err) {
      // Manejo de errores
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        // Esto captura errores de red u otros que no vienen con 'response.data'
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
        console.error('Error de login (cliente):', err);
      } else {
        // Error genérico si no hay un mensaje específico
        setError('Ocurrió un error desconocido al iniciar sesión.');
        console.error('Error de login (desconocido):', err);
      }
    } finally {
      setLoading(false); // Siempre desactiva el estado de carga
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
          placeholder="Tu correo electrónico"
          required={false}
        />
        <InputField
          label="Contraseña"
          id="password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Tu contraseña"
          required={false}
        />

        {/* Mostrar mensaje de éxito */}
        {successMessage && (
          <p className="text-green-600 text-sm font-medium text-center">
            {successMessage}
          </p>
        )}

        {/* Mostrar mensaje de error */}
        {error && (
          <p className="text-red-600 text-sm font-medium text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from './InputField';
import Button from './Button';
import { registerUser } from '../api/ordenesApi';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '', // Asegúrate de que esté aquí
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

    if (!userData.username || !userData.email || !userData.password) { // <-- Asegura que email se valide
      setError('Todos los campos son obligatorios.');
      setLoading(false);
      return;
    }
    if (userData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }
    // Opcional: Validación de formato de email en frontend
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError('Por favor, ingresa un formato de correo electrónico válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(userData);
      setSuccessMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setUserData({ username: '', email: '', password: '' });
      console.log('Usuario registrado:', response);
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError('No se pudo conectar con el servidor o hubo un error inesperado.');
        console.error('Error de registro (cliente):', err);
      } else {
        setError('Ocurrió un error desconocido al intentar registrarte.');
        console.error('Error de registro (desconocido):', err);
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
          placeholder="Elige un nombre de usuario"
          required
        />
        <InputField
          label="Correo Electrónico" // <-- Asegura el label
          id="email"               // <-- Asegura el id
          name="email"             // <-- Asegura el name
          type="email"             // <-- Asegura el type
          value={userData.email}   // <-- Asegura el valor
          onChange={handleChange}
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

        {error && (
          <p className="text-red-600 text-sm font-medium text-center">{error}</p>
        )}
        {successMessage && (
          <p className="text-green-600 text-sm font-medium text-center">{successMessage}</p>
        )}

        <Button
          type="submit"
          className="w-full py-3 text-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
// frontend-react/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.25)',
        '4xl': '0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.15)',
        '5xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', // Nueva sombra profunda
        'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.08)', // Sombra interior suave
      },
      keyframes: {
        // ... (tus keyframes existentes, si los tienes) ...
        radialPulse: { // Nueva keyframe para el fondo radial
          '0%': { 'background-position': '50% 50%, 0% 0%' },
          '25%': { 'background-position': '70% 30%, 10% 90%' },
          '50%': { 'background-position': '50% 50%, 0% 0%' },
          '75%': { 'background-position': '30% 70%, 90% 10%' },
          '100%': { 'background-position': '50% 50%, 0% 0%' },
        },
        // *** INICIO: Keyframe para el fade-in del modal ***
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // *** FIN: Keyframe para el fade-in del modal ***
      },
      animation: {
        // ... (tus animaciones existentes, si las tienes) ...
        'radial-gradient-animate': 'radialPulse 25s ease-in-out infinite', // Nueva animación para el fondo
        // *** FIN: Animación para el fade-in del modal ***
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Asegúrate de que Poppins esté configurado si quieres usarla
      },
    },
  },
  plugins: [],
}
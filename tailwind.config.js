const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-work-sans)', 'Work Sans', ...fontFamily.sans],
        'work-sans': ['var(--font-work-sans)', 'Work Sans'],
        'jeko': ['Jeko', 'system-ui', ...fontFamily.sans] // Para títulos (se añadirá via CDN)
      },
      colors: {
        // Colores personalizados APIDevs - Brand Book 2024
        'apidevs': {
          'primary': '#C9D92E',     // Verde lima principal
          'primary-dark': '#A8B625', // Verde lima oscuro
          'dark': '#0a0a0a',        // Negro profundo para fondos
          'gray': '#1a1a1a',        // Gris oscuro para cards
          'gray-light': '#2a2a2a',  // Gris medio para elementos
          'gray-dark': '#333333',   // Gris para bordes
          'black': '#000000',       // Negro absoluto
          'white': '#ffffff'        // Blanco puro
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #C9D92E 0%, #A8B625 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        'chart-gradient': 'linear-gradient(180deg, rgba(201,217,46,0.1) 0%, rgba(201,217,46,0) 100%)'
      },
      boxShadow: {
        'primary': '0 0 20px rgba(201, 217, 46, 0.3)',
        'primary-lg': '0 0 40px rgba(201, 217, 46, 0.4)',
        'card-dark': '0 4px 20px rgba(26, 26, 26, 0.3)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        },
        'glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateY(0px)' }
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        'gradient': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'gradient': 'gradient 8s ease infinite'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

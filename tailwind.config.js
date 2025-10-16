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
        'orbitron': ['Orbitron', 'system-ui', ...fontFamily.sans] // Para títulos futuristas
      },
      colors: {
        // Colores personalizados APIDevs - Brand Book 2024
        'apidevs': {
          'primary': '#C9D92E',     // Verde lima principal
          'primary-dark': '#A8B625', // Verde lima oscuro
          'purple': '#8B5CF6',      // Morado principal para light mode
          'purple-dark': '#7C3AED', // Morado oscuro
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
      backgroundSize: {
        '200': '200%'
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
        },
        'fade-in': {
          'from': { opacity: 0 },
          'to': { opacity: 1 }
        },
        'slide-up': {
          'from': { transform: 'translateY(100%)', opacity: 0 },
          'to': { transform: 'translateY(0)', opacity: 1 }
        },
        'slide-in-left': {
          'from': { transform: 'translateX(-100%)', opacity: 0 },
          'to': { transform: 'translateX(0)', opacity: 1 }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite'
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ]
};

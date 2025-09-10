/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blaze: {
          orange: '#BF5700',
          'orange-light': '#FF6A00',
          'orange-dark': '#8F3E00',
          blue: '#9BCBEB',
          'blue-light': '#B8DCEE',
          'blue-dark': '#7AB8DB',
          navy: '#002244',
          teal: '#00B2A9',
          platinum: '#E5E4E2',
          graphite: '#36454F',
          pearl: '#FAFAFA'
        },
        cardinal: {
          DEFAULT: '#C41E3A',
          light: '#DC2E4B',
          dark: '#9A1628'
        },
        titans: {
          DEFAULT: '#002244',
          light: '#0A2C4E',
          red: '#C8102E'
        },
        longhorns: {
          DEFAULT: '#BF5700',
          light: '#FF6A00',
          dark: '#8F3E00'
        },
        grizzlies: {
          DEFAULT: '#5D76A9',
          light: '#7E92BA',
          dark: '#445A8A',
          gold: '#F5B112'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Neue Haas Grotesk Display', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in',
        'fade-out': 'fadeOut 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-orange': 'pulseOrange 2s infinite',
        'spin-slow': 'spin 3s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        pulseOrange: {
          '0%, 100%': { backgroundColor: '#BF5700', opacity: '0.8' },
          '50%': { backgroundColor: '#FF6A00', opacity: '1' }
        }
      },
      boxShadow: {
        'blaze': '0 4px 14px 0 rgba(191, 87, 0, 0.25)',
        'cardinal': '0 4px 14px 0 rgba(196, 30, 58, 0.25)',
        'data': '0 0 20px rgba(155, 203, 235, 0.5)'
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}
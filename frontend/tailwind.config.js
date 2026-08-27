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
        texflow: {
          50: '#FFF8FA',
          100: '#FFF1F5',
          200: '#FCE7F3',
          300: '#E05A9D',
          400: '#A0005A',
          500: '#A0005A',
          600: '#820049',
          700: '#4B4558',
          800: '#E8DDE4',
          900: '#171329',
          950: '#171329',
        },
        dark: {
          900: '#FFF8FA',
          800: '#FFFFFF',
          700: '#FFF1F5',
          600: '#A0005A',
          500: '#C21875',
        },
        accent: {
          primary: '#A0005A',
          secondary: '#C21875',
          light: 'rgba(160, 0, 90, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'loading-bar': 'loadingBar 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 175, 175, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 175, 175, 0.6)' },
        },
        loadingBar: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}

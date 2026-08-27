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
          50: '#082032',
          100: '#2C394B',
          200: '#334756',
          300: '#FF6345',
          400: '#FF4C29',
          500: '#FF4C29',
          600: '#9AA8B2',
          700: '#D8E0E5',
          800: 'rgba(255,255,255,0.10)',
          900: '#FFFFFF',
          950: '#FFFFFF',
        },
        dark: {
          900: '#082032',
          800: '#2C394B',
          700: '#334756',
          600: '#334756',
          500: '#FF4C29',
        },
        accent: {
          primary: '#FF4C29',
          secondary: '#FF6345',
          light: 'rgba(255, 76, 41, 0.15)',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 76, 41, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 76, 41, 0.4)' },
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

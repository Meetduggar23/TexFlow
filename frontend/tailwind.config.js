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
          50: '#f5eef8',
          100: '#e8d5f0',
          200: '#d4b3e3',
          300: '#b97cc9',
          400: '#a34db5',
          500: '#910A67',
          600: '#720455',
          700: '#5a0344',
          800: '#3C0753',
          900: '#030637',
          950: '#020424',
        },
        dark: {
          900: '#030637',
          800: '#0a0c3d',
          700: '#12144a',
          600: '#1a1d5a',
          500: '#23266a',
        },
        accent: {
          primary: '#720455',
          secondary: '#910A67',
          light: '#b97cc9',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(114, 4, 85, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(114, 4, 85, 0.6)' },
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

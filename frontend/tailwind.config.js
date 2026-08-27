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
          50: '#FCF8F8',
          100: '#FBEFEF',
          200: '#F9DFDF',
          300: '#F5AFAF',
          400: '#e89595',
          500: '#d47777',
          600: '#b85c5c',
          700: '#8a4040',
          800: '#5a3a3a',
          900: '#3d2626',
          950: '#2a1a1a',
        },
        dark: {
          900: '#FCF8F8',
          800: '#FBEFEF',
          700: '#F9DFDF',
          600: '#F5AFAF',
          500: '#e89595',
        },
        accent: {
          primary: '#F5AFAF',
          secondary: '#F9DFDF',
          light: '#FBEFEF',
        }
      },
      fontFamily: {
        sans: ['Lora', 'Georgia', 'serif'],
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

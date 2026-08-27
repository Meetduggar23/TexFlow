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
          50: 'var(--color-background)', 100: 'var(--color-surface)', 200: 'var(--color-surface-elevated)', 300: 'var(--color-accent-hover)', 400: 'var(--color-accent)', 500: 'var(--color-accent)', 600: 'var(--color-text-muted)', 700: 'var(--color-text-secondary)', 800: 'var(--color-border)', 900: 'var(--color-text-primary)', 950: 'var(--color-text-primary)',
        },
        dark: {
          900: 'var(--color-background)', 800: 'var(--color-surface)', 700: 'var(--color-surface-elevated)', 600: 'var(--color-surface-elevated)', 500: 'var(--color-accent)',
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

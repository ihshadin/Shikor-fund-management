import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#e6fff9',
          100: '#b3ffee',
          200: '#7ffee3',
          300: '#3ffdd4',
          400: '#1de8be',
          500: '#0fcda1',
          600: '#0db891',
          700: '#0a9678',
          800: '#077560',
          900: '#045a48',
          950: '#023830',
        },
        accent: {
          50:  '#eaf1ff',
          100: '#c7d9ff',
          200: '#9cbeff',
          300: '#6aa1ff',
          400: '#3d83ff',
          500: '#206df7',
          600: '#1458d4',
          700: '#0f44ab',
          800: '#0b3388',
          900: '#072465',
          950: '#041642',
        },
      },
      animation: {
        'float-slow':    'float 10s ease-in-out infinite',
        'float-medium':  'float 7s ease-in-out infinite',
        'float-fast':    'float 5s ease-in-out infinite',
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift':'gradientShift 8s ease infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'spin-slow':     'spin 8s linear infinite',
        'fade-in':       'fadeIn 0.5s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':       { transform: 'translateY(-24px) rotate(4deg)' },
          '66%':       { transform: 'translateY(-12px) rotate(-2deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(15,205,161,0.3), 0 0 40px rgba(32,109,247,0.2)' },
          '50%':       { boxShadow: '0 0 40px rgba(15,205,161,0.6), 0 0 80px rgba(32,109,247,0.4)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

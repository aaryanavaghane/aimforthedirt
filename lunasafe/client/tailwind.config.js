/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cinzel"', '"Syne"', 'serif'],
        heading: ['"Syne"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: {
          DEFAULT: '#030303',
          dark: '#010101',
          surface: '#080808',
          card: '#0c070a',
          border: 'rgba(255, 182, 193, 0.12)',
        },
        pink: {
          neon: '#FF1493',
          hot: '#FF69B4',
          pastel: '#FFB6C1',
          light: '#FFD1DC',
          blush: '#FFF0F5',
          dark: '#38061e',
          deep: '#1a030f',
        }
      },
      boxShadow: {
        'glow-pink': '0 0 35px -2px rgba(255, 20, 147, 0.45)',
        'glow-pink-lg': '0 0 70px -5px rgba(255, 20, 147, 0.35)',
        'glow-pastel': '0 0 30px -2px rgba(255, 182, 193, 0.35)',
        'glass-pink': '0 8px 32px 0 rgba(255, 20, 147, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-scan': 'glowScan 4s ease infinite',
        'marquee': 'marquee 30s linear infinite'
      },
      keyframes: {
        radarPing: {
          '75%, 100%': {
            transform: 'scale(2.5)',
            opacity: '0',
          },
        },
        glowScan: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    },
  },
  plugins: [],
}

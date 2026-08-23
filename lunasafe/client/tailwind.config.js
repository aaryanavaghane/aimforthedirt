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
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Cinzel"', 'serif'],
        space: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Space Grotesk"', '"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: {
          DEFAULT: '#020408',
          dark: '#010204',
          surface: '#050914',
          card: '#081124',
          border: 'rgba(56, 189, 248, 0.18)',
        },
        atmos: {
          blue: '#0D38E8',
          royal: '#0A2396',
          midnight: '#081B4B',
          deep: '#030A1D',
          cyan: '#00F5FF',
          sky: '#38BDF8',
          teal: '#06B6D4',
          silver: '#E2E8F0',
          mist: '#F1F5F9',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 35px -2px rgba(0, 245, 255, 0.5)',
        'glow-cyan-lg': '0 0 70px -5px rgba(0, 245, 255, 0.35)',
        'glow-blue': '0 0 45px -2px rgba(13, 56, 232, 0.6)',
        'glow-silver': '0 0 30px -2px rgba(226, 232, 240, 0.4)',
        'glass-blue': '0 8px 32px 0 rgba(8, 27, 75, 0.45)',
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

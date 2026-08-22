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
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Sora"', 'sans-serif'],
        heading: ['"Syne"', '"Sora"', 'sans-serif'],
        tech: ['"Chakra Petch"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          dark: '#050811',
          panel: '#090e1c',
          card: '#0f172a',
          border: '#1e293b',
          accent: '#06b6d4',
        },
        neon: {
          cyan: '#06b6d4',
          cyanLight: '#22d3ee',
          amber: '#f59e0b',
          amberLight: '#fbbf24',
          rose: '#f43f5e',
          roseLight: '#fb7185',
          emerald: '#10b981',
          emeraldLight: '#34d399',
          violet: '#8b5cf6',
          violetLight: '#a78bfa'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 24px -2px rgba(6, 182, 212, 0.5)',
        'glow-rose': '0 0 24px -2px rgba(244, 63, 94, 0.5)',
        'glow-amber': '0 0 24px -2px rgba(245, 158, 11, 0.5)',
        'glow-emerald': '0 0 24px -2px rgba(16, 185, 129, 0.5)',
        'glow-violet': '0 0 28px -2px rgba(139, 92, 246, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)'
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

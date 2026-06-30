/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ok: '#34d399', warn: '#fbbf24', alarm: '#f43f5e', info: '#38bdf8',
        ink: '#070b12', panel: 'rgba(16,22,34,0.72)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 24px rgba(56,189,248,0.35)',
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '0.7' }, '100%': { transform: 'scale(2.2)', opacity: '0' } },
        sheen: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: { pulseRing: 'pulseRing 1.8s ease-out infinite', sheen: 'sheen 3s linear infinite' },
    },
  },
  plugins: [],
}

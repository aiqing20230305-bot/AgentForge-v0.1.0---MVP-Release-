/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark fantasy theme
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-tertiary': '#1a1a24',
        'border-dark': '#2a2a3a',
        'border-glow': '#4a4a6a',

        // Rarity colors
        'rarity-common': '#9d9d9d',
        'rarity-uncommon': '#1eff00',
        'rarity-rare': '#0070dd',
        'rarity-epic': '#a335ee',
        'rarity-legendary': '#ff8000',

        // UI accents
        'accent-blue': '#00d4ff',
        'accent-purple': '#8b5cf6',
        'accent-gold': '#fbbf24',
        'text-primary': '#e5e5e5',
        'text-secondary': '#a0a0a0',
        'text-muted': '#666666',

        // Status colors
        'success': '#22c55e',
        'warning': '#f59e0b',
        'danger': '#ef4444',
      },
      fontFamily: {
        'fantasy': ['Cinzel', 'Georgia', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-common': '0 0 10px rgba(157, 157, 157, 0.3)',
        'glow-uncommon': '0 0 10px rgba(30, 255, 0, 0.4)',
        'glow-rare': '0 0 10px rgba(0, 112, 221, 0.4)',
        'glow-epic': '0 0 15px rgba(163, 53, 238, 0.5)',
        'glow-legendary': '0 0 20px rgba(255, 128, 0, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(0, 212, 255, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 0.75s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '10%': { transform: 'scale(1.1)' },
          '20%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.1)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

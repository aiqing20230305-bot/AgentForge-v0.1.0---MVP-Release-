/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme system colors (using CSS variables)
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'accent-primary': 'var(--color-accent-primary)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'accent-tertiary': 'var(--color-accent-tertiary)',
        'border-primary': 'var(--color-border-primary)',
        'border-secondary': 'var(--color-border-secondary)',

        // Keep legacy colors for backward compatibility
        'border-dark': '#2a2a3a',
        'border-glow': '#4a4a6a',

        // Rarity colors
        'rarity-common': '#9d9d9d',
        'rarity-uncommon': '#1eff00',
        'rarity-rare': '#0070dd',
        'rarity-epic': '#a335ee',
        'rarity-legendary': '#ff8000',

        // UI accents (legacy)
        'accent-blue': '#00d4ff',
        'accent-purple': '#8b5cf6',
        'accent-gold': '#fbbf24',

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
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
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
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px',
      },
      minWidth: {
        'touch': '48px',
        'touch-lg': '56px',
      },
    },
  },
  plugins: [],
}

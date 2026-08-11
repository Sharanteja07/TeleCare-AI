/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        'app':       '#070B18',
        'app-sec':   '#0D1224',
        'sidebar':   '#10192F',
        'card':      'rgba(18,25,47,0.75)',
        // Brand colors
        'primary':   '#3BB7FF',
        'accent':    '#5E8BFF',
        'glow':      'rgba(59,183,255,0.35)',
        // Status
        'success':   '#00E676',
        'warning':   '#FFC107',
        'danger':    '#FF5252',
        // Text
        'text':      '#FFFFFF',
        'muted':     '#A8B3CF',
        // Borders
        'border':    'rgba(120,160,255,0.15)',
        'border-hi': 'rgba(255,255,255,0.08)',
        // Legacy aliases (keep backward compat for existing pages)
        'bg-app':       '#070B18',
        'bg-secondary': '#0D1224',
        'bg-sidebar':   '#10192F',
        'bg-card':      'rgba(18,25,47,0.75)',
        'border-dim':   'rgba(120,160,255,0.15)',
        'text-primary': '#FFFFFF',
        'text-secondary':'#A8B3CF',
        'color-primary': '#3BB7FF',
        'color-success': '#00E676',
        'color-warning': '#FFC107',
        'color-danger':  '#FF5252',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(59,183,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,183,255,0.04) 1px, transparent 1px)",
        'card-gradient': "linear-gradient(135deg, rgba(59,183,255,0.05) 0%, rgba(94,139,255,0.03) 100%)",
        'primary-gradient': "linear-gradient(135deg, #3BB7FF 0%, #5E8BFF 100%)",
        'danger-gradient': "linear-gradient(135deg, #FF5252 0%, #ff1744 100%)",
        'success-gradient': "linear-gradient(135deg, #00E676 0%, #00c853 100%)",
      },
      boxShadow: {
        'glow-sm':   '0 0 15px rgba(59,183,255,0.15)',
        'glow':      '0 0 30px rgba(59,183,255,0.25)',
        'glow-lg':   '0 0 60px rgba(59,183,255,0.35)',
        'card':      '0 8px 32px rgba(0,0,0,0.4)',
        'card-hover':'0 20px 40px rgba(59,183,255,0.25)',
        'input':     '0 0 0 2px rgba(59,183,255,0.3)',
      },
      backdropBlur: {
        xs: '2px',
        card: '18px',
      },
      animation: {
        'fadeIn':         'fadeIn 0.3s ease-out forwards',
        'slideUp':        'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slideInRight':   'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':        'shimmer 1.8s infinite linear',
        'pulse-glow':     'pulseGlow 2s ease-in-out infinite',
        'float':          'float 6s ease-in-out infinite',
        'spin-slow':      'spin 8s linear infinite',
        'counter':        'counter 1.5s ease-out forwards',
        'glow-border':    'glowBorder 3s ease-in-out infinite',
        'typing-dot':     'typingDot 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(59,183,255,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(59,183,255,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(59,183,255,0.2)' },
          '50%':      { borderColor: 'rgba(59,183,255,0.6)' },
        },
        typingDot: {
          '0%, 100%': { transform: 'translateY(0)',   opacity: '0.4' },
          '50%':      { transform: 'translateY(-4px)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
}

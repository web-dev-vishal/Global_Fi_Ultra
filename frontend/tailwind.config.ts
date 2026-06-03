import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Global-Fi Ultra premium colour tokens ──────────────────────────
        gf: {
          page:    '#0B1220',
          nav:     '#0D1526',
          card:    '#131D2E',
          raised:  '#1A2540',
          border:  'rgba(100,116,139,0.22)',
          accent:  '#3B82F6',
          success: '#10B981',
          danger:  '#EF4444',
          warning: '#F59E0B',
          purple:  '#8B5CF6',
        },
        'gf-light': {
          page:   '#F8FAFC',
          nav:    '#FFFFFF',
          card:   '#FFFFFF',
          raised: '#F1F5F9',
          border: 'rgba(15,23,42,0.08)',
        },
        // Legacy flat aliases kept for backward compatibility
        bg: {
          page:    '#0B1220',
          card:    '#131D2E',
          sidebar: '#0D1526',
        },
        'bg-page':    '#0B1220',
        'bg-card':    '#131D2E',
        'bg-sidebar': '#0D1526',
        border: {
          DEFAULT: 'rgba(100,116,139,0.22)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.25s ease-out both',
        'fade-in': 'fadeIn 0.2s ease-out both',
        'page-enter': 'pageEnter 0.2s ease-out both',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.75)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pageEnter: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

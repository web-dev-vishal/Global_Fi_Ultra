import type { Config } from 'tailwindcss'

// ═══════════════════════════════════════════════════════════════════════════
//  Global-Fi Ultra — Premium Design System v2.0
//  Inspired by: Linear, Stripe, Vercel, Notion
//  Color philosophy: Ink-dark base, sapphire accent, surgical typography
// ═══════════════════════════════════════════════════════════════════════════

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Primary: Inter for UI — clean, readable, enterprise-grade
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Mono: for prices, codes, numbers — tabular clarity
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        // Display: for hero headings
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ── Design Token Colors ──────────────────────────────────────────────
      colors: {
        // Primary brand — deep navy with blue accent
        gf: {
          // Dark backgrounds — layered depth system
          'bg-0':    '#060C18',   // deepest: page background
          'bg-1':    '#0A1122',   // base layer: sidebar, nav
          'bg-2':    '#0E1628',   // card background
          'bg-3':    '#131D30',   // raised elements
          'bg-4':    '#192438',   // interactive hover states
          'bg-5':    '#1E2B42',   // selected, active states
          'bg-input':'#0C1525',   // form inputs

          // Borders — subtle, precise
          'border-1': 'rgba(148,163,184,0.08)',   // faintest
          'border-2': 'rgba(148,163,184,0.14)',   // default
          'border-3': 'rgba(148,163,184,0.24)',   // medium
          'border-4': 'rgba(148,163,184,0.40)',   // emphasized

          // Text hierarchy — 4-step scale
          'text-0': '#FFFFFF',    // pure white: primary values, prices
          'text-1': '#F0F4FF',    // near-white: headings
          'text-2': '#8B9BB4',    // secondary labels
          'text-3': '#4E5F7A',    // tertiary metadata
          'text-4': '#2E3D57',    // disabled text

          // Sapphire accent system (Stripe-quality)
          'accent-subtle':  '#0B1F3A',   // ghost bg
          'accent-muted':   '#0D3469',   // soft bg
          'accent':         '#2563EB',   // primary blue
          'accent-hover':   '#3B82F6',   // hover state
          'accent-bright':  '#60A5FA',   // highlight, text on dark
          'accent-glow':    'rgba(37,99,235,0.35)',  // shadow glow

          // Semantic colors — precise, intentional
          'success':        '#059669',
          'success-bright': '#34D399',
          'success-subtle': 'rgba(5,150,105,0.12)',

          'warning':        '#D97706',
          'warning-bright': '#FBBF24',
          'warning-subtle': 'rgba(217,119,6,0.12)',

          'danger':         '#DC2626',
          'danger-bright':  '#F87171',
          'danger-subtle':  'rgba(220,38,38,0.12)',

          'info':           '#0891B2',
          'info-bright':    '#22D3EE',
          'info-subtle':    'rgba(8,145,178,0.12)',

          // Violet for AI/special features
          'ai':             '#7C3AED',
          'ai-bright':      '#A78BFA',
          'ai-subtle':      'rgba(124,58,237,0.12)',

          // Gold for premium/pro features
          'gold':           '#B45309',
          'gold-bright':    '#F59E0B',
          'gold-subtle':    'rgba(180,83,9,0.10)',
        },

        // Light mode overrides
        'gf-light': {
          'bg-0':    '#F4F6FA',
          'bg-1':    '#FFFFFF',
          'bg-2':    '#FFFFFF',
          'bg-3':    '#F0F4FA',
          'bg-4':    '#E8EDF6',
          'bg-5':    '#DEEAF8',
          'bg-input':'#F8FAFF',

          'border-1': 'rgba(15,23,42,0.05)',
          'border-2': 'rgba(15,23,42,0.09)',
          'border-3': 'rgba(15,23,42,0.15)',
          'border-4': 'rgba(15,23,42,0.25)',

          'text-0': '#0A0F1E',
          'text-1': '#111827',
          'text-2': '#374151',
          'text-3': '#6B7280',
          'text-4': '#9CA3AF',
        },
      },

      // ── Typography Scale ─────────────────────────────────────────────────
      fontSize: {
        '2xs':  ['10px', { lineHeight: '14px', letterSpacing: '0.02em' }],
        'xs':   ['11px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm':   ['12px', { lineHeight: '18px', letterSpacing: '0.005em' }],
        'base': ['13px', { lineHeight: '20px', letterSpacing: '0' }],
        'md':   ['14px', { lineHeight: '22px', letterSpacing: '-0.005em' }],
        'lg':   ['15px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        'xl':   ['17px', { lineHeight: '26px', letterSpacing: '-0.015em' }],
        '2xl':  ['20px', { lineHeight: '30px', letterSpacing: '-0.02em' }],
        '3xl':  ['24px', { lineHeight: '34px', letterSpacing: '-0.025em' }],
        '4xl':  ['30px', { lineHeight: '38px', letterSpacing: '-0.03em' }],
        '5xl':  ['38px', { lineHeight: '46px', letterSpacing: '-0.035em' }],
      },

      // ── Spacing Scale — 4px base unit ────────────────────────────────────
      spacing: {
        '0.5': '2px',
        '1':   '4px',
        '1.5': '6px',
        '2':   '8px',
        '2.5': '10px',
        '3':   '12px',
        '3.5': '14px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '7':   '28px',
        '8':   '32px',
        '9':   '36px',
        '10':  '40px',
        '11':  '44px',
        '12':  '48px',
        '14':  '56px',
        '16':  '64px',
        '18':  '72px',
        '20':  '80px',
        '24':  '96px',
        '28':  '112px',
        '32':  '128px',
      },

      // ── Border Radius System ─────────────────────────────────────────────
      borderRadius: {
        'none': '0',
        'xs':   '4px',
        'sm':   '6px',
        DEFAULT:'8px',
        'md':   '10px',
        'lg':   '12px',
        'xl':   '14px',
        '2xl':  '16px',
        '3xl':  '20px',
        '4xl':  '24px',
        'full': '9999px',
      },

      // ── Shadow / Elevation System ────────────────────────────────────────
      boxShadow: {
        // UI layer shadows
        'xs':     '0 1px 2px rgba(0,0,0,0.12)',
        'sm':     '0 1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.10)',
        DEFAULT:  '0 2px 8px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.14)',
        'md':     '0 4px 16px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.16)',
        'lg':     '0 8px 32px rgba(0,0,0,0.32), 0 4px 12px rgba(0,0,0,0.18)',
        'xl':     '0 16px 48px rgba(0,0,0,0.36), 0 6px 16px rgba(0,0,0,0.20)',
        '2xl':    '0 24px 64px rgba(0,0,0,0.40), 0 8px 24px rgba(0,0,0,0.22)',

        // Semantic glow shadows
        'accent': '0 0 0 1px rgba(37,99,235,0.5), 0 4px 24px rgba(37,99,235,0.20)',
        'success':'0 4px 16px rgba(5,150,105,0.25)',
        'danger': '0 4px 16px rgba(220,38,38,0.25)',
        'ai':     '0 4px 24px rgba(124,58,237,0.25)',

        // Inner shadows
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.15)',
        'inner':    'inset 0 2px 6px rgba(0,0,0,0.20)',

        // Focus ring
        'focus': '0 0 0 2px rgba(37,99,235,0.45)',
        'none':  'none',
      },

      // ── Animations ───────────────────────────────────────────────────────
      animation: {
        // Loaders
        'spin-slow':  'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',

        // Brand animations
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
        'pulse-dot':  'pulseDot 2.4s ease-in-out infinite',

        // Transitions
        'slide-up':       'slideUp 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'slide-down':     'slideDown 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-left':  'slideInLeft 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':        'fadeIn 0.18s ease-out both',
        'fade-in-scale':  'fadeInScale 0.18s cubic-bezier(0.16,1,0.3,1) both',
        'page-enter':     'pageEnter 0.25s cubic-bezier(0.16,1,0.3,1) both',

        // Micro-interactions
        'bounce-subtle':  'bounceSubtle 0.4s cubic-bezier(0.16,1,0.3,1)',
        'count-up':       'countUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-800px 0' },
          '100%': { backgroundPosition: '800px 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.35', transform: 'scale(0.7)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pageEnter: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(0.95)' },
          '70%':  { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.95)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {

      // ─── Cores ────────────────────────────────────────────────
      colors: {
        // Fundos (dark theme)
        bg: {
          base:     '#0a0c0f',
          panel:    '#111418',
          card:     '#161b22',
          elevated: '#1e2530',
        },

        // Bordas
        border: {
          subtle:  '#1a2030',
          DEFAULT: '#252d3a',
          strong:  '#2e3848',
        },

        // Texto
        text: {
          primary:   '#e8edf2',
          secondary: '#7a8899',
          muted:     '#4a5568',
        },

        // Cor de destaque principal — âmbar elétrico
        amber: {
          50:      '#fffbeb',
          100:     '#fef3c7',
          200:     '#fde68a',
          300:     '#fcd34d',
          400:     '#fbbf24',
          DEFAULT: '#f59e0b',  // primary accent
          600:     '#d97706',
          700:     '#b45309',
          800:     '#92400e',
          900:     '#78350f',
        },

        // Semânticas
        critical: {
          bg:     'rgba(239, 68, 68, 0.10)',
          text:   '#ef4444',
          border: 'rgba(239, 68, 68, 0.30)',
        },
        warning: {
          bg:     'rgba(245, 158, 11, 0.10)',
          text:   '#f59e0b',
          border: 'rgba(245, 158, 11, 0.30)',
        },
        success: {
          bg:     'rgba(34, 197, 94, 0.10)',
          text:   '#22c55e',
          border: 'rgba(34, 197, 94, 0.30)',
        },
        info: {
          bg:     'rgba(59, 130, 246, 0.10)',
          text:   '#3b82f6',
          border: 'rgba(59, 130, 246, 0.30)',
        },
        neutral: {
          bg:     'rgba(122, 136, 153, 0.10)',
          text:   '#7a8899',
          border: 'rgba(122, 136, 153, 0.30)',
        },
      },

      // ─── Tipografia ───────────────────────────────────────────
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        // Labels e metadados
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        xs:    ['11px', { lineHeight: '1.5' }],
        sm:    ['12px', { lineHeight: '1.5' }],

        // Corpo
        base:  ['13px', { lineHeight: '1.6' }],
        md:    ['14px', { lineHeight: '1.6' }],

        // Headings
        lg:    ['16px', { lineHeight: '1.4', fontWeight: '500' }],
        xl:    ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        '2xl': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        '3xl': ['28px', { lineHeight: '1.1', fontWeight: '600' }],
      },

      fontWeight: {
        light:   '300',
        normal:  '400',
        medium:  '500',
        semibold:'600',
      },

      letterSpacing: {
        label: '0.10em',
        mono:  '0.04em',
        tight: '0.01em',
      },

      // ─── Border Radius ────────────────────────────────────────
      borderRadius: {
        sm:   '4px',
        DEFAULT: '6px',
        md:   '6px',
        lg:   '8px',
        xl:   '10px',
        '2xl':'12px',
        full: '9999px',
      },

      // ─── Espaçamento ─────────────────────────────────────────
      // Usa a escala padrão do Tailwind (4px base),
      // com aliases semânticos adicionais
      spacing: {
        px: '1px',
        0:  '0',
        0.5: '2px',
        1:  '4px',
        1.5:'6px',
        2:  '8px',
        2.5:'10px',
        3:  '12px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        7:  '28px',
        8:  '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
        // Aliases de layout
        sidebar:  '220px',
        topbar:   '48px',
        panel:    '320px',
      },

      // ─── Sombras ─────────────────────────────────────────────
      boxShadow: {
        // Sem sombras decorativas — apenas glow funcional
        'amber':   '0 0 0 1px rgba(245, 158, 11, 0.30)',
        'amber-lg':'0 0 12px rgba(245, 158, 11, 0.20)',
        'red':     '0 0 8px rgba(239, 68, 68, 0.30)',
        'green':   '0 0 8px rgba(34, 197, 94, 0.30)',
        'focus':   '0 0 0 2px rgba(245, 158, 11, 0.40)',
        none:      'none',
      },

      // ─── Opacidade ────────────────────────────────────────────
      opacity: {
        0:   '0',
        5:   '0.05',
        10:  '0.10',
        15:  '0.15',
        20:  '0.20',
        30:  '0.30',
        40:  '0.40',
        50:  '0.50',
        60:  '0.60',
        70:  '0.70',
        80:  '0.80',
        90:  '0.90',
        100: '1',
      },

      // ─── Animações ────────────────────────────────────────────
      keyframes: {
        'pulse-amber': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scan': {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
      },

      animation: {
        'pulse-amber':    'pulse-amber 2s ease-in-out infinite',
        'blink':          'blink 1s step-end infinite',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'fade-in':        'fade-in 0.15s ease-out',
        'scan':           'scan 2s linear infinite',
      },

      // ─── Transições ───────────────────────────────────────────
      transitionDuration: {
        fast:   '100ms',
        DEFAULT:'150ms',
        slow:   '250ms',
      },

      // ─── Z-index ─────────────────────────────────────────────
      zIndex: {
        base:    '0',
        raised:  '10',
        overlay: '20',
        modal:   '30',
        toast:   '40',
        top:     '50',
      },
    },
  },

  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Token-backed semantic colors */
        bg:          'var(--bg)',
        'bg-deep':   'var(--bg-deep)',
        surface:     'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',

        border:        'var(--border)',
        'border-subtle':'var(--border-subtle)',

        text:          'var(--text)',
        'text-strong': 'var(--text-strong)',
        'text-muted':  'var(--text-muted)',
        'text-dimmed': 'var(--text-dimmed)',

        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          muted:   'var(--accent-muted)',
          subtle:  'var(--accent-subtle)',
        },

        destructive: {
          DEFAULT: 'var(--destructive)',
          hover:   'var(--destructive-hover)',
        },
        warning:  'var(--warning)',
        success:  'var(--success)',
        info:     'var(--info)',

        selection: 'var(--selection)',

        /* Legacy compat — keeps old Tailwind class names working during migration */
        background:  'var(--bg)',
        foreground:  'var(--text)',
        input:       'var(--surface-2)',
        ring:        'var(--focus-ring)',
        primary: {
          DEFAULT:    'var(--accent)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT:    'var(--surface-2)',
          foreground: 'var(--text)',
        },
        muted: {
          DEFAULT:    'var(--surface-2)',
          foreground: 'var(--text-muted)',
        },
        card: {
          DEFAULT:    'var(--surface)',
          foreground: 'var(--text)',
        },
        popover: {
          DEFAULT:    'var(--surface)',
          foreground: 'var(--text)',
        },
      },
      borderRadius: {
        xs:  'var(--radius-xs)',
        sm:  'var(--radius-sm)',
        md:  'var(--radius-md)',
        lg:  'var(--radius-lg)',
        xl:  'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs:   'var(--text-xs)',
        sm:   'var(--text-sm)',
        base: 'var(--text-base)',
        md:   'var(--text-md)',
        lg:   'var(--text-lg)',
        xl:   'var(--text-xl)',
      },
      spacing: {
        'px':  '1px',
        '0.5': '2px',
        '1':   '4px',
        '1.5': '6px',
        '2':   '8px',
        '2.5': '10px',
        '3':   '12px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '8':   '32px',
        '10':  '40px',
        '12':  '48px',
      },
      boxShadow: {
        xs:  'var(--shadow-xs)',
        sm:  'var(--shadow-sm)',
        md:  'var(--shadow-md)',
        lg:  'var(--shadow-lg)',
        xl:  'var(--shadow-xl)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      animation: {
        'slide-up':    'slideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':     'fadeIn 0.18s ease-out',
        'pop':         'pop 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        'msg-in':      'msgIn 0.22s cubic-bezier(0.16,1,0.3,1)',
        'bounce-dot':  'bounceDot 1.2s ease-in-out infinite',
        'pulse-soft':  'pulseSoft 2.4s ease-in-out infinite',
        'spin-fast':   'spin 0.7s linear infinite',
        'shimmer':     'shimmer 1.6s ease-in-out infinite',
        'sidebar-in':  'sidebarIn 0.28s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pop: {
          from: { opacity: '0', transform: 'scale(0.88)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        msgIn: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)',   opacity: '0.35' },
          '30%':           { transform: 'translateY(-7px)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition:  '600px 0' },
        },
        sidebarIn: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'ai':     '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
        'user':   '0 4px 16px rgba(99,102,241,0.35)',
        'input':  '0 0 0 3px rgba(99,102,241,0.12)',
        'header': '0 1px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
        'card':   '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'glow':   '0 0 20px rgba(99,102,241,0.25)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34,1.56,0.64,1)',
        smooth: 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};

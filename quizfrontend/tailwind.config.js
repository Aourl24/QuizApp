/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:        '#111213',
        surface:   '#1a1b1e',
        surface2:  '#222428',
        border:    '#2e3035',
        accent:    '#b8ff57',
        'accent-dk': '#8fcc3a',
        danger:    '#ff5757',
        warn:      '#ffb347',
        txt:       '#e8e9eb',
        muted:     '#7a7d87',
      },
      fontFamily: {
        head: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
      },
      keyframes: {
        popIn: {
          '0%':   { opacity: '0', transform: 'scale(0.88)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateX(-50%) translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'pop-in':    'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-down':'slideDown 0.3s ease',
        'pulse-ring':'pulse 0.6s infinite',
      },
    },
  },
  plugins: [],
}

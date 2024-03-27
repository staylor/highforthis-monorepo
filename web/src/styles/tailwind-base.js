const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    screens: {
      xs: '320px',
      ...defaultTheme.screens,
    },
    extend: {
      lineHeight: {
        zero: 0,
      },
      minWidth: {
        nav: '10rem', // 160px
      },
      zIndex: {
        top: 100000,
        close: 100001,
      },
      spacing: {
        0.75: '0.1875rem', // 3px
        7.5: '1.875rem', // 30px
        12.5: '3.125rem', // 50px
        13: '3.25rem', // 52px
        15: '3.75rem', // 60px
        19: '4.75rem', // 76px
        25: '6.25rem', // 100px
        30: '7.5rem', // 120px
        50: '12.5rem', // 200px
        70: '17.5rem', // 280px
        75: '18.75rem', // 300px
        150: '37.5rem', // 600px
        160: '40rem', // 640px
      },
      colors: {
        dark: '#262626',
        pink: {
          ...defaultTheme.colors.pink,
          DEFAULT: '#e50082',
        },
        detail: '#d1d5db',
        'detail-dark': '#4b5563',
      },
      fontFamily: {
        stylized: 'cubano, sans-serif',
        text: 'proxima-nova, sans-serif',
        georgia: 'Georgia, serif',
        dashicons: 'dashicons',
        icons: 'icons',
        code: '"Inconsolata", "Menlo", "Consolas", monospace',
      },
      content: {
        // dashicons
        checkmark: '"\\f147"',
        collapse: '"\\f148"',
        dismiss: '"\\f153"',
      },
      animation: {
        'loading-1': 'loading 2s infinite ease-in-out',
        'loading-2': 'loading 2s infinite -1s ease-in-out',
      },
      keyframes: {
        loading: {
          '0%, 100%': {
            transform: 'scale(0)',
          },
          '50%': {
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

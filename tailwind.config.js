/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './src/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'apex-black': 'rgba(17, 24, 39, 1)',
        'apex-grey': 'rgba(113, 128, 150, 1)',
        'apex-grey-deep': 'rgba(121, 123, 137, 1)',
        'apex-grey-2': 'rgba(238, 239, 242, 1)',
        'apex-green': 'rgba(12, 175, 96, 1)',
        'apex-orange': 'rgba(254, 150, 74, 1)',
        'apex-light-white': 'rgba(250, 250, 250, 1)',
        'apex-light-green': 'rgba(231, 247, 239, 1)',
        'apex-light-orange': 'rgba(255, 240, 230, 1)',
        'apex-ash': 'rgba(237, 242, 247, 1)',
        'apex-paid': 'rgba(140, 98, 255, 1)',
        'apex-paid-light': 'rgba(244, 240, 255, 1)',
        'apex-unpaid': 'rgba(212, 167, 1, 1)',
        'apex-unpaid-light': 'rgba(254, 247, 220, 1)',
        'apex-overdue': 'rgba(253, 106, 106, 1)',
        'apex-overdue-light': '#FFF0F0',
        'apex-table-header': '#718096',
        'apex-table-highlight': 'rgba(249, 250, 251, 1)',
        'apex-table-checkmark': '#CBD5E0',

        'apex-content': {
          body: 'rgba(56, 58, 71, 1)',
          secondary: 'rgba(136, 136, 138, 1)'
        },
        accent: {
          blue: {
            50: 'rgba(229, 238, 254, 1)'
          }
        },
        'apex-danger': 'rgba(211, 0, 0, 1)'
      },
      fontFamily: {
        apex: ['GeneralSans', 'sans-serif']
      }
    }
  },
  plugins: []
}

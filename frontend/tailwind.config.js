/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-page':    '#0B1220',
        'bg-card':    '#131D2E',
        'bg-sidebar': '#0D1526',
      },
    },
  },
  plugins: [],
}

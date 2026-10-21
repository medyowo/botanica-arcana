/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F5F2EB',
          dark: '#EBE5D8',
        },
        sage: '#A7D18E',
        forest: '#48742F',
        darkforest: '#3B4834',
        darkwood: '#7A684D',
        gold: '#C7B43A',
      },
      fontFamily: {
        grimoire: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'], // ou autre police de corps sobre
      },
    },
  },
  plugins: [],
}
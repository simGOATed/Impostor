/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [  
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'among-red': '#C51111',
        'among-blue': '#132FD2',
        'among-green': '#127F2D',
        'among-pink': '#ED53B4',
        'among-orange': '#EF7D0D',
        'among-yellow': '#F5F557',
        'among-black': '#3F474E',
        'among-white': '#D6E0F0',
        'among-purple': '#6B2FBB',
        'among-brown': '#71491E',
        'among-cyan': '#38FFDD',
        'among-lime': '#50EF39',
      },
      backgroundImage: {
        'space-pattern': `url(./src/background.jpg)`,
      }
    },
  },
  plugins: [],
} 
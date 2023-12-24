const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {
      black: colors.black,
      'blue-200': colors.blue[200],
      'blue-500': colors.blue[500],
      'blue-700': colors.blue[700],
      'discord-blurple': '#5865f2',
      grey1: '#202225',
      grey2: '#2f3136',
      'grey-400': colors.gray[400],
      'pink-600': colors.pink[600],
      'purple-600': colors.purple[600],
      'purple-900': colors.purple[900],
      'red-500': colors.red[500],
      'sky-300': colors.sky[300],
      'slate-400': colors.slate[400],
      white: colors.white,
      'yellow-500': colors.yellow[500],
    },
    extend: {},
  },
  plugins: [],
}

module.exports = config
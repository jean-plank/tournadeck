const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

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

      orange: '#E58E5E',
      green1: '#25787F',
      green2: '#87AD92',
      white1: '#FEFCF7',
      yellow1: '#FEFCF7',
      yellow2: '#FDEA95',
    },
    extend: {
      borderRadius: {
        '1/2': '50%',
      },
      boxShadow: {
        even: '0 0 8px 0 var(--tw-shadow-color)',
      },
      gridArea: {
        1: '1 / 1', // useful for superposing multiple elements in a grid element
      },
      textShadow: {
        DEFAULT: '0 0 5px var(--tw-shadow-color)',
      },
    },
  },
  plugins: [
    /**
     * Plugin for grid-area:
     * - `area-{name}`: define grid-area (customize in theme)
     */
    plugin(({ matchUtilities, theme }) =>
      matchUtilities({ area: gridArea => ({ gridArea }) }, { values: theme('gridArea') }),
    ),

    /**
     * Plugin for text-shadow:
     * - `text-shadow-{name}`: add some text-shadow (customize in theme)
     * - `shadow-{color}`: text-shadow color
     */
    plugin(({ matchUtilities, theme }) =>
      matchUtilities(
        { 'text-shadow': textShadow => ({ textShadow }) },
        { values: theme('textShadow') },
      ),
    ),
  ],
}

module.exports = config

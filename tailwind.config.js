const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    fontFamily: {
      baloo: ['var(--font-baloo2)'],
      'lib-mono': ['var(--font-liberationMono)'],
      friz: ['var(--font-friz)'],
    },
    colors: {
      black: colors.black,
      blue1: '#010d17',
      'blue-200': colors.blue[200],
      'blue-500': colors.blue[500],
      'blue-700': colors.blue[700],
      brown: '#725a34',
      'dark-red': '#261622',
      'discord-blurple': '#5865f2',
      green1: '#25787f',
      grey1: '#202225',
      grey2: '#2f3136',
      'grey-400': colors.gray[400],
      'grey-500': colors.gray[500],
      'pink-600': colors.pink[600],
      'purple-600': colors.purple[600],
      'purple-900': colors.purple[900],
      'red-500': colors.red[500],
      'sky-300': colors.sky[300],
      'slate-400': colors.slate[400],
      'slate-900': colors.slate[900],
      'slate-950': colors.slate[950],
      transparent: colors.transparent,
      white: colors.white,
      white1: '#fefcf7',
      'yellow-500': colors.yellow[500],
      'zinc-700': colors.zinc[700],
      'zinc-900': colors.zinc[900],
      'zinc-950': colors.zinc[950],

      goldenrod: 'goldenrod',
      'goldenrod-bis': '#b58703',
      wheat: 'wheat',
      'wheat-bis': '#c8ab6d',

      'match-blue': '#04285c',
      'match-red': '#411a21',

      ocre: '#b07636',
      burgundy: '#5f405d',
      'dark-blue': '#0c1a31',
      'blue-grey': '#24304c',
      beige: '#f4cbab',
    },
    extend: {
      borderRadius: {
        '1/2': '50%',
      },
      boxShadow: {
        even: '0 0 8px 0 var(--tw-shadow-color)',
      },
      data: {
        'popper-top': "popper-placement^='top'",
        'popper-bottom': "popper-placement^='bottom'",
        'popper-left': "popper-placement^='left'",
        'popper-right': "popper-placement^='right'",
      },
      gridArea: {
        1: '1 / 1', // useful for superposing multiple elements in a grid element
      },
      lineHeight: {
        2.5: '.625rem',
        // 3: '.75rem',
        3.5: '.875rem',
        // 4: '1rem',
      },
      textShadow: {
        DEFAULT: '0 0 5px var(--tw-shadow-color)',
      },
      verticalEllipsisClamp: {
        2: '2',
        3: '3',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
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

    /**
     * Plugin for vertical ellipsis:
     * - `vertical-ellipsis-{clamp}`
     *
     * https://stackoverflow.com/a/34559614
     */
    plugin(({ matchUtilities, theme }) =>
      matchUtilities(
        {
          'vertical-ellipsis': clamp => ({
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: clamp,
          }),
        },
        { values: theme('verticalEllipsisClamp') },
      ),
    ),
  ],
}

module.exports = config

import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      'discord-blurple': '#5865f2',
      white: colors.white,
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

export default config

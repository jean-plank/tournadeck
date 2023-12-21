import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {
      ...colors,
      black: colors.black,
      'blue-500': colors.blue[500],
      'blue-700': colors.blue[700],
      'discord-blurple': '#5865f2',
      'grey-400': colors.gray[400],
      'pink-600': colors.pink[600],
      'purple-600': colors.purple[600],
      'purple-900': colors.purple[900],
      'red-500': colors.red[500],
      'slate-400': colors.slate[400],
      white: colors.white,
      'yellow-500': colors.yellow[500],
    },
    extend: {},
  },
  plugins: [],
}

export default config

import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {
      black: colors.black,
      'discord-blurple': '#5865f2',
      white: colors.white,
    },
    extend: {},
  },
  plugins: [],
}

export default config

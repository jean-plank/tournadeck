const ellipse =
  (take: number) =>
  (str: string): string =>
    take < str.length && 3 <= take ? `${str.slice(0, take - 3)}...` : str

const margin = /^\s*\|/gm
const stripMargins = (str: string): string => str.replace(margin, '')

export const StringUtils = { ellipse, stripMargins }

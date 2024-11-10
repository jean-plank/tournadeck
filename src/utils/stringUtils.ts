import { constants } from '../config/constants'

export const ellipse =
  (take: number) =>
  (str: string): string =>
    take < str.length && 3 <= take ? `${str.slice(0, take - 3)}...` : str

export function cleanUTF8ToASCII(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function formatNumber(n: number, digits: number = 0): string {
  return n.toLocaleString(constants.locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

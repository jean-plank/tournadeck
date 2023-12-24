export const ellipse =
  (take: number) =>
  (str: string): string =>
    take < str.length && 3 <= take ? `${str.slice(0, take - 3)}...` : str

export function cleanUTF8ToASCII(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

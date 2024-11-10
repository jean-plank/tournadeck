export function round(n: number, precision: number): number {
  const e = 10 ** precision

  return Math.round(n * e) / e
}

import { Duration } from 'effect'
import type { DurationInput } from 'effect/Duration'

const ellipse =
  (take: number) =>
  (str: string): string =>
    take < str.length && 3 <= take ? `${str.slice(0, take - 3)}...` : str

function prettyDuration(duration: DurationInput): string {
  return `${Duration.toMillis(duration)}ms`
}

const margin = /^\s*\|/gm
function stripMargins(str: string): string {
  return str.replace(margin, '')
}

export const StringUtils = { ellipse, prettyDuration, stripMargins }

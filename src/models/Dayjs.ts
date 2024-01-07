import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat'
import type { Duration } from 'dayjs/plugin/duration'
import durationPlugin from 'dayjs/plugin/duration'
import relativeTimePlugin from 'dayjs/plugin/relativeTime'
import timezonePlugin from 'dayjs/plugin/timezone'
import utcPlugin from 'dayjs/plugin/utc'
import { number, ord } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import { immutableAssign } from '../utils/fpTsUtils'

dayjs.extend(customParseFormatPlugin)
dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)
dayjs.extend(relativeTimePlugin) // needed for durationPlugin
dayjs.extend(durationPlugin)

dayjs.locale('fr')

/**
 * Dayjs
 */

type Dayjs = dayjs.Dayjs

// constructors

type OfOptions = {
  locale?: boolean
}

function construct(date: string | number | Date): dayjs.Dayjs
function construct(date: string, format: string, options?: OfOptions): dayjs.Dayjs
function construct(
  date: number | Date | string,
  format?: string,
  { locale = false }: OfOptions = {},
): dayjs.Dayjs {
  return (locale ? dayjs : dayjs.utc)(date, format, true)
}

const now: () => dayjs.Dayjs = dayjs.utc

const Dayjs = immutableAssign(construct, { now })

export { Dayjs }

/**
 * DayjsDuration
 */

type DayjsDuration = Duration

const durationOrd = pipe(
  number.Ord,
  ord.contramap((b: DayjsDuration) => b.asMilliseconds()),
)

const DayjsDuration = immutableAssign(dayjs.duration, { Ord: durationOrd })

export { DayjsDuration }

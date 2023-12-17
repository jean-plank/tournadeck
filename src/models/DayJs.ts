import type { ManipulateType } from 'dayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat'
import timezonePlugin from 'dayjs/plugin/timezone'
import utcPlugin from 'dayjs/plugin/utc'
import { identity } from 'fp-ts/function'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../utils/fpTsUtils'

dayjs.extend(customParseFormatPlugin)
dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)
dayjs.locale('fr')

type DayJs = Newtype<{ readonly DayJs: unique symbol }, dayjs.Dayjs>

const { wrap, unwrap } = iso<DayJs>()
const modify = identity as (f: (d: dayjs.Dayjs) => dayjs.Dayjs) => (d: DayJs) => DayJs

// constructors

type OfOptions = {
  locale?: boolean
}

function construct(date: string | number | Date): DayJs
function construct(date: string, format: string, options?: OfOptions): DayJs
function construct(
  date: number | Date | string,
  format?: string,
  { locale = false }: OfOptions = {},
): DayJs {
  return wrap((locale ? dayjs : dayjs.utc)(date, format, true))
}

const now = (): DayJs => wrap(dayjs.utc())

// modifiers

const add = (value: number, unit?: ManipulateType): ((d: DayJs) => DayJs) =>
  modify(d => d.add(value, unit))

const subtract = (value: number, unit?: ManipulateType): ((d: DayJs) => DayJs) =>
  modify(d => d.subtract(value, unit))

const startOf = (unit: dayjs.OpUnitType): ((d: DayJs) => DayJs) => modify(d => d.startOf(unit))

// outputs

const toDate = (date: DayJs): Date => unwrap(date).toDate()

const toISOString = (date: DayJs): string => unwrap(date).toISOString()

const DayJs = immutableAssign(construct, { now, add, subtract, startOf, toDate, toISOString })

export { DayJs }

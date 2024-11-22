import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../utils/fpTsUtils'
import { fromNewtype } from '../utils/ioTsUtils'
import { DayjsDuration } from './Dayjs'

type MsDuration = Newtype<{ readonly MsDuration: unique symbol }, number>

const { wrap, unwrap } = iso<MsDuration>()

const fromDayJs = (d: DayjsDuration): MsDuration => wrap(d.asMilliseconds())

const toDayJs = (d: MsDuration): DayjsDuration => DayjsDuration(unwrap(d))

const codec = fromNewtype<MsDuration>(C.number)

const MsDuration = immutableAssign(wrap, { fromDayJs, toDayJs, codec })

export { MsDuration }

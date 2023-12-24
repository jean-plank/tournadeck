import { eq, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../utils/fpTsUtils'
import { fromNewtype } from '../../utils/ioTsUtils'

type DDragonVersion = Newtype<{ readonly DDragonVersion: unique symbol }, string>

const { wrap, unwrap } = iso<DDragonVersion>()

const codec = fromNewtype<DDragonVersion>(C.string)

const Eq: eq.Eq<DDragonVersion> = pipe(string.Eq, eq.contramap(unwrap))

const DDragonVersion = immutableAssign(wrap, { unwrap, codec, Eq })

export { DDragonVersion }

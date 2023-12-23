import { eq, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../../utils/fpTsUtils'
import { fromNewtype } from '../../../../utils/ioTsUtils'

type MatchId = Newtype<{ readonly MatchId: unique symbol }, string>

const { wrap, unwrap } = iso<MatchId>()

const codec = fromNewtype<MatchId>(C.string)

const Eq: eq.Eq<MatchId> = pipe(string.Eq, eq.contramap(unwrap))

const MatchId = immutableAssign(wrap, { unwrap, codec, Eq })

export { MatchId }

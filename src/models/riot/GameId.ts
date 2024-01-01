import { eq, number } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import { type Newtype, iso } from 'newtype-ts'

import { immutableAssign } from '../../utils/fpTsUtils'
import { fromNewtype } from '../../utils/ioTsUtils'

type GameId = Newtype<{ readonly GameId: unique symbol }, number>

const { wrap, unwrap } = iso<GameId>()

const codec = fromNewtype<GameId>(C.number)

const Eq: eq.Eq<GameId> = pipe(number.Eq, eq.contramap(unwrap))

const GameId = immutableAssign(wrap, { unwrap, codec, Eq })

export { GameId }

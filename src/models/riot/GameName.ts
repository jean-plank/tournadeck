import { eq, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import { type Newtype, iso } from 'newtype-ts'

import { immutableAssign } from '../../utils/fpTsUtils'
import { fromNewtype } from '../../utils/ioTsUtils'

type GameName = Newtype<{ readonly GameName: unique symbol }, string>

const { wrap, unwrap } = iso<GameName>()

const codec = fromNewtype<GameName>(C.string)

const Eq: eq.Eq<GameName> = pipe(string.Eq, eq.contramap(unwrap))

const GameName = immutableAssign(wrap, { unwrap, codec, Eq })

export { GameName }

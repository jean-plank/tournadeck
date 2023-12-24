import { eq, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import { type Newtype, iso } from 'newtype-ts'

import { immutableAssign } from '../../utils/fpTsUtils'
import { fromNewtype } from '../../utils/ioTsUtils'

// Champion's name, but without special chars
// MonkeyKing, ChoGath...

type ChampionId = Newtype<{ readonly ChampionId: unique symbol }, string>

const { wrap, unwrap } = iso<ChampionId>()

const codec = fromNewtype<ChampionId>(C.string)

const Eq: eq.Eq<ChampionId> = pipe(string.Eq, eq.contramap(unwrap))

const ChampionId = immutableAssign(wrap, { unwrap, codec, Eq })

export { ChampionId }

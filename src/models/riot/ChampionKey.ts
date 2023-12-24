import { eq, number } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../utils/fpTsUtils'
import { fromNewtype } from '../../utils/ioTsUtils'

// Champion's number id

type ChampionKey = Newtype<{ readonly ChampionKey: unique symbol }, number>

const { wrap, unwrap } = iso<ChampionKey>()

const codec = fromNewtype<ChampionKey>(C.number)

const Eq: eq.Eq<ChampionKey> = pipe(number.Eq, eq.contramap(unwrap))

const ChampionKey = immutableAssign(wrap, { unwrap, codec, Eq })

export { ChampionKey }

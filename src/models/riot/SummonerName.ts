import { eq, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import { type Newtype, iso } from 'newtype-ts'

import { immutableAssign } from '../../utils/fpTsUtils'
import { fromNewtype } from '../../utils/ioTsUtils'

type SummonerName = Newtype<{ readonly SummonerName: unique symbol }, string>

const { wrap, unwrap } = iso<SummonerName>()

const codec = fromNewtype<SummonerName>(C.string)

const Eq: eq.Eq<SummonerName> = pipe(string.Eq, eq.contramap(unwrap))

const SummonerName = immutableAssign(wrap, { unwrap, codec, Eq })

export { SummonerName }

import { eq, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import { type Newtype, iso } from 'newtype-ts'

import { immutableAssign } from '../../utils/fpTsUtils'
import { fromNewtype } from '../../utils/ioTsUtils'

type TagLine = Newtype<{ readonly TagLine: unique symbol }, string>

const { wrap, unwrap } = iso<TagLine>()

const codec = fromNewtype<TagLine>(C.string)

const Eq: eq.Eq<TagLine> = pipe(string.Eq, eq.contramap(unwrap))

const TagLine = immutableAssign(wrap, { unwrap, codec, Eq })

export { TagLine }

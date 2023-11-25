import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'

import { fromNewtype } from '../../utils/ioTsUtils'

type RefreshToken = Newtype<{ readonly RefreshToken: unique symbol }, string>

const codec = fromNewtype<RefreshToken>(C.string)

const RefreshToken = { codec }

export { RefreshToken }

import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'

import { fromNewtype } from '../../utils/ioTsUtils'

type ClientSecret = Newtype<{ readonly ClientSecret: unique symbol }, string>

const codec = fromNewtype<ClientSecret>(C.string)

const ClientSecret = { codec }

export { ClientSecret }

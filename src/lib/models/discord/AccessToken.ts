import * as C from 'io-ts/Codec'
import { type Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../../utils/ioTsUtils'

type AccessToken = Newtype<{ readonly AccessToken: unique symbol }, string>

const { unwrap } = iso<AccessToken>()

const codec = fromNewtype<AccessToken>(C.string)

const AccessToken = { unwrap, codec }

export { AccessToken }

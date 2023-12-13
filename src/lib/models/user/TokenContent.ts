import * as C from 'io-ts/Codec'

import { UserId } from './UserId'

type TokenContent = C.TypeOf<typeof codec>

const codec = C.struct({
  id: UserId.codec,
  // permission: TODO
})

const TokenContent = { codec }

export { TokenContent }

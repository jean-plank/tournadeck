import * as C from 'io-ts/Codec'

import { UserDiscordInfos } from './UserDiscordInfos'
import { UserId } from './UserId'

type User = C.TypeOf<typeof codec>
type UserOutput = C.OutputOf<typeof codec>

const codec = C.struct({
  id: UserId.codec,
  // permissions // TODO
  discord: UserDiscordInfos.codec,
})

const User = { codec }

export { User, type UserOutput }

import * as C from 'io-ts/Codec'

import { DayJsFromDate } from '../../utils/ioTsUtils'
import { AccessToken } from '../discord/AccessToken'
import { DiscordUserId } from '../discord/DiscordUserId'
import { RefreshToken } from '../discord/RefreshToken'

type UserDiscordInfos = C.TypeOf<typeof codec>

const codec = C.struct({
  id: DiscordUserId.codec,
  username: C.string,
  accessToken: AccessToken.codec,
  expiresAt: DayJsFromDate.codec,
  refreshToken: RefreshToken.codec,
})

const UserDiscordInfos = { codec }

export { UserDiscordInfos }

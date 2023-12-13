import * as E from 'io-ts/Encoder'

import { ClientSecret } from './ClientSecret'
import { DiscordUserId } from './DiscordUserId'
import { RefreshToken } from './RefreshToken'

type OAuth2RefreshTokenPayload = E.TypeOf<typeof encoder>

const encoder = E.struct({
  client_id: DiscordUserId.codec,
  client_secret: ClientSecret.codec,
  grant_type: E.id<'refresh_token'>(),

  refresh_token: RefreshToken.codec,
})

const OAuth2RefreshTokenPayload = { encoder }

export { OAuth2RefreshTokenPayload }

import * as E from 'io-ts/Encoder'

import { ClientSecret } from './ClientSecret'
import { DiscordUserId } from './DiscordUserId'
import { OAuth2Code } from './OAuth2Code'

type OAuth2AuthorizationCodePayload = E.TypeOf<typeof encoder>

const encoder = E.struct({
  client_id: DiscordUserId.codec,
  client_secret: ClientSecret.codec,
  grant_type: E.id<'authorization_code'>(),
  code: OAuth2Code.codec,
  redirect_uri: E.id<string>(),
})

const OAuth2AuthorizationCodePayload = { encoder }

export { OAuth2AuthorizationCodePayload }

import * as E from 'io-ts/Encoder'

import { NonEmptyArrayFromString } from '../../utils/ioTsUtils'
import { DiscordUserId } from './DiscordUserId'
import { Scope } from './Scope'

type OAuth2SearchParams = E.TypeOf<typeof encoder>

const encoder = E.struct({
  client_id: DiscordUserId.codec,
  redirect_uri: E.id<string>(),
  response_type: E.id<'code'>(),
  scope: NonEmptyArrayFromString.encoder(' ')(Scope.encoder),
  state: E.id<string>(),
  /**
   * `prompt` controls how the authorization flow handles existing authorizations.
   * If a user has previously authorized your application with the requested scopes and
   * `prompt` is set to `consent`, it will request them to reapprove their authorization.
   * If set to `none`, it will skip the authorization screen and redirect them back to
   * your redirect URI without requesting their authorization.
   */
  prompt: E.id<'consent' | 'none'>(),
})

const OAuth2SearchParams = { encoder }

export { OAuth2SearchParams }

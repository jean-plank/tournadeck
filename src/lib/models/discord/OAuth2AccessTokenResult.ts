import { Duration, pipe } from 'effect'
import * as D from 'io-ts/Decoder'

import { NonEmptyArrayFromString } from '../../utils/ioTsUtils'
import { AccessToken } from './AccessToken'
import { RefreshToken } from './RefreshToken'
import { Scope } from './Scope'

type OAuth2AccessTokenResult = D.TypeOf<typeof decoder>

const decoder = D.struct({
  access_token: AccessToken.codec,
  expires_in: pipe(D.number, D.map(Duration.seconds)),
  refresh_token: RefreshToken.codec,
  scope: NonEmptyArrayFromString.decoder(' ')(Scope.decoder),
  token_type: D.literal('Bearer'),
})

const OAuth2AccessTokenResult = { decoder }

export { OAuth2AccessTokenResult }

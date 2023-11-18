import 'server-only'

import { Effect, pipe } from 'effect'
import * as D from 'io-ts/Decoder'

import { DiscordUserId } from '@/models/DiscordUserId'
import { EffecT, effectFromEither } from '@/utils/fp'
import { DecodeError, decodeError } from '@/utils/ioTsUtils'

type ServerConfig = D.TypeOf<typeof decoder>

const decoder = D.struct({
  DISCORD_CLIENT_ID: DiscordUserId.codec,
  DISCORD_REDIRECT_URI: D.string,
})

const load: EffecT<never, DecodeError, ServerConfig> = pipe(
  Effect.sync(() => process.env),
  Effect.flatMap(u =>
    pipe(
      decoder.decode(u),
      effectFromEither,
      Effect.mapError(decodeError('ServerConfig' /* TODO: use ts-macros to get name */)(u)),
    ),
  ),
)

const ServerConfig = { load }

export { ServerConfig }

import 'server-only'

import { Effect, pipe } from 'effect'
import * as D from 'io-ts/Decoder'

import { DiscordUserId } from './models/DiscordUserId'
import { LevelWithSilent } from './models/LevelWithSilent'
import type { EffecT } from './utils/fp'
import { decodeEffecT } from './utils/fp'
import { $decoderWithName } from './utils/macros'

type ServerConfig = D.TypeOf<typeof decoder>

const decoder = D.struct({
  LOG_LEVEL: LevelWithSilent.decoder,

  DB_HOST: D.string,
  DB_USERNAME: D.string,
  DB_PASSWORD: D.string,
  DB_NAME: D.string,

  DISCORD_CLIENT_ID: DiscordUserId.codec,
  DISCORD_REDIRECT_URI: D.string,
})

const load: EffecT<ServerConfig> = pipe(
  Effect.sync(() => process.env),
  Effect.flatMap(i => decodeEffecT($decoderWithName!(ServerConfig))(i)),
)

const ServerConfig = { decoder, load }

export { ServerConfig }

import 'server-cli-only'

import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import type pino from 'pino'
import type { IsEqual } from 'type-fest'

import { eitherGetOrThrow } from './utils/fpTsUtils'
import { decodeError } from './utils/ioTsUtils'
import type { Expect } from './utils/typeUtils'

const levelDecoder = D.literal('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Test = Expect<IsEqual<D.TypeOf<typeof levelDecoder>, pino.LevelWithSilent>>

type Config = D.TypeOf<typeof decoder>

const decoder = D.struct({
  LOG_LEVEL: levelDecoder,

  POCKET_BASE_ADMIN_EMAIL: D.string,
  POCKET_BASE_ADMIN_PASSWORD: D.string,

  DISCORD_CLIENT_ID: D.string,
  DISCORD_CLIENT_SECRET: D.string,

  THE_QUEST_API_URL: D.string,

  NEXT_PUBLIC_POCKET_BASE_URL: D.string,
})

function load(): Config {
  return pipe(
    decoder.decode(process.env),
    either.mapLeft(decodeError('Config')(process.env)),
    eitherGetOrThrow,
  )
}

const Config = { load }

export { Config }

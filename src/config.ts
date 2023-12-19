import 'server-cli-only'

import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { eitherGetOrThrow } from './utils/fpTsUtils'
import { decodeError } from './utils/ioTsUtils'

export type Config = D.TypeOf<typeof decoder>

const decoder = D.struct({
  POCKET_BASE_ADMIN_EMAIL: D.string,
  POCKET_BASE_ADMIN_PASSWORD: D.string,

  DISCORD_CLIENT_ID: D.string,
  DISCORD_CLIENT_SECRET: D.string,

  NEXT_PUBLIC_POCKET_BASE_URL: D.string,
})

export const config: Config = pipe(
  decoder.decode(process.env),
  either.mapLeft(decodeError('Config')(process.env)),
  eitherGetOrThrow,
)

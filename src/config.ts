import 'server-cli-only'

import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { eitherGetOrThrow } from './utils/fpTsUtils'
import { BooleanFromString, decodeError } from './utils/ioTsUtils'

export type Config = D.TypeOf<typeof decoder>

const decoder = D.struct({
  ADMIN_PB_USERNAME: D.string,
  ADMIN_PB_PASSWORD: D.string,

  APPLY_FIXTURES: BooleanFromString.decoder,

  NEXT_PUBLIC_POCKET_BASE_URL: D.string,
})

export const config: Config = pipe(
  decoder.decode(process.env),
  either.mapLeft(decodeError('Config')(process.env)),
  eitherGetOrThrow,
)

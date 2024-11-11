import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { draftlolLink } from '../helpers/draftlolLink'
import { ChampionKey } from '../models/riot/ChampionKey'
import { eitherGetOrThrow } from '../utils/fpTsUtils'
import { decodeError } from '../utils/ioTsUtils'
import { loadDotenv } from './helpers/loadDotenv'

loadDotenv()

const argvDecoder = D.tuple(
  D.id<unknown>(),
  D.id<unknown>(),
  pipe(
    D.string,
    D.parse(str =>
      pipe(
        json.parse(str),
        either.fold(() => D.failure(str, 'JsonFromString'), D.success),
      ),
    ),
    D.compose(D.array(ChampionKey.codec)),
  ),
)

async function draftlolLink_(): Promise<void> {
  const [, , championsToBan] = pipe(
    argvDecoder.decode(process.argv),
    either.mapLeft(decodeError('Argv')(process.argv)),
    eitherGetOrThrow,
  )

  const link = draftlolLink(championsToBan)

  console.log()
  console.log(link)
  console.log()
}

draftlolLink_()

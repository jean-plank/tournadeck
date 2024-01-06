import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { getDraftlolLink } from '../helpers/getDraftlolLink'
import { TournamentId } from '../models/pocketBase/tables/Tournament'
import { ChampionId } from '../models/riot/ChampionId'
import { decodeError } from '../utils/ioTsUtils'
import { loadDotenv } from './helpers/loadDotenv'

loadDotenv()

const argvDecoder = D.tuple(
  D.id<unknown>(),
  D.id<unknown>(),
  TournamentId.codec,
  pipe(
    D.string,
    D.parse(str =>
      pipe(
        json.parse(str),
        either.fold(() => D.failure(str, 'JsonFromString'), D.success),
      ),
    ),
    D.compose(D.array(ChampionId.codec)),
  ),
)

async function draftlolLink(): Promise<void> {
  const [, , cacheForTournament, championsToBan] = pipe(
    argvDecoder.decode(process.argv),
    either.getOrElseW(e => {
      throw decodeError('Argv')(process.argv)(e)
    }),
  )

  const link = await getDraftlolLink(cacheForTournament, championsToBan)

  console.log()
  console.log(link)
  console.log()
}

draftlolLink()

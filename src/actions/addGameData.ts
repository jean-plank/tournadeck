'use server'

import { either, readonlyArray } from 'fp-ts'
import type { Json } from 'fp-ts/Json'
import { pipe } from 'fp-ts/function'
import { revalidateTag } from 'next/cache'

import { Config } from '../config/Config'
import { constants } from '../config/constants'
import { theQuestService } from '../context/context'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { MatchApiData, MatchApiDatas } from '../models/pocketBase/tables/match/MatchApiDatas'
import type { MatchId } from '../models/pocketBase/tables/match/MatchId'
import type { ChampionId } from '../models/riot/ChampionId'
import { ChampionKey } from '../models/riot/ChampionKey'
import { GameId } from '../models/riot/GameId'
import { LCUMatch } from '../models/riot/LCUMatch'
import type { Puuid } from '../models/riot/Puuid'
import type { RiotId } from '../models/riot/RiotId'
import type { StaticData } from '../models/theQuest/staticData/StaticData'
import { eitherGetOrThrow } from '../utils/fpTsUtils'
import { decodeError } from '../utils/ioTsUtils'

const { tags } = Config.constants

export async function addGameData(matchId: MatchId, game: Json): Promise<void> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  if (!Permissions.matches.update(user.role)) {
    throw new AuthError('Forbidden')
  }

  const validated = LCUMatch.decoder.decode(game)

  if (either.isLeft(validated)) {
    throw Error('BadRequest')
  }

  const lcuMatch = validated.right

  const staticData = await theQuestService.getStaticData()

  const theQuestMatch = await pipe(
    lcuMatch,
    LCUMatch.toTheQuestMatch(championIdFromKey(staticData), puuidFromRiotId),
  )

  const adminPb = await adminPocketBase()

  const match = await adminPb.collection('matches').getOne(matchId)

  const oldApiData_: MatchApiDatas = pipe(
    MatchApiDatas.codec.decode(match.apiData),
    either.mapLeft(decodeError('MatchApiDatas')(match.apiData)),
    eitherGetOrThrow, // InternalServerError
  )
  const oldApiData: ReadonlyArray<MatchApiData> = oldApiData_ ?? []

  if (
    // already all matches played
    oldApiData.length >= match.bestOf ||
    // game alreay added to this match
    oldApiData.some(g => GameId.Eq.equals(MatchApiData.isGameId(g) ? g : g.id, lcuMatch.gameId))
  ) {
    throw Error('BadRequest')
  }

  const newApiData = pipe(oldApiData, readonlyArray.append<MatchApiData>(theQuestMatch))

  await Promise.all([
    // store raw game data
    await adminPb
      .collection('rawGames')
      .create({
        gameId: lcuMatch.gameId,
        value: game,
      })
      .catch(e => {
        if (
          e instanceof Error &&
          'status' in e &&
          typeof e.status === 'number' &&
          e.status === 400
        ) {
          // probably a unique index error, pass
        } else {
          throw e
        }
      }),

    await adminPb
      .collection('matches')
      .update(matchId, { apiData: MatchApiDatas.codec.encode(newApiData) }),
  ])

  revalidateTag(tags.matches)
}

const championIdFromKey =
  (staticData: StaticData) =>
  (id: ChampionKey): Optional<ChampionId> =>
    staticData.champions.find(c => ChampionKey.Eq.equals(c.key, id))?.id

async function puuidFromRiotId(riotId: RiotId): Promise<Optional<Puuid>> {
  const summoner = await theQuestService.getSummonerByRiotId(constants.platform, riotId)

  return summoner?.puuid
}

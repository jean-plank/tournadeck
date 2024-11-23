'use server'

import { either, readonlyArray } from 'fp-ts'
import type { Json } from 'fp-ts/Json'
import { pipe } from 'fp-ts/function'
import { revalidateTag } from 'next/cache'
import util from 'util'

import { Config } from '../config/Config'
import { constants } from '../config/constants'
import { theQuestService } from '../context/context'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { GameDataPayload } from '../models/GameDataPayload'
import type { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import { MatchApiData, MatchApiDatas } from '../models/pocketBase/tables/match/MatchApiDatas'
import type { MatchId } from '../models/pocketBase/tables/match/MatchId'
import type { ChampionId } from '../models/riot/ChampionId'
import { ChampionKey } from '../models/riot/ChampionKey'
import { GameId } from '../models/riot/GameId'
import { LCUMatch } from '../models/riot/LCUMatch'
import type { Puuid } from '../models/riot/Puuid'
import type { RiotId } from '../models/riot/RiotId'
import type { TheQuestMatch } from '../models/theQuest/TheQuestMatch'
import type { StaticData } from '../models/theQuest/staticData/StaticData'
import { eitherGetOrThrow } from '../utils/fpTsUtils'
import { decodeError } from '../utils/ioTsUtils'

const { tags } = Config.constants

export async function addGameData(matchId: MatchId, rawGame: Json): Promise<void> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  if (!Permissions.matches.update(user.role)) {
    throw new AuthError('Forbidden')
  }

  const validated = GameDataPayload.decoder.decode(rawGame)

  if (either.isLeft(validated)) {
    throw Error('BadRequest')
  }

  const gameIdOrLCUMatch = validated.right
  const gameId: GameId = isGameId(gameIdOrLCUMatch) ? gameIdOrLCUMatch : gameIdOrLCUMatch.gameId

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
    oldApiData.some(g => GameId.Eq.equals(MatchApiData.isGameId(g) ? g : g.id, gameId))
  ) {
    throw Error('BadRequest')
  }

  const theQuestMatch = await (isGameId(gameIdOrLCUMatch)
    ? gameIdTheQuestMatch(gameIdOrLCUMatch)
    : lcuMatchTheQuestMatch(adminPb, rawGame, gameIdOrLCUMatch))

  const newApiData = pipe(oldApiData, readonlyArray.append<MatchApiData>(theQuestMatch))

  await adminPb
    .collection('matches')
    .update(matchId, { apiData: MatchApiDatas.codec.encode(newApiData) })

  revalidateTag(tags.matches)
}

function gameIdTheQuestMatch(gameId: GameId): Promise<TheQuestMatch> {
  return theQuestService.getMatchById(constants.platform, gameId).catch(e => {
    throw Error(`Failed to get match ${gameId}: ${formatError(e)}`)
  })
}

async function lcuMatchTheQuestMatch(
  adminPb: MyPocketBase,
  rawGame: Json,
  lcuMatch: LCUMatch,
): Promise<TheQuestMatch> {
  const staticData = await theQuestService.getStaticData()

  const theQuestMatch = await pipe(
    lcuMatch,
    LCUMatch.toTheQuestMatch(championIdFromKey(staticData), puuidFromRiotId),
  )

  // store raw game data
  await adminPb
    .collection('rawGames')
    .create({
      gameId: lcuMatch.gameId,
      value: rawGame,
    })
    .catch(e => {
      if (e instanceof Error && 'status' in e && typeof e.status === 'number' && e.status === 400) {
        // probably a unique index error, pass
      } else {
        throw e
      }
    })

  return theQuestMatch
}

function isGameId(data: GameId | LCUMatch): data is GameId {
  return typeof data === 'number'
}

const championIdFromKey =
  (staticData: StaticData) =>
  (id: ChampionKey): Optional<ChampionId> =>
    staticData.champions.find(c => ChampionKey.Eq.equals(c.key, id))?.id

async function puuidFromRiotId(riotId: RiotId): Promise<Optional<Puuid>> {
  const summoner = await theQuestService.getSummonerByRiotId(constants.platform, riotId)

  return summoner?.puuid
}

function formatError(e: unknown): string {
  return e instanceof Error ? `${e.name}: ${e.message}` : util.inspect(e)
}

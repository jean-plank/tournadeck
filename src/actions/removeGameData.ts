'use server'

import { either, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { revalidateTag } from 'next/cache'

import { Config } from '../config/Config'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { MatchApiData, MatchApiDatas } from '../models/pocketBase/tables/match/MatchApiDatas'
import type { MatchId } from '../models/pocketBase/tables/match/MatchId'
import { GameId } from '../models/riot/GameId'
import { eitherGetOrThrow } from '../utils/fpTsUtils'
import { decodeError } from '../utils/ioTsUtils'

const { tags } = Config.constants

export async function removeGameData(matchId: MatchId, gameId: GameId): Promise<void> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  if (!Permissions.matches.update(user.role)) {
    throw new AuthError('Forbidden')
  }

  const adminPb = await adminPocketBase()

  const match = await adminPb.collection('matches').getOne(matchId)

  const oldApiData_: MatchApiDatas = pipe(
    MatchApiDatas.codec.decode(match.apiData),
    either.mapLeft(decodeError('MatchApiDatas')(match.apiData)),
    eitherGetOrThrow, // InternalServerError
  )
  const oldApiData: ReadonlyArray<MatchApiData> = oldApiData_ ?? []

  if (!oldApiData.some(g => GameId.Eq.equals(MatchApiData.isGameId(g) ? g : g.id, gameId))) {
    throw Error('BadRequest')
  }

  const newApiData = pipe(
    oldApiData,
    readonlyArray.filter(g => !GameId.Eq.equals(MatchApiData.isGameId(g) ? g : g.id, gameId)),
  )

  await adminPb
    .collection('matches')
    .update(matchId, { apiData: MatchApiDatas.codec.encode(newApiData) })

  revalidateTag(tags.matches)
}

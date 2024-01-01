'use server'

import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import { Config } from '../config/Config'
import { constants } from '../config/constants'
import { getLogger, theQuestService } from '../context/context'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import type { AttendeeWithRiotId } from '../models/attendee/AttendeeWithRiotId'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { Tournament, TournamentId } from '../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../models/pocketBase/tables/match/Match'
import { MatchApiData, MatchApiDatas } from '../models/pocketBase/tables/match/MatchApiDatas'
import { GameName } from '../models/riot/GameName'
import { RiotId } from '../models/riot/RiotId'
import { TagLine } from '../models/riot/TagLine'
import type { TheQuestMatch } from '../models/theQuest/TheQuestMatch'
import type { StaticData } from '../models/theQuest/staticData/StaticData'

const { getFromPbCacheDuration, tags } = Config.constants

const logger = getLogger('viewTournament')

export type ViewTournament = {
  tournament: Tournament
  attendees: ReadonlyArray<AttendeeWithRiotId>
  matches: ReadonlyArray<MatchApiDataDecoded>
  staticData: StaticData
}

export async function viewTournament(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournament>> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  const adminPb = await adminPocketBase()

  const tournament = await adminPb
    .collection('tournaments')
    .getOne(tournamentId, {
      next: { revalidate: getFromPbCacheDuration, tags: [tags.tournaments.view] },
    })
    .catch(MyPocketBase.statusesToUndefined(404))

  if (tournament === undefined) return undefined

  if (!Permissions.tournaments.view(user.role, tournament)) {
    throw new AuthError('Forbidden')
  }

  const [attendees, matches, staticData] = await Promise.all([
    listAttendeesForTournament(adminPb, tournamentId),
    listMatchesForTournament(adminPb, tournamentId),
    theQuestService.getStaticData(true),
  ])

  return { tournament, attendees, matches, staticData }
}

async function listAttendeesForTournament(
  adminPb: MyPocketBase,
  tournamentId: TournamentId,
): Promise<ReadonlyArray<AttendeeWithRiotId>> {
  const attendees = await adminPb.collection('attendees').getFullList({
    filter: `tournament="${tournamentId}"`,
    next: { revalidate: getFromPbCacheDuration, tags: [tags.attendees.list] },
  })

  return Promise.all(
    attendees.map(
      (a): Promise<AttendeeWithRiotId> =>
        theQuestService.getSummonerByPuuid(constants.platform, a.puuid, true).then(summoner => {
          if (summoner === undefined) {
            logger.warn(`Summoner not found for attendee ${a.id}`)
          }

          return {
            ...a,
            riotId: summoner?.riotId ?? RiotId(GameName('undefined'), TagLine('undef')),
          }
        }),
    ),
  )
}

async function listMatchesForTournament(
  adminPb: MyPocketBase,
  tournamentId: TournamentId,
): Promise<ReadonlyArray<MatchApiDataDecoded>> {
  const matches = await adminPb.collection('matches').getFullList({
    filter: `tournament="${tournamentId}"`,
    next: { revalidate: getFromPbCacheDuration, tags: [tags.matches.list] },
  })

  return matches.map(
    (m): MatchApiDataDecoded => ({
      ...m,
      apiData: pipe(
        MatchApiDatas.codec.decode(m.apiData),
        either.fold(
          () => [],
          apiData =>
            apiData !== null
              ? apiData.map(
                  (d): Optional<TheQuestMatch> => (MatchApiData.isGameId(d) ? undefined : d),
                )
              : [],
        ),
      ),
    }),
  )
}

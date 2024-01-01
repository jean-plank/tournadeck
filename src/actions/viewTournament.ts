'use server'

import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import { Config } from '../Config'
import { getLogger, theQuestService } from '../context/context'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import type { AttendeeWithRiotId } from '../models/attendee/AttendeeWithRiotId'
import type { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { Tournament, TournamentId } from '../models/pocketBase/tables/Tournament'
import { MatchApiData } from '../models/pocketBase/tables/match/MatchApiData'
import { GameName } from '../models/riot/GameName'
import type { MatchDecoded } from '../models/riot/MatchDecoded'
import { RiotId } from '../models/riot/RiotId'
import { TagLine } from '../models/riot/TagLine'
import type { StaticData } from '../models/theQuest/staticData/StaticData'
import { viewTournamentShortFromAdminPb } from './viewTournamentShort'

const { getFromPbCacheDuration, tags } = Config.constants

const logger = getLogger('viewTournament')

export type ViewTournament = {
  tournament: Tournament
  attendees: ReadonlyArray<AttendeeWithRiotId>
  matches: ReadonlyArray<MatchDecoded>
  staticData: StaticData
}

export async function viewTournament(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournament>> {
  const adminPb = await adminPocketBase()

  const tournament = await viewTournamentShortFromAdminPb(adminPb, tournamentId)

  if (tournament === undefined) return undefined

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
        theQuestService
          .getSummonerByPuuid(Config.constants.platform, a.puuid, true)
          .then(summoner => {
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
): Promise<ReadonlyArray<MatchDecoded>> {
  const matches = await adminPb.collection('matches').getFullList({
    filter: `tournament="${tournamentId}"`,
    next: { revalidate: getFromPbCacheDuration, tags: [tags.matches.list] },
  })

  return matches.map(
    (m): MatchDecoded => ({
      ...m,
      apiData: pipe(
        MatchApiData.codec.decode(m.apiData),
        either.fold(
          () => null,
          d => (MatchApiData.isGameId(d) ? null : d),
        ),
      ),
    }),
  )
}

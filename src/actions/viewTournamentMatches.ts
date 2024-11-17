'use server'

import { either, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import { Config } from '../config/Config'
import { theQuestService } from '../context/context'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import type { AttendeeWithRiotId } from '../models/attendee/AttendeeWithRiotId'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { Team } from '../models/pocketBase/tables/Team'
import type { Tournament, TournamentId } from '../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../models/pocketBase/tables/match/Match'
import { MatchApiData, MatchApiDatas } from '../models/pocketBase/tables/match/MatchApiDatas'
import type { DDragonVersion } from '../models/riot/DDragonVersion'
import type { TheQuestMatch } from '../models/theQuest/TheQuestMatch'
import { listAttendeesForTournament } from './helpers/listAttendeesForTournament'
import { listTeamsForTournament } from './helpers/listTeamsForTournament'

const { getFromPbCacheDuration, tags } = Config.constants

export type ViewTournamentMatches = {
  version: DDragonVersion
  tournament: Tournament
  teams: ReadonlyArray<Team>
  attendees: ReadonlyArray<AttendeeWithRiotId>
  matches: ReadonlyArray<MatchApiDataDecoded>
}

export async function viewTournamentMatches(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournamentMatches>> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  const adminPb = await adminPocketBase()

  const tournament = await adminPb
    .collection('tournaments')
    .getOne(tournamentId, {
      next: { revalidate: getFromPbCacheDuration, tags: [tags.tournaments] },
    })
    .catch(MyPocketBase.statusesToUndefined(404))

  if (tournament === undefined) return undefined

  if (!Permissions.tournaments.view(user.role, tournament)) {
    throw new AuthError('Forbidden')
  }

  const [staticData, teams, attendees, matches] = await Promise.all([
    theQuestService.getStaticData(true),
    listTeamsForTournament(adminPb, tournamentId),
    listAttendeesForTournament(adminPb, tournamentId),

    adminPb.collection('matches').getFullList({
      filter: adminPb.smartFilter<'matches'>({ tournament: tournamentId }),
      next: { revalidate: getFromPbCacheDuration, tags: [tags.matches] },
    }),
  ])

  return {
    version: staticData.version,
    tournament,
    teams,
    attendees,
    matches: pipe(
      matches,
      readonlyArray.map(
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
      ),
    ),
  }
}

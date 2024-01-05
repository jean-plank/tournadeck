'use server'

import { option, ord, readonlyArray, string } from 'fp-ts'
import { pipe, tuple } from 'fp-ts/function'

import { listAttendeesForTournament } from '../../../../../actions/helpers/listAttendeesForTournament'
import { listTeamsForTournament } from '../../../../../actions/helpers/listTeamsForTournament'
import { Config } from '../../../../../config/Config'
import { adminPocketBase } from '../../../../../context/singletons/adminPocketBase'
import { Permissions } from '../../../../../helpers/Permissions'
import { auth } from '../../../../../helpers/auth'
import { AuthError } from '../../../../../models/AuthError'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { MyPocketBase } from '../../../../../models/pocketBase/MyPocketBase'
import { type Team, TeamId } from '../../../../../models/pocketBase/tables/Team'
import type { Tournament, TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { array, record } from '../../../../../utils/fpTsUtils'
import { groupAndSortAttendees } from '../participants/groupAndSortAttendees'
import type { TeamWithRoleMembers } from './Teams'

const { getFromPbCacheDuration, tags } = Config.constants

export type TeamsData = {
  tournament: Tournament
  teams: ReadonlyArray<TeamWithRoleMembers>
  teamlessAttendees: ReadonlyArray<Tuple<TeamRole, NonEmptyArray<AttendeeWithRiotId>>>
}

type TeamsAcc = {
  teams: ReadonlyArray<TeamWithRoleMembers>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

type AttendeesAcc = {
  roles: ReadonlyRecord<TeamRole, Optional<AttendeeWithRiotId>>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

const byTag = pipe(
  string.Ord,
  ord.contramap((b: Team) => b.tag),
)

export async function getTeamsData(tournamentId: TournamentId): Promise<Optional<TeamsData>> {
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

  const [teams, allAttendees] = await Promise.all([
    listTeamsForTournament(adminPb, tournamentId),
    listAttendeesForTournament(adminPb, tournamentId),
  ])

  const initTeamsAcc: TeamsAcc = {
    teams: [],
    attendees: allAttendees,
  }

  const { teams: groupedTeams, attendees } = pipe(
    teams,
    readonlyArray.sort(byTag),
    readonlyArray.reduce(initTeamsAcc, (teamsAcc, team): TeamsAcc => {
      const balance = pipe(
        teamsAcc.attendees,
        readonlyArray.findFirst(a => a.isCaptain),
        option.fold(
          () => 0,
          a => a.price,
        ),
      )

      const initAttendeesAcc: AttendeesAcc = {
        roles: record.empty<TeamRole, Optional<AttendeeWithRiotId>>(),
        attendees: teamsAcc.attendees,
      }

      const { roles, attendees: newAttendees } = pipe(
        TeamRole.values,
        readonlyArray.reduce(initAttendeesAcc, (attendeesAcc, role): AttendeesAcc => {
          const [forRole, newAttendees_] = pipe(
            attendeesAcc.attendees,
            array.popWhere(
              a =>
                a.team !== '' &&
                TeamId.Eq.equals(a.team, team.id) &&
                TeamRole.Eq.equals(a.role, role),
            ),
          )
          return {
            roles: { ...attendeesAcc.roles, [role]: option.toUndefined(forRole) },
            attendees: newAttendees_,
          }
        }),
      )

      return {
        teams: pipe(
          teamsAcc.teams,
          readonlyArray.append<TeamWithRoleMembers>([{ ...team, balance }, roles]),
        ),
        attendees: newAttendees,
      }
    }),
  )

  const groupedAttendees = groupAndSortAttendees(attendees)

  return {
    tournament,
    teams: groupedTeams,
    teamlessAttendees: pipe(
      TeamRole.values,
      readonlyArray.filterMap(role => {
        const as = groupedAttendees[role]

        return as !== undefined ? option.some(tuple(role, as)) : option.none
      }),
    ),
  }
}

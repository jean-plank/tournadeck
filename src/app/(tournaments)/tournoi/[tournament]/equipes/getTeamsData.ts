'use server'

import { number, option, ord, readonlyArray, readonlyRecord, string } from 'fp-ts'
import type { Option } from 'fp-ts/Option'
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
import { TeamId } from '../../../../../models/pocketBase/tables/Team'
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
  teams: ReadonlyArray<TeamWithRoleMembersWithCount>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

type TeamWithRoleMembersWithCount = [...TeamWithRoleMembers, number]

type AttendeesAcc = {
  roles: ReadonlyRecord<TeamRole, Optional<AttendeeWithRiotId>>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

const byMembersCount = pipe(
  number.Ord,
  ord.contramap((b: TeamWithRoleMembersWithCount) => b[2]),
)

const byName = pipe(
  string.Ord,
  ord.contramap((b: TeamWithRoleMembersWithCount) => b[0].name),
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
          readonlyArray.append<TeamWithRoleMembersWithCount>(
            tuple(
              { ...team, balance },
              roles,
              pipe(
                roles,
                readonlyRecord.toReadonlyArray,
                readonlyArray.filterMap(
                  ([, val]): Option<AttendeeWithRiotId> =>
                    val !== undefined ? option.some(val) : option.none,
                ),
                readonlyArray.size,
              ),
            ),
          ),
        ),
        attendees: newAttendees,
      }
    }),
  )

  const groupedAttendees = groupAndSortAttendees(attendees)

  return {
    tournament,

    teams: pipe(
      groupedTeams,
      readonlyArray.sortBy([ord.reverse(byMembersCount), byName]),
      readonlyArray.map(([team, roles]) => tuple(team, roles)),
    ),

    teamlessAttendees: pipe(
      TeamRole.values,
      readonlyArray.filterMap(role => {
        const as = groupedAttendees[role]

        return as !== undefined ? option.some(tuple(role, as)) : option.none
      }),
    ),
  }
}

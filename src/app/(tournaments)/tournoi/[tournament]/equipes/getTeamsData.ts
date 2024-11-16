'use server'

import { monoid, number, option, ord, readonlyArray, string } from 'fp-ts'
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
import type { User } from '../../../../../models/pocketBase/tables/User'
import { array, objectEntries, record, tupleIsDefined } from '../../../../../utils/fpTsUtils'
import type { TeamWithRoleMembers } from './Teams'

const { getFromPbCacheDuration, tags } = Config.constants

export type TeamsData = {
  user: User
  tournament: Tournament
  teams: ReadonlyArray<TeamWithRoleMembers>
  teamlessAttendees: ReadonlyArray<AttendeeWithRiotId>
}

type TeamsAcc = {
  teams: ReadonlyArray<TeamWithRoleMembersWithCount>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

type TeamWithRoleMembersWithCount = readonly [...TeamWithRoleMembers, number]

type AttendeesAcc = {
  roles: Partial<ReadonlyRecord<TeamRole, AttendeeWithRiotId>>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

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
      next: { revalidate: getFromPbCacheDuration, tags: [tags.tournaments] },
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

  const { teams: groupedTeams, attendees: teamlessAttendees } = pipe(
    teams,
    readonlyArray.reduce(initTeamsAcc, (teamsAcc, team): TeamsAcc => {
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

      const rolesEntries = objectEntries(roles)

      const balance = pipe(
        rolesEntries,
        readonlyArray.findFirstMap(([, a]) =>
          a !== undefined && a.isCaptain ? option.some(a.price) : option.none,
        ),
        option.getOrElse(() => 0),
      )

      const avatarRatings = pipe(
        rolesEntries,
        readonlyArray.filterMap(([, a]) =>
          a !== undefined ? option.some(a.avatarRating) : option.none,
        ),
      )
      const averageAvatarRating: number = readonlyArray.isNonEmpty(avatarRatings)
        ? pipe(avatarRatings, monoid.concatAll(number.MonoidSum)) / avatarRatings.length
        : 0

      return {
        teams: pipe(
          teamsAcc.teams,
          readonlyArray.append(
            tuple<TeamWithRoleMembersWithCount>(
              { ...team, balance, averageAvatarRating },
              roles,
              pipe(
                objectEntries(roles),
                readonlyArray.filter(tupleIsDefined<TeamRole, AttendeeWithRiotId>()),
                readonlyArray.size,
              ),
            ),
          ),
        ),
        attendees: newAttendees,
      }
    }),
  )

  return {
    user,
    tournament,
    teams: pipe(
      groupedTeams,
      readonlyArray.sort(byName),
      readonlyArray.map(([team, roles]) => tuple(team, roles)),
    ),
    teamlessAttendees,
  }
}

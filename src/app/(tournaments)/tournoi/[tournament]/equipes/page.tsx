'use server'

import { monoid, number, option, ord, readonlyArray, string } from 'fp-ts'
import { pipe, tuple } from 'fp-ts/function'

import { listAttendeesForTournament } from '../../../../../actions/helpers/listAttendeesForTournament'
import { listTeamsForTournament } from '../../../../../actions/helpers/listTeamsForTournament'
import { viewTournament } from '../../../../../actions/helpers/viewTournament'
import { ClientOnly } from '../../../../../components/ClientOnly'
import { adminPocketBase } from '../../../../../context/singletons/adminPocketBase'
import { Permissions } from '../../../../../helpers/Permissions'
import { withRedirectTournament } from '../../../../../helpers/withRedirectTournament'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { TeamId } from '../../../../../models/pocketBase/tables/Team'
import type { Tournament, TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { array, objectEntries, record } from '../../../../../utils/fpTsUtils'
import { redirectAppRoute } from '../../../../../utils/redirectAppRoute'
import { DraggableTeams } from './DraggableTeams'
import type { TeamWithRoleMembers } from './Teams'
import { Teams } from './Teams'

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const TeamsPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectTournament(viewTournamentTeams(params.tournament))(
    ({ tournament, teams, teamlessAttendees, draggable }) => {
      if (tournament.phase === 'created') {
        return redirectAppRoute(`/tournoi/${tournament.id}/participants`)
      }

      return (
        <ClientOnly>
          {draggable ? (
            <DraggableTeams
              tournament={tournament}
              teams={teams}
              teamlessAttendees={teamlessAttendees}
            />
          ) : (
            <Teams
              tournament={tournament}
              teams={teams}
              teamlessAttendees={teamlessAttendees}
              draggingState={undefined}
            />
          )}
        </ClientOnly>
      )
    },
  )
}

export default TeamsPage

type ViewTournamentTeams = {
  tournament: Tournament
  teams: ReadonlyArray<TeamWithRoleMembers>
  teamlessAttendees: ReadonlyArray<AttendeeWithRiotId>
  draggable: boolean
}

type TeamsAcc = {
  teams: ReadonlyArray<TeamWithRoleMembers>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

type AttendeesAcc = {
  roles: Partial<ReadonlyRecord<TeamRole, AttendeeWithRiotId>>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

const byName = pipe(
  string.Ord,
  ord.contramap((b: TeamWithRoleMembers) => b[0].name),
)

async function viewTournamentTeams(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournamentTeams>> {
  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { user, tournament } = data

  const adminPb = await adminPocketBase()

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
            tuple<TeamWithRoleMembers>({ ...team, balance, averageAvatarRating }, roles),
          ),
        ),
        attendees: newAttendees,
      }
    }),
  )

  return {
    tournament,
    teams: pipe(groupedTeams, readonlyArray.sort(byName)),
    teamlessAttendees,
    draggable: Permissions.teams.buyAttendee(user.role, tournament),
  }
}

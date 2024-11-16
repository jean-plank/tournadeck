import { notFound } from 'next/navigation'

import { Permissions } from '../../../../../helpers/Permissions'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { redirectAppRoute } from '../../../../../utils/redirectAppRoute'
import { SetTournament } from '../../../TournamentContext'
import { DraggableTeams } from './DraggableTeams'
import { Teams } from './Teams'
import type { TeamsData } from './getTeamsData'
import { getTeamsData } from './getTeamsData'

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const TeamsPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectOnAuthError(getTeamsData(params.tournament))(data => (
    <>
      <SetTournament tournament={data?.tournament} />
      <TeamsLoaded data={data} />
    </>
  ))
}

type TeamsLoadedProps = {
  data: Optional<TeamsData>
}

const TeamsLoaded: React.FC<TeamsLoadedProps> = ({ data }) => {
  if (data === undefined) return notFound()

  const { user, tournament, teams, teamlessAttendees } = data

  if (tournament.phase === 'created') {
    return redirectAppRoute(`/tournoi/${tournament.id}/participants`)
  }

  if (Permissions.teams.buyAttendee(user.role)) {
    return (
      <DraggableTeams tournament={tournament} teams={teams} teamlessAttendees={teamlessAttendees} />
    )
  }

  return (
    <Teams
      tournament={tournament}
      teams={teams}
      teamlessAttendees={teamlessAttendees}
      draggingState={undefined}
    />
  )
}

export default TeamsPage

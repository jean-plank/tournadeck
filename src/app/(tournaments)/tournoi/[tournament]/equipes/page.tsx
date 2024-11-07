import { notFound } from 'next/navigation'

import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { redirectAppRoute } from '../../../../../utils/redirectAppRoute'
import { SetTournament } from '../../../TournamentContext'
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

  const { tournament, teams, teamlessAttendees } = data

  if (tournament.phase === 'created') {
    return redirectAppRoute(`/tournoi/${tournament.id}/participants`)
  }

  return <Teams teams={teams} teamlessAttendees={teamlessAttendees} />
}

export default TeamsPage

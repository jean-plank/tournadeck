import { notFound } from 'next/navigation'

import type { ViewTournament } from '../../../../../actions/viewTournament'
import { viewTournament } from '../../../../../actions/viewTournament'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { redirectAppRoute } from '../../../../../utils/redirectAppRoute'
import { SetTournament } from '../../../TournamentContext'
import { Attendees } from '../participants/Attendees'

type Props = {
  params: { tournament: TournamentId }
}

const Teams: React.FC<Props> = ({ params }) =>
  withRedirectOnAuthError(viewTournament(params.tournament))(data => (
    <>
      <SetTournament tournament={data?.tournament} />
      <TeamsLoaded data={data} />
    </>
  ))

type TeamsLoadedProps = {
  data: Optional<ViewTournament>
}

const TeamsLoaded: React.FC<TeamsLoadedProps> = ({ data }) => {
  if (data === undefined) return notFound()

  const { tournament, attendees } = data

  if (tournament.phase === 'created') {
    return redirectAppRoute(`/tournoi/${tournament.id}/participants`)
  }

  return <Attendees tournament={tournament} attendees={attendees} />
}

export default Teams

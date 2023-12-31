import { notFound, redirect } from 'next/navigation'

import { viewTournament } from '../../../../../actions/viewTournament'
import { Attendees } from '../../../../../domain/(tournaments)/tournoi/[tournament]/Attendees'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'

type Props = {
  params: { tournament: TournamentId }
}

const Teams: React.FC<Props> = ({ params }) =>
  withRedirectOnAuthError(viewTournament(params.tournament))(data => {
    if (data === undefined) return notFound()

    const { tournament, attendees } = data

    if (tournament.phase === 'created') {
      return redirect(`/tournoi/${params.tournament}/participants`)
    }

    return <Attendees tournament={tournament} attendees={attendees} />
  })

export default Teams

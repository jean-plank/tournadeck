import { notFound, redirect } from 'next/navigation'

import type { ViewTournament } from '../../../../../actions/viewTournament'
import { viewTournament } from '../../../../../actions/viewTournament'
import { Attendees } from '../../../../../domain/(tournaments)/tournoi/[tournament]/Attendees'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { SetTournament } from '../../../TournamentContext'

type Props = {
  params: { tournament: TournamentId }
}

const AttendeesPage: React.FC<Props> = ({ params }) =>
  withRedirectOnAuthError(viewTournament(params.tournament))(data => (
    <>
      <SetTournament tournament={data?.tournament} />
      <AttendeesPageLoaded data={data} />
    </>
  ))

type AttendeesPageLoadedProps = {
  data: Optional<ViewTournament>
}

const AttendeesPageLoaded: React.FC<AttendeesPageLoadedProps> = ({ data }) => {
  if (data === undefined) return notFound()

  const { tournament, attendees } = data

  if (tournament.phase !== 'created') return redirect(`/tournoi/${tournament.id}/equipes`)

  return <Attendees tournament={tournament} attendees={attendees} />
}

export default AttendeesPage

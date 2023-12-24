import { listAttendeesForTournament } from '../../../actions/attendees'
import { viewTournament } from '../../../actions/tournaments'
import { TournamentFC } from '../../../domain/tournoi/[tournament]/TournamentFC'
import type { TournamentId } from '../../../models/pocketBase/tables/Tournament'

type Props = {
  params: { tournament: TournamentId }
}

const TournamentPage: React.FC<Props> = async ({ params }) => {
  const [tournaments, attendees] = await Promise.all([
    viewTournament(params.tournament),
    listAttendeesForTournament(params.tournament),
  ])

  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/synthwave.jpg')" }}
    >
      <TournamentFC tournament={tournaments} attendees={attendees} />
    </div>
  )
}

export default TournamentPage

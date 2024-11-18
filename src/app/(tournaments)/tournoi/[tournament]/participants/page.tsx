'use server'

import { listAttendeesForTournament } from '../../../../../actions/helpers/listAttendeesForTournament'
import { viewTournament } from '../../../../../actions/helpers/viewTournament'
import { adminPocketBase } from '../../../../../context/singletons/adminPocketBase'
import { withRedirectTournament } from '../../../../../helpers/withRedirectTournament'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Tournament, TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { redirectAppRoute } from '../../../../../utils/redirectAppRoute'
import { Attendees } from './Attendees'

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const AttendeesPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectTournament(viewTournamentAttendees(params.tournament))(
    ({ tournament, attendees }) => {
      if (tournament.phase !== 'created') {
        return redirectAppRoute(`/tournoi/${tournament.id}/equipes`)
      }

      return <Attendees tournament={tournament} attendees={attendees} />
    },
  )
}

export default AttendeesPage

type ViewTournamentAttendees = {
  tournament: Tournament
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

async function viewTournamentAttendees(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournamentAttendees>> {
  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { tournament } = data

  const adminPb = await adminPocketBase()

  return {
    tournament,
    attendees: await listAttendeesForTournament(adminPb, tournamentId),
  }
}

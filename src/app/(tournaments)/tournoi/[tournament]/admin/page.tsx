'use server'

import { viewTournament } from '../../../../../actions/helpers/viewTournament'
import { Permissions } from '../../../../../helpers/Permissions'
import { withRedirectTournament } from '../../../../../helpers/withRedirectTournament'
import type { Tournament, TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { Admin } from './Admin'

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const AdminPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectTournament(viewTournamentAdmin(params.tournament))(() => <Admin />)
}

export default AdminPage

type ViewTournamentAdmin = {
  tournament: Tournament
}

async function viewTournamentAdmin(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournamentAdmin>> {
  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { user, tournament } = data

  if (!Permissions.tournaments.create(user.role)) return undefined

  return { tournament }
}

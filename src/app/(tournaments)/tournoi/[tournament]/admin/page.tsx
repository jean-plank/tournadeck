'use server'

import { notFound } from 'next/navigation'

import { viewTournament } from '../../../../../actions/helpers/viewTournament'
import { Permissions } from '../../../../../helpers/Permissions'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { Tournament, TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { SetTournament } from '../../../TournamentContext'
import { Admin } from './Admin'

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const AdminPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectOnAuthError(viewTournamentAdmin(params.tournament))(data => {
    if (data === undefined) return notFound()

    const { tournament } = data

    return (
      <>
        <SetTournament tournament={tournament} />
        <Admin />
      </>
    )
  })
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

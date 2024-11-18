import { notFound } from 'next/navigation'

import { viewTournamentAdmin } from '../../../../../actions/viewTournamentAdmin'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
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

import { redirect } from 'next/navigation'

import { viewTournament } from '../../../domain/tournament/actions'
import type { TournamentId } from '../../../models/pocketBase/tables/Tournament'

type Props = {
  params: { tournament: TournamentId }
}

const Tournament: React.FC<Props> = async ({ params }) => {
  const res = await viewTournament(params.tournament).catch(() => {
    redirect('/')
  })

  return <pre>{JSON.stringify(res, null, 2)}</pre>
}

export default Tournament

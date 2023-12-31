import { redirect } from 'next/navigation'

import type { TournamentId } from '../../../../models/pocketBase/tables/Tournament'

type Props = {
  params: { tournament: TournamentId }
}

const TournamentPage: React.FC<Props> = ({ params }) =>
  redirect(`/tournoi/${params.tournament}/participants`)

export default TournamentPage

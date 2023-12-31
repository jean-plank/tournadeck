import type { SWRResponse } from 'swr'
import useSWR from 'swr'

import { viewTournamentShort } from '../../actions/viewTournamentShort'
import type { Tournament, TournamentId } from '../../models/pocketBase/tables/Tournament'

export function useTournament(tournamentId: TournamentId): SWRResponse<Optional<Tournament>> {
  return useSWR([tournamentId, 'viewTournamentShort'], ([id]) => viewTournamentShort(id))
}

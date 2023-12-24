import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import { adminPocketBase } from '../context'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import { MatchApiData } from '../models/pocketBase/tables/match/MatchApiData'
import type { MatchDecoded } from '../models/riot/MatchDecoded'

// for GET actions
const cacheDuration = 5 // seconds

const listMatchesTag = 'matches/list'

export async function listMatchesForTournament(
  tournamentId: TournamentId,
): Promise<ReadonlyArray<MatchDecoded>> {
  const { user } = await auth()

  if (!Permissions.matches.list(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  const matches = await adminPb.collection('matches').getFullList({
    filter: `tournament="${tournamentId}"`,
    next: { revalidate: cacheDuration, tags: [listMatchesTag] },
  })

  return matches.map(
    (m): MatchDecoded => ({
      ...m,
      apiData: pipe(
        MatchApiData.codec.decode(m.apiData),
        either.fold(
          () => null,
          d => (MatchApiData.isGameId(d) ? null : d),
        ),
      ),
    }),
  )
}

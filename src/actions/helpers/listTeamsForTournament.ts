import { Config } from '../../config/Config'
import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { Team } from '../../models/pocketBase/tables/Team'
import type { TournamentId } from '../../models/pocketBase/tables/Tournament'

const { getFromPbCacheDuration, tags } = Config.constants

export async function listTeamsForTournament(
  adminPb: MyPocketBase,
  tournamentId: TournamentId,
): Promise<ReadonlyArray<Team>> {
  return await adminPb.collection('teams').getFullList({
    filter: adminPb.smartFilter<'teams'>({ tournament: tournamentId }),
    next: { revalidate: getFromPbCacheDuration, tags: [tags.teams] },
  })
}

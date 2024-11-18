import { Config } from '../config/Config'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { Tournament, TournamentId } from '../models/pocketBase/tables/Tournament'

const { getFromPbCacheDuration, tags } = Config.constants

export type ViewTournamentAdmin = {
  tournament: Tournament
}

export async function viewTournamentAdmin(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournamentAdmin>> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  if (!Permissions.tournaments.create(user.role)) return undefined

  const adminPb = await adminPocketBase()

  const tournament = await adminPb
    .collection('tournaments')
    .getOne(tournamentId, {
      next: { revalidate: getFromPbCacheDuration, tags: [tags.tournaments] },
    })
    .catch(MyPocketBase.statusesToUndefined(404))

  if (tournament === undefined || !Permissions.tournaments.view(user.role, tournament)) {
    return undefined
  }

  return { tournament }
}

'use server'

import { Config } from '../../config/Config'
import { adminPocketBase } from '../../context/singletons/adminPocketBase'
import { Permissions } from '../../helpers/Permissions'
import { auth } from '../../helpers/auth'
import { AuthError } from '../../models/AuthError'
import { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { Tournament, TournamentId } from '../../models/pocketBase/tables/Tournament'
import type { User } from '../../models/pocketBase/tables/User'

const { getFromPbCacheDuration, tags } = Config.constants

type ViewTournament = {
  user: User
  tournament: Tournament
}

export async function viewTournament(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournament>> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

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

  return { user, tournament }
}

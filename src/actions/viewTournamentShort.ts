'use server'

import { Config } from '../Config'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { Tournament, TournamentId } from '../models/pocketBase/tables/Tournament'

const { getFromPbCacheDuration, tags } = Config.constants

export async function viewTournamentShort(
  tournamentId: TournamentId,
): Promise<Optional<Tournament>> {
  return viewTournamentShortFromAdminPb(await adminPocketBase(), tournamentId)
}

export async function viewTournamentShortFromAdminPb(
  adminPb: MyPocketBase,
  tournamentId: TournamentId,
): Promise<Optional<Tournament>> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  const tournament = await adminPb
    .collection('tournaments')
    .getOne(tournamentId, {
      next: { revalidate: getFromPbCacheDuration, tags: [tags.tournaments.view] },
    })
    .catch(MyPocketBase.statusesToUndefined(404))

  if (tournament === undefined) return undefined

  if (!Permissions.tournaments.view(user.role, tournament)) {
    throw new AuthError('Forbidden')
  }

  return tournament
}

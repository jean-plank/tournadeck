import { adminPocketBase } from '../context'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import type { Tournament, TournamentId } from '../models/pocketBase/tables/Tournament'

// for GET actions
const cacheDuration = 5 // seconds

export async function listTournaments(): Promise<ReadonlyArray<Tournament>> {
  const { user } = await auth()

  if (!Permissions.tournaments.list(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  return await adminPb.collection('tournaments').getFullList<Tournament>({
    next: { revalidate: cacheDuration },
  })
}

export async function viewTournament(tournamentId: TournamentId): Promise<Tournament> {
  const { user } = await auth()

  if (!Permissions.tournaments.view(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  return await adminPb
    .collection('tournaments')
    .getOne(tournamentId, { next: { revalidate: cacheDuration } })
}

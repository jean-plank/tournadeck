'use server'

import { Permissions } from '../../helpers/Permissions'
import { auth } from '../../helpers/auth'
import type { CreateModel } from '../../models/pocketBase/MyPocketBase'
import type { Tournament, TournamentId } from '../../models/pocketBase/tables/Tournament'
import { adminPocketBase } from '../../services/adminPocketBase'

// for GET actions
const cacheDuration = 5 // seconds

export async function listTournaments(): Promise<ReadonlyArray<Tournament>> {
  const { user } = await auth()

  if (!Permissions.tournaments.list(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  return adminPb.collection('tournaments').getFullList({ next: { revalidate: cacheDuration } })
}

export async function viewTournament(id: TournamentId): Promise<Tournament> {
  const { user } = await auth()

  if (!Permissions.tournaments.view(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  return adminPb.collection('tournaments').getOne(id)
}

export async function createTournament(tournament: CreateModel<Tournament>): Promise<Tournament> {
  const { user } = await auth()

  if (!Permissions.tournaments.create(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  return adminPb.collection('tournaments').create(tournament)
}

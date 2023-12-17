'use server'

import { Permissions } from '../../helpers/Permissions'
import { auth } from '../../helpers/auth'
import type { CreateModel } from '../../models/pocketBase/MyPocketBase'
import type { Tournament } from '../../models/pocketBase/tables/Tournament'
import { adminPocketBase } from '../../services/adminPocketBase'

export async function createTournament(tournament: CreateModel<Tournament>): Promise<Tournament> {
  const { user } = await auth()

  if (!Permissions.tournaments.create(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  return adminPb.collection('tournaments').create(tournament)
}

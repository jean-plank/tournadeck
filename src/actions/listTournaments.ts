'use server'

import { Config } from '../config/Config'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import type { Tournament } from '../models/pocketBase/tables/Tournament'

const { getFromPbCacheDuration, tags } = Config.constants

export async function listTournaments(): Promise<ReadonlyArray<Tournament>> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  if (!Permissions.tournaments.list(user.role)) {
    throw new AuthError('Forbidden')
  }

  const adminPb = await adminPocketBase()

  return await adminPb.collection('tournaments').getFullList({
    ...(user.role === 'organiser'
      ? {}
      : { filter: adminPb.smartFilter<'tournaments'>({ isVisible: true }) }),
    next: { revalidate: getFromPbCacheDuration, tags: [tags.tournaments] },
  })
}

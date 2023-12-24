'use client'

import Link from 'next/link'

import { usePocketBase } from '../contexts/PocketBaseContext'
import { Permissions } from '../helpers/Permissions'

export const ClientLinks: React.FC = () => {
  const { user } = usePocketBase()

  return user !== null && Permissions.tournaments.list(user.role) ? (
    <Link href="/tournois">Tournois</Link>
  ) : null
}

'use client'

import Link from 'next/link'
import { useCallback } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'
import { Permissions } from '../helpers/Permissions'
import { clientRedirect } from '../utils/clientRedirect'

export const Header: React.FC = () => {
  const { pb, user } = usePocketBase()

  const logout = useCallback(() => {
    pb.authStore.clear()

    clientRedirect('/')
  }, [pb.authStore])

  return (
    <header className="flex justify-between gap-1 border-b border-grey1 bg-grey2 p-4 text-white">
      <nav className="flex gap-4">
        {user === null && <Link href="/">Accueil</Link>}
        {user !== null && Permissions.tournaments.list(user.role) && (
          <Link href="/tournois">Tournois</Link>
        )}
      </nav>

      <div className="flex gap-4">
        {user !== null && (
          <>
            <div>BONJOUR {user.displayName}</div>
            <button type="button" onClick={logout} className="border border-black">
              Déconnexion
            </button>
          </>
        )}
      </div>
    </header>
  )
}

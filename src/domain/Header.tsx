'use client'

import Link from 'next/link'
import { useCallback } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'
import { Permissions } from '../helpers/Permissions'

export const Header: React.FC = () => {
  const { user, logoutAndRedirect } = usePocketBase()

  const logout = useCallback(() => {
    logoutAndRedirect()
  }, [logoutAndRedirect])

  return (
    <header className="flex justify-between gap-1 border-b border-grey1 bg-grey2 p-4 text-white">
      <nav className="flex gap-4">
        {user === undefined && <Link href="/">Accueil</Link>}
        {user !== undefined && Permissions.tournaments.list(user.role) && (
          <Link href="/tournois">Tournois</Link>
        )}
      </nav>

      <div className="flex gap-4">
        {user !== undefined && (
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

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'
import { Permissions } from '../helpers/Permissions'
import { TournamentPhase } from '../models/TournamentPhase'
import type { Tournament, TournamentId } from '../models/pocketBase/tables/Tournament'

export const Header: React.FC = () => {
  const pathname = usePathname()
  const pocketBase = usePocketBase()

  const { user, logoutAndRedirect } = usePocketBase()
  const [tournament, setTournament] = useState<Tournament | undefined>(undefined)

  useEffect(() => {
    if (pathname.startsWith('/tournoi/')) {
      // Get tournament id in pathname
      const regex = /\/tournoi\/([^/]+)/
      const matches = pathname.match(regex)
      const id = matches !== null && matches[1]

      // Get tournament data
      if (id !== false) {
        const tournamentId = id as unknown as TournamentId
        pocketBase.pb
          .collection('tournaments')
          .getOne(tournamentId)
          .then(t => setTournament(t))
      }
    } else {
      setTournament(undefined)
    }
  }, [pathname, pocketBase.pb])

  const logout = useCallback(() => {
    logoutAndRedirect()
  }, [logoutAndRedirect])

  return (
    <header className="flex justify-between gap-1 border-b border-grey1 bg-grey2 p-4 text-white">
      <nav className="flex gap-4">
        {/* Home */}
        {user === undefined && <Link href="/">Accueil</Link>}

        {/* Tournaments */}
        {user !== undefined &&
          Permissions.tournaments.list(user.role) &&
          pathname.startsWith('/tournoi') && <Link href="/tournois">Tournois</Link>}

        {/* Tournament (phase1) */}
        {user !== undefined &&
          Permissions.tournaments.list(user.role) &&
          pathname.startsWith('/tournoi/') && (
            <>
              {'>'}
              <Link href={`/tournoi/${tournament?.id}`}>
                {tournament?.name}
                {tournament !== undefined && (
                  <span className="p-1 text-sm text-green1">
                    ({TournamentPhase.label[tournament.phase]})
                  </span>
                )}
              </Link>
            </>
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

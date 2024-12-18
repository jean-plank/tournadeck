'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import { Loader } from '../../components/Loader'
import { ChevronForwardFilled, PersonFilled } from '../../components/svgs/icons'
import { usePocketBase } from '../../contexts/PocketBaseContext'
import { useTournament } from '../../contexts/TournamentContext'
import { Permissions } from '../../helpers/Permissions'
import { cx } from '../../utils/cx'
import { TournamentSubPage, TournamentSubPagesNav } from './TournamentSubPagesNav'

const tournamentRegex = new RegExp(`^/tournoi/[^/]+/(${TournamentSubPage.values.join('|')})$`)

export const TournamentHeader: React.FC = () => {
  const pathname = usePathname()
  const { user, logoutAndRedirect } = usePocketBase()
  const { isLoading, tournament } = useTournament()

  const subPage = useMemo((): Optional<TournamentSubPage> => {
    const match = pathname.match(tournamentRegex)

    if (match === null) return undefined

    return match[1] as TournamentSubPage
  }, [pathname])

  const logout = useCallback(() => {
    logoutAndRedirect()
  }, [logoutAndRedirect])

  return (
    <header className="flex min-h-[59px] flex-wrap items-center justify-between gap-1 border-b border-goldenrod bg-gradient-to-br from-black to-blue1 p-4">
      <nav className="flex flex-wrap items-center gap-4">
        {user === undefined && <Link href="/">Connexion</Link>}

        {user !== undefined && Permissions.tournaments.list(user.role) && (
          <Link href="/tournois" className={cx(['underline', pathname === '/tournois'])}>
            Tournois
          </Link>
        )}

        {isLoading && (
          <>
            {user !== undefined && <ChevronForwardFilled className="h-4" />}
            <Loader className="h-4" />
          </>
        )}

        {tournament !== undefined && (
          <>
            <ChevronForwardFilled className="h-4" />
            <Link
              href={`/tournoi/${tournament.id}`}
              className={cx(['underline', subPage === undefined])}
            >
              {tournament.name}
            </Link>

            <span>:</span>

            <TournamentSubPagesNav
              tournament={tournament}
              subPage={subPage}
              displayAdmin={user !== undefined && Permissions.tournaments.create(user.role)}
              linkClassName="font-bold"
            />
          </>
        )}
      </nav>

      <div className="flex items-center gap-4">
        {user !== undefined && (
          <>
            <span>{user.displayName}</span>
            <PersonFilled className="h-4" />
            <button type="button" onClick={logout} className="border border-wheat-bis">
              Déconnexion
            </button>
          </>
        )}
      </div>
    </header>
  )
}

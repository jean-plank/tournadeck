'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import { Loader } from '../../components/Loader'
import { ChevronForwardFilled, PersonFilled } from '../../components/svgs/icons'
import { usePocketBase } from '../../contexts/PocketBaseContext'
import { Permissions } from '../../helpers/Permissions'
import { TournamentId } from '../../models/pocketBase/tables/Tournament'
import { cx } from '../../utils/cx'
import { useTournament } from './useTournament'

export const Header: React.FC = () => {
  const pathname = usePathname()
  const { user, logoutAndRedirect } = usePocketBase()

  const tournamentMatch = useMemo((): Optional<[TournamentId, SubPage]> => {
    const match = pathname.match(tournamentRegex)

    if (match === null) return undefined

    const [, tournament, subPage] = match

    return [TournamentId(tournament), subPage as SubPage]
  }, [pathname])

  const logout = useCallback(() => {
    logoutAndRedirect()
  }, [logoutAndRedirect])

  return (
    <header className="flex justify-between gap-1 border-b border-grey1 bg-grey2 p-4 text-white">
      <nav className="flex items-baseline gap-4">
        {user === undefined && <Link href="/">Accueil</Link>}

        {user !== undefined && Permissions.tournaments.list(user.role) && (
          <Link href="/tournois" className={cx(['underline', pathname === '/tournois'])}>
            Tournois
          </Link>
        )}

        {tournamentMatch !== undefined && (
          <TournamentLinks tournamentId={tournamentMatch[0]} subPage={tournamentMatch[1]} />
        )}
      </nav>

      <div className="flex items-center gap-4">
        {user !== undefined && (
          <>
            <span>{user.displayName}</span>
            <PersonFilled className="h-4" />
            <button type="button" onClick={logout} className="border border-black">
              Déconnexion
            </button>
          </>
        )}
      </div>
    </header>
  )
}

type SubPage = (typeof subPages)[number]

const subPages = ['participants', 'equipes', 'champions'] as const

const tournamentRegex = new RegExp(`^/tournoi/([^/]+)/(${subPages.join('|')})$`)

type TournamentLinksProps = {
  tournamentId: TournamentId
  subPage: SubPage
}

const TournamentLinks: React.FC<TournamentLinksProps> = ({ tournamentId, subPage }) => {
  const { data: tournament, error } = useTournament(tournamentId)

  if (error !== undefined) {
    return (
      <div className="flex justify-center">
        <span className="mt-4 font-mono">error.</span>
      </div>
    )
  }

  if (tournament === undefined) return <Loader className="h-4" />

  return (
    <>
      <ChevronForwardFilled className="h-4" />
      <Link href={`/tournoi/${tournament.id}`}>{tournament.name}</Link>

      <span>:</span>

      {tournament.phase === 'created' ? (
        <Link
          href={`/tournoi/${tournament.id}/participants`}
          className={cx('text-sm text-green1', ['underline', subPage === 'participants'])}
        >
          Participants
        </Link>
      ) : (
        <Link
          href={`/tournoi/${tournament.id}/equipes`}
          className={cx('text-sm text-green1', ['underline', subPage === 'equipes'])}
        >
          Équipes
        </Link>
      )}

      <span>·</span>

      <Link
        href={`/tournoi/${tournament.id}/champions`}
        className={cx('text-sm text-green1', ['underline', subPage === 'champions'])}
      >
        Champions
      </Link>
    </>
  )
}

import Link from 'next/link'

import type { Tournament } from '../../models/pocketBase/tables/Tournament'
import { cx } from '../../utils/cx'

type TournamentSubPage = (typeof values)[number]

const values = ['participants', 'equipes', 'champions', 'parties', 'admin'] as const

const TournamentSubPage = { values }

export { TournamentSubPage }

// ---

type Props = {
  tournament: Tournament
  subPage: Optional<TournamentSubPage>
  displayAdmin: boolean
  linkClassName?: string
}

export const TournamentSubPagesNav: React.FC<Props> = ({
  tournament,
  subPage,
  displayAdmin,
  linkClassName,
}) => (
  <>
    {tournament.phase === 'created' ? (
      <Link
        href={`/tournoi/${tournament.id}/participants`}
        className={cx(['underline', subPage === 'participants'], linkClassName)}
      >
        Participant·es
      </Link>
    ) : (
      <Link
        href={`/tournoi/${tournament.id}/equipes`}
        className={cx(['underline', subPage === 'equipes'], linkClassName)}
      >
        Équipes
      </Link>
    )}

    <span>·</span>

    <Link
      href={`/tournoi/${tournament.id}/champions`}
      className={cx(['underline', subPage === 'champions'], linkClassName)}
    >
      Champions
    </Link>

    <span>·</span>

    <Link
      href={`/tournoi/${tournament.id}/parties`}
      className={cx(['underline', subPage === 'parties'], linkClassName)}
    >
      Parties
    </Link>

    {displayAdmin && (
      <>
        <span>·</span>

        <Link
          href={`/tournoi/${tournament.id}/admin`}
          className={cx(['underline', subPage === 'admin'], linkClassName)}
        >
          Admin
        </Link>
      </>
    )}
  </>
)

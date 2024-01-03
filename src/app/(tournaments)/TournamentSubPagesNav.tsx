import Link from 'next/link'

import type { Tournament } from '../../models/pocketBase/tables/Tournament'
import { cx } from '../../utils/cx'

type TournamentSubPage = (typeof values)[number]

const values = ['participants', 'equipes', 'champions', 'parties'] as const

const TournamentSubPage = { values }

export { TournamentSubPage }

// ---

type Props = {
  tournament: Tournament
  subPage: Optional<TournamentSubPage>
  linkClassName?: string
}

export const TournamentSubPagesNav: React.FC<Props> = ({ tournament, subPage, linkClassName }) => (
  <>
    {tournament.phase === 'created' ? (
      <Link
        href={`/tournoi/${tournament.id}/participants`}
        className={cx(['underline', subPage === 'participants'], linkClassName)}
      >
        Participants
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
  </>
)

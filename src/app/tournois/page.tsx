'use server'

import Link from 'next/link'

import { listTournaments } from '../../actions/listTournaments'
import { TournamentTile } from '../../domain/tournois/TournamentTile'
import { withRedirectOnAuthError } from '../../helpers/withRedirectOnAuthError'

const Tournaments: React.FC = () =>
  withRedirectOnAuthError(listTournaments())(tournaments => (
    <div>
      <h2>Tournois</h2>
      {tournaments.map(t => (
        <Link key={t.id} href={`/tournoi/${t.id}`}>
          <TournamentTile tournament={t} />
        </Link>
      ))}
    </div>
  ))

export default Tournaments

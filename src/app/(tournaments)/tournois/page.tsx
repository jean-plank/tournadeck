import Link from 'next/link'

import { listTournaments } from '../../../actions/listTournaments'
import { TournamentTile } from '../../../domain/(tournaments)/tournois/TournamentTile'
import { withRedirectOnAuthError } from '../../../helpers/withRedirectOnAuthError'

const Tournaments: React.FC = () =>
  withRedirectOnAuthError(listTournaments())(tournaments => (
    <div className="flex flex-col items-center gap-2 p-4">
      {tournaments.length !== 0 ? (
        tournaments.map(t => (
          <Link key={t.id} href={`/tournoi/${t.id}`}>
            <TournamentTile tournament={t} />
          </Link>
        ))
      ) : (
        <div className="text-gold">Aucun tournoi n’a encore été créé.</div>
      )}
    </div>
  ))

export default Tournaments

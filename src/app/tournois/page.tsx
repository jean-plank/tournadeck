import Link from 'next/link'

import { listTournaments } from '../../actions/tournaments'
import { TournamentTile } from '../../domain/tournois/TournamentTile'

const Tournaments: React.FC = async () => {
  const tournaments = await listTournaments()

  return (
    <div>
      <h2>Tournois</h2>
      {tournaments.map(t => (
        <Link key={t.id} href={`/tournoi/${t.id}`}>
          <TournamentTile tournament={t} />
        </Link>
      ))}
    </div>
  )
}

export default Tournaments

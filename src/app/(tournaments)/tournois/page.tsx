import Link from 'next/link'

import { listTournaments } from '../../../actions/listTournaments'
import { withRedirectOnAuthError } from '../../../helpers/withRedirectOnAuthError'
import { SetTournament } from '../TournamentContext'
import { TournamentTile } from './TournamentTile'

const Tournaments: React.FC = () =>
  withRedirectOnAuthError(listTournaments())(tournaments => (
    <>
      <SetTournament tournament={undefined} />
      <div className="flex flex-col items-center gap-2 p-4">
        {tournaments.length !== 0 ? (
          tournaments.map(t => (
            <Link key={t.id} href={`/tournoi/${t.id}`}>
              <TournamentTile tournament={t} />
            </Link>
          ))
        ) : (
          <div className="text-goldenrod">Aucun tournoi n’a encore été créé.</div>
        )}
      </div>
    </>
  ))

export default Tournaments

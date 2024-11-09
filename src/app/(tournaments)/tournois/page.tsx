import { readonlyArray } from 'fp-ts'

import { listTournaments } from '../../../actions/listTournaments'
import { withRedirectOnAuthError } from '../../../helpers/withRedirectOnAuthError'
import { SetTournament } from '../TournamentContext'
import { GroupedTournaments } from './GroupedTournaments'

const Tournaments: React.FC = () =>
  withRedirectOnAuthError(listTournaments())(tournaments => (
    <>
      <SetTournament tournament={undefined} />
      <div className="flex flex-col items-center gap-10 p-4">
        {readonlyArray.isNonEmpty(tournaments) ? (
          <GroupedTournaments tournaments={tournaments} />
        ) : (
          <div className="text-goldenrod">Aucun tournoi n’a encore été créé.</div>
        )}
      </div>
    </>
  ))

export default Tournaments

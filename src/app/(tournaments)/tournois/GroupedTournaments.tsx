import { ord, readonlyArray, readonlyNonEmptyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import Link from 'next/link'

import { TournamentPhase } from '../../../models/TournamentPhase'
import { Tournament } from '../../../models/pocketBase/tables/Tournament'
import { array, partialRecord } from '../../../utils/fpTsUtils'
import { TournamentTile } from './TournamentTile'

type Props = {
  tournaments: NonEmptyArray<Tournament>
}

export const GroupedTournaments: React.FC<Props> = ({ tournaments }) => {
  const grouped = pipe(
    tournaments,
    array.groupBy(tournament => tournament.phase),
    partialRecord.map(nea =>
      nea !== undefined
        ? pipe(nea, readonlyNonEmptyArray.sort(ord.reverse(Tournament.byStart)))
        : undefined,
    ),
  )

  return pipe(
    TournamentPhase.values,
    readonlyArray.map(phase => {
      const nea = grouped[phase]

      if (nea === undefined) return null

      return (
        <div key={phase} className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-bold text-sky-300">{TournamentPhase.label[phase]}</h2>
          <ul className="flex flex-col items-center gap-2">
            {nea.map(t => (
              <li key={t.id}>
                <Link href={`/tournoi/${t.id}`}>
                  <TournamentTile tournament={t} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )
    }),
  )
}

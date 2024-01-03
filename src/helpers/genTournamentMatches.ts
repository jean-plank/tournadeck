import { readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import type { PbInput } from '../models/pocketBase/pbModels'
import type { Team } from '../models/pocketBase/tables/Team'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import type { PbMatch } from '../models/pocketBase/tables/match/Match'
import { GroupRound, KnockoutRound } from '../models/pocketBase/tables/match/MatchRound'
import { array } from '../utils/fpTsUtils'

export function genTournamentMatches(
  tournament: TournamentId,
  teams: ReadonlyArray<Team>,
): Optional<ReadonlyArray<PbInput<PbMatch>>> {
  if (teams.length === 6) {
    const groups = pipe(
      array.shuffle(teams)(),
      readonlyArray.chunksOf(3),
      readonlyArray.chainWithIndex((index, groupTeams) =>
        pipe(
          array.combine(groupTeams),
          readonlyArray.map(
            ([team1, team2]): PbInput<PbMatch> => ({
              tournament,
              round: GroupRound(index),
              bestOf: 1,
              team1: team1.id,
              team2: team2.id,
              winner: '',
              plannedOn: '',
              apiData: null,
            }),
          ),
        ),
      ),
    )

    const knockouts = pipe(
      genKnockouts(2),
      readonlyArray.map(
        (round): PbInput<PbMatch> => ({
          tournament,
          round,
          bestOf: 3,
          team1: '',
          team2: '',
          winner: '',
          plannedOn: '',
          apiData: null,
        }),
      ),
    )

    return [...groups, ...knockouts]
  }

  return undefined
}

function genKnockouts(count: number): ReadonlyArray<KnockoutRound> {
  const nonBronze: ReadonlyArray<KnockoutRound> = pipe(
    Array.from({ length: count }),
    readonlyArray.chainWithIndex(index =>
      pipe(
        Array.from({ length: 2 ** (count - 1 - index) }),
        readonlyArray.map((): KnockoutRound => KnockoutRound(index, false)),
      ),
    ),
  )

  const bronze: SingleItemArray<KnockoutRound> = 2 <= count ? [KnockoutRound(0, true)] : []

  return [...nonBronze, ...bronze]
}

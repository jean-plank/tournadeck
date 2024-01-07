import { option, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { notFound } from 'next/navigation'
import { useMemo } from 'react'

import type { ViewTournamentMatches } from '../../../../../actions/viewTournamentMatches'
import { viewTournamentMatches } from '../../../../../actions/viewTournamentMatches'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { cx } from '../../../../../utils/cx'
import { array, objectEntries, partialRecord } from '../../../../../utils/fpTsUtils'
import { SetTournament } from '../../../TournamentContext'
import { Game } from './Game'

type Props = {
  params: { tournament: TournamentId }
}

const Games: React.FC<Props> = ({ params }) =>
  withRedirectOnAuthError(viewTournamentMatches(params.tournament))(data => (
    <>
      <SetTournament tournament={data?.tournament} />
      <GamesLoaded data={data} />
    </>
  ))

export default Games

type GamesLoadedProps = {
  data: Optional<ViewTournamentMatches>
}

const GamesLoaded: React.FC<GamesLoadedProps> = ({ data }) => {
  if (data === undefined) return notFound()

  return <GamesLoadedDefined data={data} />
}

type GamesLoadedDefinedProps = {
  data: ViewTournamentMatches
}

const GamesLoadedDefined: React.FC<GamesLoadedDefinedProps> = ({ data }) => {
  const { version, attendees, teams, matches } = data

  const { groupedRounds, knockoutRoundsMax } = useMemo(() => {
    const groupedRounds_ = pipe(
      matches,
      array.groupBy(m => m.round.type),
      partialRecord.map(matches_ => {
        if (matches_ === undefined) return undefined

        return pipe(
          matches_,
          array.groupBy(m => m.round.index),
          objectEntries,
        )
      }),
      objectEntries,
    )

    return {
      groupedRounds: groupedRounds_,

      knockoutRoundsMax: pipe(
        matches,
        readonlyArray.filterMap(m =>
          m.round.type === 'KnockoutRound' ? option.some(m.round.index) : option.none,
        ),
        readonlyArray.reduce(0, (acc, index) => Math.max(acc, index)),
      ),
    }
  }, [matches])

  return (
    <div className="w-full overflow-auto">
      <ul className="flex flex-wrap items-start gap-16 p-4">
        {groupedRounds.map(([roundType, rounds]) => {
          if (rounds === undefined) return null

          const isGroupRound = roundType === 'GroupRound'
          const isKnockoutRound = roundType === 'KnockoutRound'

          return (
            <li key={roundType} className="shrink-0">
              <ul
                className={cx(
                  ['flex flex-col gap-8 row-span-4', isGroupRound],
                  ['grid grid-rows-[repeat(3,auto)] gap-x-8', isKnockoutRound],
                )}
              >
                {rounds.map(([roundIndex, matches_]) => {
                  if (matches_ === undefined) return null

                  const { left: bronze, right: nonBronze } = pipe(
                    matches_,
                    readonlyArray.partition(m =>
                      m.round.type === 'KnockoutRound' ? !m.round.isBronzeMatch : true,
                    ),
                  )

                  const gridColumnStart = Number(roundIndex) + 1

                  return (
                    <li key={roundIndex} className={cx(['contents', isKnockoutRound])}>
                      <span
                        className="row-start-1 flex pb-2 font-semibold"
                        style={{ gridColumnStart }}
                      >
                        {isGroupRound
                          ? `Poule ${Number(roundIndex) + 1}`
                          : knockoutRoundLabel(roundIndex, knockoutRoundsMax)}
                      </span>

                      {readonlyArray.isNonEmpty(nonBronze) && (
                        <ul
                          className="row-start-2 flex w-96 flex-col justify-around gap-8"
                          style={{ gridColumnStart }}
                        >
                          {nonBronze.map(match => (
                            <Game
                              key={match.id}
                              version={version}
                              teams={teams}
                              attendees={attendees}
                              match={match}
                            />
                          ))}
                        </ul>
                      )}

                      {readonlyArray.isNonEmpty(bronze) && (
                        <div className="row-start-3 w-96 pt-24">
                          <span className="flex pb-2 font-semibold">Finale des nullos</span>

                          <ul
                            className="flex flex-col justify-around gap-8"
                            style={{ gridColumnStart }}
                          >
                            {bronze.map(match => (
                              <Game
                                key={match.id}
                                version={version}
                                teams={teams}
                                attendees={attendees}
                                match={match}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function knockoutRoundLabel(index: `${number}`, total: number): string {
  const diff = total - Number(index)

  if (diff === 0) return 'Finale'
  if (diff === 1) return 'Poule de demi-finales'
  if (diff === 2) return 'Quarts de finale'
  if (diff === 3) return 'Huitièmes de finale'

  return `Finale -${diff}`
}

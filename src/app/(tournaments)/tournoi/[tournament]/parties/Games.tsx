'use client'

import { option, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Dialog } from '../../../../../components/Dialog'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import type { Tournament } from '../../../../../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import type { MatchId } from '../../../../../models/pocketBase/tables/match/MatchId'
import type { DDragonVersion } from '../../../../../models/riot/DDragonVersion'
import { cx } from '../../../../../utils/cx'
import { array, objectEntries, partialRecord } from '../../../../../utils/fpTsUtils'
import { Game } from './Game'
import { MatchForm } from './MatchForm'

export type ViewTournamentMatches = {
  version: DDragonVersion
  tournament: Tournament
  teams: ReadonlyArray<Team>
  attendees: ReadonlyArray<AttendeeWithRiotId>
  matches: ReadonlyArray<MatchApiDataDecoded>
  canUpdateMatch: boolean
}

type Props = {
  data: ViewTournamentMatches
}

export const Games: React.FC<Props> = ({ data }) => {
  const { version, attendees, teams, matches, canUpdateMatch } = data

  const dialog = useRef<HTMLDialogElement>(null)

  const [matchForm, setMatchForm] = useState<MatchId>()

  const dialogShowModal = useCallback(
    (matchId: MatchId) => () => {
      setMatchForm(matchId)
      dialog.current?.showModal()
    },
    [],
  )

  const dialogClose = useCallback(() => {
    dialog.current?.close()
  }, [])

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
      <Dialog ref={dialog}>
        {matchForm !== undefined && (
          <MatchForm matchId={matchForm} handleCancelClick={dialogClose} />
        )}
      </Dialog>

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
                              canUpdateMatch={canUpdateMatch}
                              onEmptyMatchClick={dialogShowModal(match.id)}
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
                                canUpdateMatch={canUpdateMatch}
                                onEmptyMatchClick={dialogShowModal(match.id)}
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

'use server'

import { either, option, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { useMemo } from 'react'

import { listAttendeesForTournament } from '../../../../../actions/helpers/listAttendeesForTournament'
import { listTeamsForTournament } from '../../../../../actions/helpers/listTeamsForTournament'
import { viewTournament } from '../../../../../actions/helpers/viewTournament'
import { Config } from '../../../../../config/Config'
import { theQuestService } from '../../../../../context/context'
import { adminPocketBase } from '../../../../../context/singletons/adminPocketBase'
import { withRedirectTournament } from '../../../../../helpers/withRedirectTournament'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import type { Tournament, TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import {
  MatchApiData,
  MatchApiDatas,
} from '../../../../../models/pocketBase/tables/match/MatchApiDatas'
import type { DDragonVersion } from '../../../../../models/riot/DDragonVersion'
import type { TheQuestMatch } from '../../../../../models/theQuest/TheQuestMatch'
import { cx } from '../../../../../utils/cx'
import { array, objectEntries, partialRecord } from '../../../../../utils/fpTsUtils'
import { Game } from './Game'

const { getFromPbCacheDuration, tags } = Config.constants

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const Games: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectTournament(viewTournamentMatches(params.tournament))(data => (
    <GamesLoaded data={data} />
  ))
}

export default Games

// ---

type GamesLoadedProps = {
  data: ViewTournamentMatches
}

const GamesLoaded: React.FC<GamesLoadedProps> = ({ data }) => {
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

// ---

type ViewTournamentMatches = {
  version: DDragonVersion
  tournament: Tournament
  teams: ReadonlyArray<Team>
  attendees: ReadonlyArray<AttendeeWithRiotId>
  matches: ReadonlyArray<MatchApiDataDecoded>
}

async function viewTournamentMatches(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournamentMatches>> {
  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { tournament } = data

  const adminPb = await adminPocketBase()

  const [staticData, teams, attendees, matches] = await Promise.all([
    theQuestService.getStaticData(true),
    listTeamsForTournament(adminPb, tournamentId),
    listAttendeesForTournament(adminPb, tournamentId),
    adminPb.collection('matches').getFullList({
      filter: adminPb.smartFilter<'matches'>({ tournament: tournamentId }),
      next: { revalidate: getFromPbCacheDuration, tags: [tags.matches] },
    }),
  ])

  return {
    version: staticData.version,
    tournament,
    teams,
    attendees,
    matches: pipe(
      matches,
      readonlyArray.map(
        (m): MatchApiDataDecoded => ({
          ...m,
          apiData: pipe(
            MatchApiDatas.codec.decode(m.apiData),
            either.fold(
              () => [],
              apiData =>
                apiData !== null
                  ? apiData.map(
                      (d): Optional<TheQuestMatch> => (MatchApiData.isGameId(d) ? undefined : d),
                    )
                  : [],
            ),
          ),
        }),
      ),
    ),
  }
}

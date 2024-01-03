import { option, ord, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { notFound } from 'next/navigation'
import { useMemo } from 'react'

import type { ViewTournamentMatches } from '../../../../../actions/viewTournamentMatches'
import { viewTournamentMatches } from '../../../../../actions/viewTournamentMatches'
import { TriangleRight } from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import { DayjsDuration } from '../../../../../models/Dayjs'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import { TeamId } from '../../../../../models/pocketBase/tables/Team'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import type { GameId } from '../../../../../models/riot/GameId'
import { Puuid } from '../../../../../models/riot/Puuid'
import { RiotTeamId } from '../../../../../models/riot/RiotTeamId'
import type {
  TheQuestMatch,
  TheQuestMatchParticipant,
} from '../../../../../models/theQuest/TheQuestMatch'
import { cx } from '../../../../../utils/cx'
import { array, objectEntries, partialRecord } from '../../../../../utils/fpTsUtils'
import { SetTournament } from '../../../TournamentContext'
import { GameTeam } from './GameTeam'
import { PlannedOn } from './PlannedOn'

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
  const { attendees, teams, matches } = data

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
                        className="row-start-1 flex min-w-[330px] pb-2 font-semibold"
                        style={{ gridColumnStart }}
                      >
                        {isGroupRound
                          ? `Poule ${Number(roundIndex) + 1}`
                          : knockoutRoundLabel(roundIndex, knockoutRoundsMax)}
                      </span>

                      {readonlyArray.isNonEmpty(nonBronze) && (
                        <ul
                          className={cx(
                            'row-start-2 flex flex-col justify-around',
                            ['gap-8', isGroupRound],
                            ['gap-16', isKnockoutRound],
                          )}
                          style={{ gridColumnStart }}
                        >
                          {nonBronze.map(match => (
                            <Game
                              key={match.id}
                              teams={teams}
                              attendees={attendees}
                              match={match}
                            />
                          ))}
                        </ul>
                      )}

                      {readonlyArray.isNonEmpty(bronze) && (
                        <div className="row-start-3 pt-24">
                          <span className="font-semibold">Finale des nullos</span>

                          <ul
                            className={cx(
                              'flex flex-col justify-around',
                              ['gap-8', isGroupRound],
                              ['gap-16', isKnockoutRound],
                            )}
                            style={{ gridColumnStart }}
                          >
                            {bronze.map(match => (
                              <Game
                                key={match.id}
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
  if (diff === 1) return 'Demi-finales'
  if (diff === 2) return 'Quarts de finale'
  if (diff === 3) return 'Huitièmes de finale'

  return `Finale -${diff}`
}

type GameProps = {
  teams: ReadonlyArray<Team>
  attendees: ReadonlyArray<AttendeeWithRiotId>
  match: MatchApiDataDecoded
}

type TeamWithMembers = {
  team: Team
  members: ReadonlyArray<AttendeeWithRiotId>
}

type MatchWithTeam1 = {
  match: TheQuestMatch
  team1: Optional<RiotTeamId>
}

export const Game: React.FC<GameProps> = ({ teams, attendees, match }) => {
  const { winner, plannedOn } = match

  const { team1, team2, withTeam1 } = useMemo(() => {
    const { bestOf, team1: team1Id, team2: team2Id, apiData } = match

    const team1_ = getTeamWithMembers(teams, attendees, team1Id)

    return {
      team1: team1_,
      team2: getTeamWithMembers(teams, attendees, team2Id),

      withTeam1: pipe(
        Array.from({ length: Math.max(bestOf, apiData.length) }),
        readonlyArray.mapWithIndex((i): Optional<MatchWithTeam1> => {
          const match_ = apiData[i]

          if (match_ === undefined) return undefined

          return {
            match: match_,
            team1:
              team1_ !== undefined
                ? findTeam1(
                    match_,
                    pipe(
                      team1_.members,
                      readonlyArray.map(a => a.puuid),
                    ),
                  )
                : undefined,
          }
        }),
      ),
    }
  }, [attendees, match, teams])

  return (
    <li className="flex flex-col">
      {plannedOn !== '' && <PlannedOn plannedOn={plannedOn} />}

      <div className="flex flex-col gap-0.5 overflow-hidden">
        <div className="grid grid-cols-2 gap-0.5">
          {[team1, team2].map((t, i) => {
            const isWinner = t !== undefined && winner !== '' && TeamId.Eq.equals(t.team.id, winner)

            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={cx(
                  'group flex items-center flex-wrap gap-4 text-white bg-zinc-700 px-2 py-1.5 odd:border-l-4 even:flex-row-reverse even:border-r-4',
                  isWinner
                    ? 'odd:border-l-goldenrod even:border-r-goldenrod'
                    : 'odd:border-l-zinc-700 even:border-r-zinc-700',
                )}
              >
                {t !== undefined ? (
                  <GameTeam
                    team={t.team}
                    members={t.members}
                    victoryCount={0} // TODO
                    isWinner={isWinner}
                  />
                ) : (
                  <span className="text-white/50">-</span>
                )}
              </div>
            )
          })}
        </div>

        {withTeam1.map((d, i) => {
          if (d === undefined) {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="grid grid-cols-2 gap-0.5">
                <span className="bg-grey1 px-2 py-1 text-white/50">-</span>
                <span className="bg-grey1 px-2 py-1 text-end text-white/50">-</span>
              </div>
            )
          }

          const blueIsLeft = d.team1 === 100
          const leftWon = blueIsLeft ? d.match.win === 100 : d.match.win === 200
          const blueWon = d.match.win === 100

          const t1Stats = teamStats(d.match.teams[100]?.participants ?? [])
          const t2Stats = teamStats(d.match.teams[200]?.participants ?? [])

          return (
            <a
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              href={leagueofgraphsUrl(d.match.id)}
              target="_blank"
              rel="noreferrer"
              className="grid grid-cols-[1fr_auto_1fr] text-sm text-white"
            >
              <span
                className={cx(
                  'flex items-center py-1 pl-1.5 gap-3',
                  blueIsLeft ? 'bg-match-blue' : 'bg-match-red',
                )}
              >
                {formatKda(blueIsLeft ? t1Stats : t2Stats)}
                {leftWon &&
                  formatGolds(
                    blueWon
                      ? t1Stats.goldEarned - t2Stats.goldEarned
                      : t2Stats.goldEarned - t1Stats.goldEarned,
                  )}
              </span>

              <div
                className={cx('flex', blueWon ? 'bg-match-blue' : 'bg-match-red', [
                  'flex-row-reverse',
                  leftWon,
                ])}
              >
                <div className={cx('h-full w-4', blueWon ? 'bg-match-red' : 'bg-match-blue')}>
                  <TriangleRight
                    className={cx('h-full w-full', blueWon ? 'text-match-blue' : 'text-match-red', [
                      'rotate-180',
                      !leftWon,
                    ])}
                    secondaryClassName="text-slate-900"
                  />
                </div>
                <span className="py-1 text-base">
                  {d.match.gameDuration.format(
                    ord.lt(DayjsDuration.Ord)(d.match.gameDuration, DayjsDuration({ hours: 1 }))
                      ? 'mm:ss'
                      : 'HH:mm:ss',
                  )}
                </span>
                <span className="w-4" />
              </div>

              <span
                className={cx(
                  'flex items-center justify-end py-1 pr-1.5 gap-2',
                  blueIsLeft ? 'bg-match-red' : 'bg-match-blue',
                )}
              >
                {!leftWon ? (
                  formatGolds(
                    blueIsLeft
                      ? t2Stats.goldEarned - t1Stats.goldEarned
                      : t1Stats.goldEarned - t2Stats.goldEarned,
                  )
                ) : (
                  <span />
                )}
                {formatKda(blueIsLeft ? t2Stats : t1Stats)}
              </span>
            </a>
          )
        })}
      </div>
    </li>
  )
}

const byRole = pipe(
  TeamRole.Ord,
  ord.contramap((b: AttendeeWithRiotId) => b.role),
)

function getTeamWithMembers(
  teams: ReadonlyArray<Team>,
  attendees: ReadonlyArray<AttendeeWithRiotId>,
  teamId: '' | TeamId,
): Optional<TeamWithMembers> {
  const team = teamId !== '' ? teams.find(t => TeamId.Eq.equals(t.id, teamId)) : undefined

  if (team === undefined) return undefined

  return {
    team,
    members: pipe(
      attendees,
      readonlyArray.filter(a => a.team !== '' && TeamId.Eq.equals(a.team, team.id)),
      readonlyArray.sort(byRole),
    ),
  }
}

function findTeam1(match: TheQuestMatch, team1Members: ReadonlyArray<Puuid>): Optional<RiotTeamId> {
  for (const id of RiotTeamId.values) {
    const team = match.teams[id]

    if (
      team !== undefined &&
      pipe(
        team.participants,
        readonlyArray.exists(p => readonlyArray.elem(Puuid.Eq)(p.puuid, team1Members)),
      )
    ) {
      return id
    }
  }

  return undefined
}

function leagueofgraphsUrl(gameId: GameId): string {
  return `https://www.leagueofgraphs.com/match/${constants.platform.toLowerCase()}/${gameId}`
}

function formatKda({ kills, deaths, assists }: TeamStats): React.ReactElement {
  return (
    <span>
      {kills} / {deaths} / {assists}
    </span>
  )
}

function formatGolds(goldDiff: number): React.ReactElement {
  return (
    <span className="font-semibold text-goldenrod">
      {0 <= goldDiff && '+'}
      {Math.round(goldDiff / 100) / 10} k
    </span>
  )
}

type TeamStats = {
  kills: number
  deaths: number
  assists: number
  goldEarned: number
}

function teamStats(participants: ReadonlyArray<TheQuestMatchParticipant>): TeamStats {
  let kills = 0
  let deaths = 0
  let assists = 0

  let goldEarned = 0

  participants.forEach(p => {
    kills += p.kills
    deaths += p.deaths
    assists += p.assists

    goldEarned += p.goldEarned
  })

  return { kills, deaths, assists, goldEarned }
}

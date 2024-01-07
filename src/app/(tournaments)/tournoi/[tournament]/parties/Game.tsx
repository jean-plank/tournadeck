'use client'

import { ord, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { useMemo } from 'react'

import { TriangleRight } from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import { DayjsDuration } from '../../../../../models/Dayjs'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import { TeamId } from '../../../../../models/pocketBase/tables/Team'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import type { GameId } from '../../../../../models/riot/GameId'
import { Puuid } from '../../../../../models/riot/Puuid'
import { RiotTeamId } from '../../../../../models/riot/RiotTeamId'
import type {
  TheQuestMatch,
  TheQuestMatchParticipant,
} from '../../../../../models/theQuest/TheQuestMatch'
import { cx } from '../../../../../utils/cx'
import { GameDuration } from './GameDuration'
import type { EnrichedTeam } from './GameTeam'
import { GameTeam } from './GameTeam'
import { GoldDiff } from './GoldDiff'
import { PlannedOn } from './PlannedOn'

type GameProps = {
  teams: ReadonlyArray<Team>
  attendees: ReadonlyArray<AttendeeWithRiotId>
  match: MatchApiDataDecoded
}

export const Game: React.FC<GameProps> = ({ teams, attendees, match }) => {
  const { winner, plannedOn } = match

  const { team1, team2, withTeam1 } = useMemo((): {
    team1: Optional<EnrichedTeam>
    team2: Optional<EnrichedTeam>
    withTeam1: ReadonlyArray<Optional<MatchWithTeam1>>
  } => {
    const { bestOf, team1: team1Id, team2: team2Id, apiData } = match

    const team1WithMembers = getTeamWithMembers(teams, attendees, team1Id)
    const team2WithMembers = getTeamWithMembers(teams, attendees, team2Id)

    const withTeam1_ = pipe(
      Array.from({ length: Math.max(bestOf, apiData.length) }),
      readonlyArray.mapWithIndex((i): Optional<MatchWithTeam1> => {
        const match_ = apiData[i]

        if (match_ === undefined) return undefined

        return {
          match: match_,
          team1:
            team1WithMembers !== undefined
              ? findTeam1(
                  match_,
                  pipe(
                    team1WithMembers.members,
                    readonlyArray.map(a => a.puuid),
                  ),
                )
              : undefined,
        }
      }),
    )

    return {
      team1: enrichTeam(team1WithMembers, withTeam1_, true),
      team2: enrichTeam(team2WithMembers, withTeam1_, false),
      withTeam1: withTeam1_,
    }
  }, [attendees, match, teams])

  return (
    <li className="flex flex-col">
      {plannedOn !== '' && <PlannedOn plannedOn={plannedOn} />}

      <div className="flex flex-col gap-0.5 overflow-hidden">
        <div className="grid grid-cols-2 gap-0.5">
          {[team1, team2].map((team, i) => {
            const isEven = i % 2 === 0
            const isWinner =
              team !== undefined && winner !== '' && TeamId.Eq.equals(team.id, winner)

            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={cx(
                  'group w-full grid items-center gap-4 text-white bg-zinc-700 px-2 py-1.5 odd:border-l-4 even:border-r-4',
                  isEven ? 'grid-cols-[1fr_auto]' : 'grid-cols-[auto_1fr]',
                  isWinner
                    ? 'odd:border-l-goldenrod even:border-r-goldenrod'
                    : 'odd:border-l-zinc-700 even:border-r-zinc-700',
                )}
              >
                {team !== undefined ? (
                  <GameTeam team={team} isEven={isEven} isWinner={isWinner} />
                ) : (
                  <span
                    className={cx('text-white/50 group-even:justify-self-end', [
                      'col-start-2',
                      !isEven,
                    ])}
                  >
                    -
                  </span>
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

          const { blueIsLeft, leftWon } = MatchWithTeam1.predicates(d)
          const blueWon = d.match.win === 100

          const t100Stats = teamStats(d.match.teams[100]?.participants ?? [])
          const t200Stats = teamStats(d.match.teams[200]?.participants ?? [])

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
                {formatKda(blueIsLeft ? t100Stats : t200Stats)}
                {leftWon && (
                  <GoldDiff
                    goldDiff={
                      blueWon
                        ? t100Stats.goldEarned - t200Stats.goldEarned
                        : t200Stats.goldEarned - t100Stats.goldEarned
                    }
                  />
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
                <GameDuration>
                  {d.match.gameDuration.format(
                    ord.lt(DayjsDuration.Ord)(d.match.gameDuration, DayjsDuration({ hours: 1 }))
                      ? 'mm:ss'
                      : 'HH:mm:ss',
                  )}
                </GameDuration>
                <span className="w-4" />
              </div>

              <span
                className={cx(
                  'flex items-center justify-end py-1 pr-1.5 gap-2',
                  blueIsLeft ? 'bg-match-red' : 'bg-match-blue',
                )}
              >
                {!leftWon ? (
                  <GoldDiff
                    goldDiff={
                      blueIsLeft
                        ? t200Stats.goldEarned - t100Stats.goldEarned
                        : t100Stats.goldEarned - t200Stats.goldEarned
                    }
                  />
                ) : (
                  <span />
                )}
                {formatKda(blueIsLeft ? t200Stats : t100Stats)}
              </span>
            </a>
          )
        })}
      </div>
    </li>
  )
}

type MatchWithTeam1 = {
  match: TheQuestMatch
  team1: Optional<RiotTeamId>
}

type MatchWithTeam1Predicates = {
  blueIsLeft: boolean
  leftWon: boolean
}

const MatchWithTeam1 = {
  predicates: ({ match, team1 }: MatchWithTeam1): MatchWithTeam1Predicates => {
    const blueIsLeft = team1 === 100

    return { blueIsLeft, leftWon: blueIsLeft ? match.win === 100 : match.win === 200 }
  },
}

const byRole = pipe(
  TeamRole.Ord,
  ord.contramap((b: AttendeeWithRiotId) => b.role),
)

type TeamWithMembers = {
  team: Team
  members: ReadonlyArray<AttendeeWithRiotId>
}

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

function enrichTeam(
  t: Optional<TeamWithMembers>,
  withTeam1: ReadonlyArray<Optional<MatchWithTeam1>>,
  isTeam1: boolean,
): Optional<EnrichedTeam> {
  if (t === undefined) return undefined

  const { team, members } = t

  // TODO: Monoid
  let victoryCount = 0

  withTeam1.forEach(d => {
    if (d !== undefined) {
      const { leftWon } = MatchWithTeam1.predicates(d)

      if ((leftWon && isTeam1) || (!leftWon && !isTeam1)) {
        victoryCount += 1
      }
    }
  })

  return { ...team, members, victoryCount }
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

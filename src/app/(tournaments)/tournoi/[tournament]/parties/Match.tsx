import { ord } from 'fp-ts'

import { TriangleRight } from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import { DayjsDuration } from '../../../../../models/Dayjs'
import type { GameId } from '../../../../../models/riot/GameId'
import type { RiotTeamId } from '../../../../../models/riot/RiotTeamId'
import type {
  TheQuestMatch,
  TheQuestMatchParticipant,
} from '../../../../../models/theQuest/TheQuestMatch'
import { cx } from '../../../../../utils/cx'
import { GameDuration } from './GameDuration'
import { GoldDiff } from './GoldDiff'

export const Match: React.FC<MatchWithTeam1> = d => {
  const { blueIsLeft, leftWon } = MatchWithTeam1.predicates(d)
  const blueWon = d.match.win === 100

  const t100Stats = teamStats(d.match.teams[100]?.participants ?? [])
  const t200Stats = teamStats(d.match.teams[200]?.participants ?? [])

  return (
    <a
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

export { MatchWithTeam1 }

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

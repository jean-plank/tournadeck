'use client'

import { ord } from 'fp-ts'
import { useCallback } from 'react'

import { removeGameData } from '../../../../../actions/removeGameData'
import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import { CloseFilled, TriangleRight } from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import { DayjsDuration } from '../../../../../models/Dayjs'
import { MsDuration } from '../../../../../models/MsDuration'
import type { MatchId } from '../../../../../models/pocketBase/tables/match/MatchId'
import type { DDragonVersion } from '../../../../../models/riot/DDragonVersion'
import type { GameId } from '../../../../../models/riot/GameId'
import { type TheQuestMatchParticipant } from '../../../../../models/theQuest/TheQuestMatch'
import { cx } from '../../../../../utils/cx'
import { GameDuration } from './GameDuration'
import { GoldDiff } from './GoldDiff'
import type { EnrichedParticipant } from './MatchTooltip'
import { MatchTooltip } from './MatchTooltip'

type Props = {
  version: DDragonVersion
  matchId: MatchId
  gameId: GameId
  gameDuration: MsDuration
  left: ReadonlyArray<EnrichedParticipant>
  right: ReadonlyArray<EnrichedParticipant>
  blueIsLeft: boolean
  leftWon: boolean
  blueWon: boolean
  canUpdateMatch: boolean
}

export const Match: React.FC<Props> = ({
  version,
  matchId,
  gameId,
  gameDuration: gameDuration_,
  left,
  right,
  blueIsLeft,
  leftWon,
  blueWon,
  canUpdateMatch,
}) => {
  const gameDuration = MsDuration.toDayJs(gameDuration_)

  const tooltip = useTooltip<HTMLAnchorElement>({ placement: 'right-start' })

  const leftStats = teamStats(left)
  const rightStats = teamStats(right)

  const askRemoveGameData = useCallback(() => {
    if (confirm('Êtes-vous sûr·e de vouloir supprimer cette partie ?')) {
      removeGameData(matchId, gameId).catch(() => {
        alert('Erreur.')
      })
    }
  }, [gameId, matchId])

  return (
    <li className="group/match relative flex items-center pb-0.5 first:pb-0">
      {canUpdateMatch && (
        <button
          type="button"
          onClick={askRemoveGameData}
          className="invisible absolute -left-6 opacity-0 transition-all duration-300 group-hover/match:visible group-hover/match:opacity-100"
        >
          <CloseFilled className="size-6 text-red-500" />
        </button>
      )}

      <a
        href={leagueofgraphsUrl(gameId)}
        target="_blank"
        rel="noreferrer"
        className="grid w-full grid-cols-[1fr_auto_1fr] text-sm text-white"
        {...tooltip.reference}
      >
        <span
          className={cx(
            'flex items-center py-1 pl-1.5 gap-3',
            blueIsLeft ? 'bg-match-blue' : 'bg-match-red',
          )}
        >
          {formatKda(leftStats)}
          {leftWon && <GoldDiff goldDiff={leftStats.goldEarned - rightStats.goldEarned} />}
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
            {gameDuration.format(
              ord.lt(DayjsDuration.Ord)(gameDuration, DayjsDuration({ hours: 1 }))
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
            <GoldDiff goldDiff={rightStats.goldEarned - leftStats.goldEarned} />
          ) : (
            <span />
          )}
          {formatKda(rightStats)}
        </span>
      </a>
      <Tooltip {...tooltip.floating}>
        <MatchTooltip version={version} left={left} right={right} />
      </Tooltip>
    </li>
  )
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

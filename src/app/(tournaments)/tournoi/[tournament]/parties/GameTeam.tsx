'use client'

import { readonlyArray } from 'fp-ts'
import Image from 'next/image'
import { useRef } from 'react'
import type { Merge } from 'type-fest'

import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { Tooltip } from '../../../../../components/floating/Tooltip'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { type Team } from '../../../../../models/pocketBase/tables/Team'
import { GameName } from '../../../../../models/riot/GameName'
import { TagLine } from '../../../../../models/riot/TagLine'
import { cx } from '../../../../../utils/cx'

type GameTeamProps = {
  team: EnrichedTeam
  isEven: boolean
  isWinner: boolean
}

export type EnrichedTeam = Merge<
  Team,
  {
    members: ReadonlyArray<AttendeeWithRiotId>
    victoryCount: number
  }
>

export const GameTeam: React.FC<GameTeamProps> = ({ team, isEven, isWinner }) => {
  const hoverRef = useRef<HTMLDivElement>(null)
  const placementRef = useRef<HTMLSpanElement>(null)

  return (
    <>
      <div
        ref={hoverRef}
        className={cx(
          'row-start-1 grid items-center gap-1.5',
          isEven ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1fr_auto]',
        )}
      >
        <span
          ref={placementRef}
          className="row-start-1 font-lib-mono text-sm font-semibold text-wheat"
        >
          {team.tag}
        </span>
        <span className={cx('row-start-1 truncate group-even:text-end', ['col-start-1', !isEven])}>
          {team.name}
        </span>
      </div>

      <Tooltip hoverRef={hoverRef} placementRef={placementRef} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <span className="font-lib-mono text-sm font-semibold text-wheat">{team.tag}</span>
          <span className="text-white">{team.name}</span>
        </div>

        {readonlyArray.isNonEmpty(team.members) && (
          <ul className="flex flex-col gap-1">
            {team.members.map(a => (
              <li key={a.id} className="flex items-center gap-2">
                <TeamRoleIconGold role={a.role} className="h-6" />
                <div>
                  <span className="font-medium text-goldenrod">
                    {GameName.unwrap(a.riotId.gameName)}
                  </span>
                  <span className="text-grey-500">#{TagLine.unwrap(a.riotId.tagLine)}</span>
                </div>
                {a.isCaptain && (
                  <Image
                    src="/icons/crown-64.png"
                    alt="Icône de capitaine"
                    width={20}
                    height={20}
                    className="object-cover px-0.5 opacity-90"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Tooltip>

      <span
        className={cx(
          'row-start-1 font-medium',
          ['col-start-1', !isEven],
          isWinner ? 'text-yellow-500' : 'text-sky-300',
        )}
      >
        {team.victoryCount}
      </span>
    </>
  )
}

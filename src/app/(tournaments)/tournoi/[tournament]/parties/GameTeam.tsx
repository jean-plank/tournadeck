'use client'

import Image from 'next/image'
import { useRef } from 'react'
import type { Merge } from 'type-fest'

import { TeamRoleIcon } from '../../../../../components/TeamRoleIcon'
import { Tooltip } from '../../../../../components/tooltip/Tooltip'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { type Team } from '../../../../../models/pocketBase/tables/Team'
import { cx } from '../../../../../utils/cx'

type GameTeamProps = {
  team: EnrichedTeam
  isWinner: boolean
}

export type EnrichedTeam = Merge<
  Team,
  {
    members: ReadonlyArray<AttendeeWithRiotId>
    victoryCount: number
  }
>

export const GameTeam: React.FC<GameTeamProps> = ({ team, isWinner }) => {
  const hoverRef = useRef<HTMLDivElement>(null)
  const placementRef = useRef<HTMLSpanElement>(null)

  return (
    <>
      <div
        ref={hoverRef}
        className="flex grow flex-wrap items-center gap-1.5 group-even:flex-row-reverse"
      >
        <span ref={placementRef} className="font-lib-mono text-sm font-semibold text-wheat">
          {team.tag}
        </span>
        <span className="group-even:text-end">{team.name}</span>
      </div>

      <Tooltip hoverRef={hoverRef} placementRef={placementRef}>
        <ul className="flex flex-col gap-1">
          {team.members.map(a => (
            <li key={a.id} className="flex items-center gap-2">
              <TeamRoleIcon role={a.role} className="h-6" />
              <div>
                <span className="font-medium text-goldenrod">{a.riotId.gameName}</span>
                <span className="text-grey-500">#{a.riotId.tagLine}</span>
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
      </Tooltip>

      <span className={cx('font-medium', isWinner ? 'text-yellow-500' : 'text-sky-300')}>
        {team.victoryCount}
      </span>
    </>
  )
}

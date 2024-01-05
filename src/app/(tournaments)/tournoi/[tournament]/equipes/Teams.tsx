'use client'

import { readonlyArray } from 'fp-ts'
import { Fragment } from 'react'
import type { Merge } from 'type-fest'

import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { constants } from '../../../../../config/constants'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import { cx } from '../../../../../utils/cx'
import { AttendeeTile, EmptyAttendeeTile } from '../participants/AttendeeTile'

type Props = {
  teams: ReadonlyArray<TeamWithRoleMembers>
  teamlessAttendees: ReadonlyArray<Tuple<TeamRole, NonEmptyArray<AttendeeWithRiotId>>>
}

export type TeamWithRoleMembers = Tuple<
  TeamWithBalance,
  ReadonlyRecord<TeamRole, Optional<AttendeeWithRiotId>>
>

type TeamWithBalance = Merge<Team, { balance: number }>

export const Teams: React.FC<Props> = ({ teams, teamlessAttendees }) => (
  <div className="flex flex-col pb-8">
    <div className="grid grid-cols-[auto_1fr]">
      {teams.map(([team, members], i) => (
        <Fragment key={team.id}>
          <div
            className={cx('flex flex-col items-center justify-center gap-2 px-2', [
              'bg-black/30',
              i % 2 === 0,
            ])}
          >
            <span className="font-lib-mono font-bold">{team.tag}</span>
            <span className="text-white">{team.name}</span>
            <span className="rounded-br-md rounded-tl-md bg-green1/90 px-1.5 text-white">
              ${team.balance.toLocaleString(constants.locale)}
            </span>
          </div>
          <div className={cx('flex flex-wrap gap-4 py-4 pl-2 pr-8', ['bg-black/30', i % 2 === 0])}>
            {TeamRole.values.map(role => {
              const member = members[role]

              return member !== undefined ? (
                <AttendeeTile attendee={member} captainShouldDisplayPrice={false} />
              ) : (
                <EmptyAttendeeTile role={role} />
              )
            })}
          </div>
        </Fragment>
      ))}
    </div>

    {readonlyArray.isNonEmpty(teamlessAttendees) && (
      <>
        <h2 className="self-center px-2 py-6 text-lg font-bold">Participant·es encore libres</h2>

        <div className="flex flex-col">
          {teamlessAttendees.map(([role, attendees]) => (
            <div key={role} className="flex gap-4 py-4 pl-2 odd:bg-black/30">
              <div className="flex min-h-[10rem] flex-col items-center justify-center self-center">
                <TeamRoleIconGold role={role} className="h-12 w-12" />
                <span>{attendees.length}</span>
              </div>
              {attendees.map(p => (
                <AttendeeTile key={p.id} attendee={p} captainShouldDisplayPrice={false} />
              ))}
            </div>
          ))}
        </div>
      </>
    )}
  </div>
)

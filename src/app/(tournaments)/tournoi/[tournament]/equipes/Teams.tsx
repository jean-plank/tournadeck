'use client'

import { readonlyArray } from 'fp-ts'
import { Fragment } from 'react'
import type { Merge } from 'type-fest'

import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import { ImagesOutline } from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import { cx } from '../../../../../utils/cx'
import { round } from '../../../../../utils/numberUtils'
import { AttendeeTile, EmptyAttendeeTile } from '../participants/AttendeeTile'

type TeamsProps = {
  teams: ReadonlyArray<TeamWithRoleMembers>
  teamlessAttendees: ReadonlyArray<Tuple<TeamRole, NonEmptyArray<AttendeeWithRiotId>>>
}

export type TeamWithRoleMembers = Tuple<
  TeamWithStats,
  ReadonlyRecord<TeamRole, Optional<AttendeeWithRiotId>>
>

type TeamWithStats = Merge<
  Team,
  {
    balance: number
    averageAvatarRating: number
  }
>

export const Teams: React.FC<TeamsProps> = ({ teams, teamlessAttendees }) => (
  <div className="flex flex-col pb-8">
    <div className="grid grid-cols-[auto_1fr]">
      {teams.map(([team, members], index) => (
        <Fragment key={team.id}>
          <Team index={index} team={team} />
          <div
            className={cx('flex flex-wrap gap-4 py-4 pl-2 pr-8', ['bg-black/30', index % 2 === 0])}
          >
            {TeamRole.values.map(role => {
              const member = members[role]

              return member !== undefined ? (
                <AttendeeTile
                  key={role}
                  attendee={member}
                  shouldDisplayAvatarRating={true}
                  captainShouldDisplayPrice={false}
                />
              ) : (
                <EmptyAttendeeTile key={role} role={role} />
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
              <div className="flex min-h-40 flex-col items-center justify-center self-center">
                <TeamRoleIconGold role={role} className="size-12" />
                <span>{attendees.length}</span>
              </div>
              {attendees.map(p => (
                <AttendeeTile
                  key={p.id}
                  attendee={p}
                  shouldDisplayAvatarRating={true}
                  captainShouldDisplayPrice={false}
                />
              ))}
            </div>
          ))}
        </div>
      </>
    )}
  </div>
)

type TeamProps = {
  index: number
  team: TeamWithStats
}

const Team: React.FC<TeamProps> = ({ index, team }) => {
  const balanceTooltip = useTooltip<HTMLSpanElement>()
  const averageTooltip = useTooltip<HTMLDivElement>()

  return (
    <div
      className={cx('flex flex-col items-center justify-center gap-2 px-2', [
        'bg-black/30',
        index % 2 === 0,
      ])}
    >
      <span className="font-lib-mono font-bold">{team.tag}</span>
      <span className="text-white">{team.name}</span>

      <div className="mt-2 flex flex-wrap items-center justify-around gap-6 self-stretch">
        <span
          className="rounded-br-md rounded-tl-md bg-green1/90 px-1.5 text-white"
          {...balanceTooltip.reference}
        >
          ${team.balance.toLocaleString(constants.locale)}
        </span>
        <Tooltip {...balanceTooltip.floating}>Argent restant</Tooltip>

        <div className="flex items-center gap-2 text-sky-300" {...averageTooltip.reference}>
          <ImagesOutline className="size-6" />
          <span>{round(team.averageAvatarRating, 2).toLocaleString(constants.locale)} / 5</span>
        </div>
        <Tooltip {...averageTooltip.floating}>Moyenne des notes de photos de profil</Tooltip>
      </div>
    </div>
  )
}

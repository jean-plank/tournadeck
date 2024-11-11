'use client'

import { readonlyArray } from 'fp-ts'
import { useCallback, useState } from 'react'
import type { Merge } from 'type-fest'

import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import { ChevronForwardFilled, ImagesOutline } from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import { cx } from '../../../../../utils/cx'
import { formatNumber } from '../../../../../utils/stringUtils'
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

export const Teams: React.FC<TeamsProps> = ({ teams, teamlessAttendees }) => {
  const [memberScrolled, setMemberScrolled] = useState(false)

  const onMembersMount = useCallback((e: HTMLUListElement | null) => {
    if (e !== null) {
      setMemberScrolled(e.scrollLeft > 0)
    }
  }, [])

  const handleMembersScroll = useCallback((e: React.UIEvent<HTMLUListElement>) => {
    setMemberScrolled((e.target as HTMLUListElement).scrollLeft > 0)
  }, [])

  const [focusView, setFocusView] = useState(false)

  const toggleFocusView = useCallback(() => {
    setFocusView(b => !b)
  }, [])

  const showTeamlessAttendees = readonlyArray.isNonEmpty(teamlessAttendees)

  // TODO
  const attendee = teamlessAttendees[0]?.[1][0]

  return (
    <div className="grid h-full grid-cols-[1fr_auto]">
      <div className="grid h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-y-auto area-1">
          <div className="grid grid-cols-[auto_1fr]">
            <ul
              ref={onMembersMount}
              onScroll={handleMembersScroll}
              className={cx(
                'col-start-2 overflow-x-auto',
                showTeamlessAttendees ? 'pb-6' : 'pb-14',
              )}
            >
              {teams.map(([team, members]) => (
                <li key={team.id} className="group w-max min-w-full">
                  <ul className="flex gap-4 py-4 pl-2 pr-8 group-even:bg-black/30">
                    {TeamRole.values.map(role => {
                      const member = members[role]

                      if (member === undefined) {
                        return <EmptyAttendeeTile key={role} role={role} />
                      }

                      return (
                        <AttendeeTile
                          key={role}
                          attendee={member}
                          shouldDisplayAvatarRating={true}
                          captainShouldDisplayPrice={false}
                        />
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="self-start overflow-y-clip area-1">
              <ul className={cx(['shadow-even shadow-black', memberScrolled])}>
                {teams.map(([team]) => (
                  <TeamInfo key={team.id} team={team} />
                ))}
              </ul>
            </div>
          </div>

          {showTeamlessAttendees && (
            <div className="flex w-full flex-col">
              <h2 className="w-[calc(100%-9.5rem)] self-center border-t border-goldenrod px-2 py-6 text-center text-lg font-bold">
                Participant·es sans équipe
              </h2>

              <div className="overflow-x-auto pb-14">
                <ul className="w-max min-w-full">
                  {teamlessAttendees.map(([role, attendees]) => (
                    <li key={role} className="flex gap-4 py-4 pl-2 pr-8 odd:bg-black/30">
                      <div className="flex min-h-40 flex-col items-center justify-center self-center">
                        <TeamRoleIconGold role={role} className="size-12" />
                        <span>{attendees.length}</span>
                      </div>

                      <ul className="contents">
                        {attendees.map(p => (
                          <AttendeeTile
                            key={p.id}
                            attendee={p}
                            shouldDisplayAvatarRating={true}
                            captainShouldDisplayPrice={false}
                          />
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleFocusView}
          className="self-center justify-self-end rounded-l-lg border-y border-l border-goldenrod bg-blue1 py-1 area-1"
        >
          <ChevronForwardFilled
            className={cx('size-6 text-goldenrod', ['rotate-180', !focusView])}
          />
        </button>
      </div>

      {focusView && (
        <div className="border-l border-goldenrod bg-blue1 p-2">
          {attendee !== undefined && (
            <AttendeeTile
              attendee={attendee}
              shouldDisplayAvatarRating={true}
              captainShouldDisplayPrice={true}
            />
          )}
        </div>
      )}
    </div>
  )
}

type TeamInfoProps = {
  team: TeamWithStats
}

const TeamInfo: React.FC<TeamInfoProps> = ({ team }) => {
  const balanceTooltip = useTooltip<HTMLSpanElement>()
  const averageTooltip = useTooltip<HTMLDivElement>()

  return (
    <li className="flex min-h-[376px] flex-col items-center justify-center gap-2 px-2 even:bg-black/30">
      <span className="font-lib-mono font-bold">{team.tag}</span>
      <span className="text-white">{team.name}</span>

      <div className="mx-2 mt-2 flex items-center justify-around gap-6 self-stretch">
        <span
          className="rounded-br-md rounded-tl-md bg-green1/90 px-1.5 text-white"
          {...balanceTooltip.reference}
        >
          ${team.balance.toLocaleString(constants.locale)}
        </span>
        <Tooltip {...balanceTooltip.floating}>Solde</Tooltip>

        <div
          className="flex shrink-0 items-center gap-2 text-sky-300"
          {...averageTooltip.reference}
        >
          <ImagesOutline className="size-6" />
          <span>{formatNumber(team.averageAvatarRating, 2)} / 5</span>
        </div>
        <Tooltip {...averageTooltip.floating}>Moyenne des notes de photos de profil</Tooltip>
      </div>
    </li>
  )
}

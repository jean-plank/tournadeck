'use client'

import { option, readonlyArray, separated } from 'fp-ts'
import type { Separated } from 'fp-ts/Separated'
import { flow, pipe, tuple } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import { useCallback, useMemo, useState } from 'react'

import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { ChevronForwardFilled } from '../../../../../components/svgs/icons'
import { groupAndSortAttendees } from '../../../../../helpers/groupAndSortAttendees'
import { useLocalStorageState } from '../../../../../hooks/useLocalStorageState'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { Attendee } from '../../../../../models/pocketBase/tables/Attendee'
import type { TeamId } from '../../../../../models/pocketBase/tables/Team'
import type { Tournament } from '../../../../../models/pocketBase/tables/Tournament'
import { cx } from '../../../../../utils/cx'
import { DraggableAttendeeTile } from './DraggableAttendeeTile'
import type { Seed } from './MercatoPanel'
import { MercatoPanel, MercatoValue } from './MercatoPanel'
import type { TeamWithStats } from './TeamInfo'
import { TeamInfo } from './TeamInfo'
import { TeamLi } from './TeamLi'
import { captainShouldDisplayPrice, shouldDisplayAvatarRating } from './constants'

export type TeamsProps = {
  tournament: Tournament
  teams: ReadonlyArray<TeamWithRoleMembers>
  teamlessAttendees: ReadonlyArray<AttendeeWithRiotId>
  draggingState: Optional<DraggingState>
}

export type TeamWithRoleMembers = Tuple<
  TeamWithStats,
  Partial<ReadonlyRecord<TeamRole, AttendeeWithRiotId>>
>

export type DraggingState = {
  active: AttendeeWithRiotId
  over: Optional<TeamId>
  /**
   * If over should be disabled for this active.
   */
  disabled: boolean
}

const nullableMercatoValueCodec = C.nullable(MercatoValue.codec)

export const Teams: React.FC<TeamsProps> = ({
  tournament,
  teams,
  teamlessAttendees,
  draggingState,
}) => {
  //
  // scroll shadow

  const [memberScrolled, setMemberScrolled] = useState(false)

  const onMembersMount = useCallback((e: Nullable<HTMLUListElement>) => {
    if (e !== null) {
      setMemberScrolled(e.scrollLeft > 0)
    }
  }, [])

  const handleMembersScroll = useCallback((e: React.UIEvent<HTMLUListElement>) => {
    setMemberScrolled((e.target as HTMLUListElement).scrollLeft > 0)
  }, [])

  // mercato panel

  const [mercatoPanelOpen, setMercatoPanelOpen] = useLocalStorageState(
    `${tournament.id}-mercatoPanelOpen`,
    [C.boolean, 'boolean'],
    false,
  )

  const toggleMercatoPanelOpen = useCallback(() => {
    setMercatoPanelOpen(b => !b)
  }, [setMercatoPanelOpen])

  const [mercatoValue, setMercatoValue] = useLocalStorageState(
    `${tournament.id}-mercatoValue`,
    [nullableMercatoValueCodec, 'Nullable<MercatoValue>'],
    null,
  )

  // ---

  type OtherAndMercatoAttendees = Separated<
    ReadonlyArray<Tuple<TeamRole, NonEmptyArray<AttendeeWithRiotId>>>,
    ReadonlyArray<AttendeeWithRiotId>
  >

  const { left: otherAttendees, right: mercatoViewAttendees } = useMemo<OtherAndMercatoAttendees>(
    () =>
      pipe(
        partitionTeamlessAttendees(teamlessAttendees, mercatoValue),
        separated.mapLeft(roleEntries),
      ),
    [mercatoValue, teamlessAttendees],
  )

  const showTeamlessAttendees = readonlyArray.isNonEmpty(otherAttendees)

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
                <TeamLi
                  key={team.id}
                  teamId={team.id}
                  members={members}
                  highlight={
                    highlight(draggingState, team.id) ? draggingState.active.role : undefined
                  }
                />
              ))}
            </ul>

            <div className="self-start overflow-y-clip area-1">
              <ul className={cx(['shadow-even shadow-black', memberScrolled])}>
                {teams.map(([team]) => (
                  <TeamInfo
                    key={team.id}
                    team={team}
                    highlight={highlight(draggingState, team.id)}
                  />
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
                  {otherAttendees.map(([role, attendees]) => (
                    <li key={role} className="flex gap-4 py-4 pl-2 pr-8 odd:bg-black/30">
                      <div className="flex min-h-40 flex-col items-center justify-center self-center">
                        <TeamRoleIconGold role={role} className="size-12" />
                        <span>{attendees.length}</span>
                      </div>

                      <ul className="contents">
                        {attendees.map(attendee => (
                          <DraggableAttendeeTile
                            key={attendee.id}
                            attendee={attendee}
                            shouldDisplayAvatarRating={shouldDisplayAvatarRating}
                            captainShouldDisplayPrice={captainShouldDisplayPrice}
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
          onClick={toggleMercatoPanelOpen}
          className="self-center justify-self-end rounded-l-lg bg-goldenrod py-1 text-black area-1"
        >
          <ChevronForwardFilled className={cx('size-6', ['rotate-180', !mercatoPanelOpen])} />
        </button>
      </div>

      {mercatoPanelOpen && (
        <MercatoPanel
          tournamentTeamsCount={tournament.teamsCount}
          mercatoValue={mercatoValue}
          setMercatoValue={setMercatoValue}
          attendees={mercatoViewAttendees}
        />
      )}
    </div>
  )
}

/**
 * Rights are the mercato view attendees. Lefts are the others.
 */
function partitionTeamlessAttendees(
  teamlessAttendees: ReadonlyArray<AttendeeWithRiotId>,
  mercatoValue: Nullable<MercatoValue>,
): Separated<
  Partial<ReadonlyRecord<TeamRole, NonEmptyArray<AttendeeWithRiotId>>>,
  ReadonlyArray<AttendeeWithRiotId>
> {
  if (mercatoValue === null) {
    return separated.separated(groupAndSortAttendees(teamlessAttendees), [])
  }

  return pipe(
    teamlessAttendees,
    typeof mercatoValue === 'number'
      ? flow(
          readonlyArray.partition(filterBySeed(mercatoValue)),
          separated.map(readonlyArray.sort(Attendee.byRole)),
        )
      : flow(
          readonlyArray.partition(filterByRole(mercatoValue)),
          separated.map(readonlyArray.sort(Attendee.bySeed)),
        ),
    separated.mapLeft(groupAndSortAttendees),
  )
}

const filterBySeed =
  (seed: Seed) =>
  (attendee: AttendeeWithRiotId): boolean =>
    attendee.seed === seed

const filterByRole =
  (role: TeamRole) =>
  (attendee: AttendeeWithRiotId): boolean =>
    TeamRole.Eq.equals(attendee.role, role)

function roleEntries(
  attendeesByRole: Partial<ReadonlyRecord<TeamRole, NonEmptyArray<AttendeeWithRiotId>>>,
): ReadonlyArray<Tuple<TeamRole, NonEmptyArray<AttendeeWithRiotId>>> {
  return pipe(
    TeamRole.values,
    readonlyArray.filterMap(role =>
      pipe(
        option.fromNullable(attendeesByRole[role]),
        option.map(as => tuple(role, as)),
      ),
    ),
  )
}

function highlight(
  draggingState: Optional<DraggingState>,
  teamId: TeamId,
): draggingState is DraggingState {
  return draggingState !== undefined && !draggingState.disabled && draggingState.over === teamId
}

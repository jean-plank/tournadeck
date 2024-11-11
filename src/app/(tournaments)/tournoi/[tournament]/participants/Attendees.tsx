'use client'

import { useCallback, useMemo, useRef } from 'react'

import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { usePocketBase } from '../../../../../contexts/PocketBaseContext'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Tournament } from '../../../../../models/pocketBase/tables/Tournament'
import { array } from '../../../../../utils/fpTsUtils'
import { AttendeeForm } from './AttendeeForm'
import { AttendeeTile } from './AttendeeTile'
import { groupAndSortAttendees } from './groupAndSortAttendees'

type Props = {
  tournament: Tournament
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

const attendeeTileWidth = 248 // px
const attendeesGap = 16 // px

export const Attendees: React.FC<Props> = ({ tournament, attendees }) => {
  const { user } = usePocketBase()

  const dialog = useRef<HTMLDialogElement>(null)

  const handleSuscribeClick = useCallback((): void => {
    if (dialog.current !== null) dialog.current.showModal()
  }, [])

  const handleCancelClick = useCallback((): void => {
    if (dialog.current !== null) dialog.current.close()
  }, [])

  const onSuscribeOk = useCallback((): void => {
    if (dialog.current !== null) dialog.current.close()
  }, [])

  const alreadySubscribed =
    user !== undefined && attendees.find(a => a.user === user.id) !== undefined

  const groupedAndSorted = useMemo(() => groupAndSortAttendees(attendees), [attendees])

  return (
    <div className="flex flex-col items-start gap-5">
      {attendees.length < tournament.teamsCount * 5 && !alreadySubscribed && (
        <dialog ref={dialog} className="bg-transparent">
          <AttendeeForm
            tournament={tournament.id}
            handleCancelClick={handleCancelClick}
            onSubscribeOk={onSuscribeOk}
            avalaibleTeamRole={TeamRole.values.reduce(
              (acc, v) =>
                attendees.filter(p => p.role === v).length < tournament.teamsCount
                  ? [...acc, v]
                  : acc,
              array.empty<TeamRole>(),
            )}
          />
        </dialog>
      )}

      <div className="flex w-full flex-col items-center gap-6 pt-6">
        <div className="flex flex-col items-center gap-6">
          {!alreadySubscribed && (
            <button
              type="button"
              onClick={handleSuscribeClick}
              className="rounded bg-goldenrod px-8 py-2 text-3xl font-bold text-white"
            >
              S’inscrire
            </button>
          )}
          <span className="font-bold">
            Participant·es ({attendees.length} / {tournament.teamsCount * 5})
          </span>
        </div>

        <ul className="grid w-full grid-rows-5 overflow-auto pb-14">
          {TeamRole.values.map(role => (
            <li key={role} className="flex justify-center gap-4 py-4 pl-2 pr-8 odd:bg-black/30">
              <div className="flex min-h-40 flex-col items-center justify-center self-center">
                <TeamRoleIconGold role={role} className="size-12" />
                <span>
                  {groupedAndSorted[role]?.length ?? 0}/{tournament.teamsCount}
                </span>
              </div>

              <ul
                className="flex min-h-[344px] gap-4"
                style={{
                  minWidth:
                    (attendeeTileWidth + attendeesGap) * tournament.teamsCount - attendeesGap,
                }}
              >
                {groupedAndSorted[role]?.map(p => (
                  <AttendeeTile
                    key={p.id}
                    attendee={p}
                    shouldDisplayAvatarRating={false}
                    captainShouldDisplayPrice={true}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

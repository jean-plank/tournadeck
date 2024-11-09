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
import { Menu, MenuItem } from './DropdownMenu'
import { groupAndSortAttendees } from './groupAndSortAttendees'

type Props = {
  tournament: Tournament
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

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
    <div className="flex flex-col items-start gap-5 pb-8">
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

      <div className="flex self-center p-4">
        <Menu label="Edit">
          <MenuItem label="Undo" onClick={() => console.log('Undo')} />
          <MenuItem label="Redo" disabled={true} />
          <MenuItem label="Cut" />
          <Menu label="Copy as">
            <MenuItem label="Text" />
            <MenuItem label="Video" />
            <Menu label="Image">
              <MenuItem label=".png" />
              <MenuItem label=".jpg" />
              <MenuItem label=".svg" />
              <MenuItem label=".gif" />
            </Menu>
            <MenuItem label="Audio" />
          </Menu>
          <Menu label="Share">
            <MenuItem label="Mail" />
            <MenuItem label="Instagram" />
          </Menu>
        </Menu>
      </div>

      <div className="flex w-full flex-col items-center gap-6 py-6">
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

        <div className="grid w-full grid-rows-5">
          {TeamRole.values.map(role => (
            <div key={role} className="flex gap-4 py-4 pl-2 pr-8 odd:bg-black/30">
              <div className="flex min-h-40 flex-col items-center justify-center self-center">
                <TeamRoleIconGold role={role} className="size-12" />
                <span>
                  {groupedAndSorted[role]?.length ?? 0}/{tournament.teamsCount}
                </span>
              </div>
              {groupedAndSorted[role]?.map(p => (
                <AttendeeTile key={p.id} attendee={p} captainShouldDisplayPrice={true} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

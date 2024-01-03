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

  // TODO: check role is still open
  const alreadySubscribed =
    attendees.length < tournament.teamsCount * 5 &&
    user !== undefined &&
    attendees.find(a => a.user === user.id) !== undefined

  const groupedAndSorted = useMemo(() => groupAndSortAttendees(attendees), [attendees])

  return (
    <div className="flex flex-col items-start gap-5">
      {!alreadySubscribed && (
        <dialog ref={dialog} className="bg-transparent">
          <div className="flex flex-col items-end">
            <AttendeeForm
              tournament={tournament.id}
              onSubscribeOk={onSuscribeOk}
              avalaibleTeamRole={TeamRole.values.reduce(
                (acc, v) =>
                  attendees.filter(p => p.role === v).length < tournament.teamsCount
                    ? [...acc, v]
                    : acc,
                array.empty<TeamRole>(),
              )}
            />
            <button
              type="button"
              className="m-1 rounded bg-white1 px-1 text-xs text-goldenrod"
              onClick={handleCancelClick}
            >
              Annuler
            </button>
          </div>
        </dialog>
      )}

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
            Participants ({attendees.length} / {tournament.teamsCount * 5})
          </span>
        </div>

        <div className="grid w-full grid-rows-5">
          {TeamRole.values.map(role => (
            <div key={role} className="flex gap-4 py-4 pl-2 odd:bg-black/30">
              <div className="flex min-h-[10rem] flex-col items-center justify-center self-center">
                <TeamRoleIconGold role={role} className="h-12 w-12" />
                <span>
                  {groupedAndSorted[role]?.length ?? 0}/{tournament.teamsCount}
                </span>
              </div>
              {groupedAndSorted[role]?.map(p => <AttendeeTile key={p.id} attendee={p} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

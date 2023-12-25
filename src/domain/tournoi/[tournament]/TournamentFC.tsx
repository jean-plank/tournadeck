'use client'

import { Fragment, useCallback, useRef } from 'react'

import { TeamRoleIcon } from '../../../components/TeamRoleIcon'
import { usePocketBase } from '../../../contexts/PocketBaseContext'
import { TeamRole } from '../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../models/attendee/AttendeeWithRiotId'
import type { Tournament } from '../../../models/pocketBase/tables/Tournament'
import { AttendeeForm } from './AttendeeForm'
import { AttendeeTile } from './AttendeeTile'
import { SmallAttendeeTile } from './SmallAttendeeTile'
import './test.css'

type Props = {
  tournament: Tournament
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

export const TournamentFC: React.FC<Props> = ({ tournament, attendees }) => {
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
    attendees.length < tournament.teamsCount * 5 &&
    user !== undefined &&
    attendees.find(a => a.user === user.id) !== undefined

  return (
    <div className="flex flex-col gap-5">
      <div className="text-white">
        <h1 className="text-lg font-bold">{tournament.name}</h1>
        <div>Début : {tournament.start}</div>
        <div>Fin : {tournament.end}</div>
      </div>

      {!alreadySubscribed && (
        <>
          <button type="button" onClick={handleSuscribeClick} className="w-20 bg-black text-white">
            S’inscrire
          </button>

          <dialog ref={dialog}>
            <h2>Inscription</h2>
            <AttendeeForm tournament={tournament.id} onSubscribeOk={onSuscribeOk} />
            <button type="button" className="p-2" onClick={handleCancelClick}>
              Annuler
            </button>
          </dialog>
        </>
      )}

      <div>
        <h2 className="text-lg font-bold text-white">
          Participants ({attendees.length} / {tournament.teamsCount * 5})
        </h2>
        <div className="flex flex-row">
          {TeamRole.values.map(role => (
            <div key={role}>
              <TeamRoleIcon role={role} className="h-32 w-32" />
              {attendees
                .filter(p => p.role === role)
                .map(p => (
                  <Fragment key={p.id}>
                    <AttendeeTile attendee={p} />
                    <SmallAttendeeTile data={p} />
                  </Fragment>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

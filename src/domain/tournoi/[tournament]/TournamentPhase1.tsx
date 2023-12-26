'use client'

import { Fragment, useCallback, useRef } from 'react'

import { TeamRoleIcon } from '../../../components/TeamRoleIcon'
import { usePocketBase } from '../../../contexts/PocketBaseContext'
import { TeamRole } from '../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../models/attendee/AttendeeWithRiotId'
import type { Tournament } from '../../../models/pocketBase/tables/Tournament'
import { AttendeeForm } from './AttendeeForm'
import { AttendeeTile } from './AttendeeTile'

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
          <button
            type="button"
            onClick={handleSuscribeClick}
            className="w-40 rounded bg-green1 text-white"
          >
            S’inscrire
          </button>

          <dialog ref={dialog} className="bg-transparent">
            <h2 className="bg-transparent text-center text-lg font-bold">Inscription</h2>
            <AttendeeForm
              tournament={tournament.id}
              onSubscribeOk={onSuscribeOk}
              avalaibleTeamRole={TeamRole.values.reduce(
                (acc: TeamRole[], v) =>
                  attendees.filter(p => p.role === v).length < tournament.teamsCount
                    ? [...acc, v]
                    : acc,
                [],
              )}
            />
            <button type="button" className="p-2" onClick={handleCancelClick}>
              Annuler
            </button>
          </dialog>
        </>
      )}

      <div className="flex flex-col items-center">
        <h2 className="text-lg font-bold text-white">
          Participants ({attendees.length} / {tournament.teamsCount * 5})
        </h2>
        <div className="flex flex-row">
          {TeamRole.values.map(role => (
            <div key={role}>
              <div className="flex min-w-[15rem] flex-row items-center justify-center ">
                <TeamRoleIcon role={role} className="h-16 w-16" />
                <div>{attendees.filter(p => p.role === role).length}/5</div>
              </div>
              {attendees
                .filter(p => p.role === role)
                .map(p => (
                  <Fragment key={p.id}>
                    <AttendeeTile attendee={p} />
                  </Fragment>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

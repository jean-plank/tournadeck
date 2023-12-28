'use client'

import { Fragment, useCallback, useRef } from 'react'

import { TeamRoleIcon } from '../../../components/TeamRoleIcon'
import { usePocketBase } from '../../../contexts/PocketBaseContext'
import { extractDateAndTime } from '../../../models/Dayjs'
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

  const dateDebut = extractDateAndTime(tournament.start)
  const dateFin = extractDateAndTime(tournament.end)

  return (
    <div className="flex flex-col items-start gap-5 text-gold">
      <div className="flex w-full flex-col items-center justify-center">
        <h1 className="font-friz text-[4rem] font-bold">{tournament.name}</h1>

        <div className="flex flex-row items-center gap-5 text-white">
          <span className="font-bold">{dateDebut?.date}</span>

          <span className="font-bold">{dateFin?.date}</span>
        </div>
      </div>

      {!alreadySubscribed && (
        <dialog ref={dialog} className="bg-transparent">
          <div className="flex flex-col items-end">
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
            <button
              type="button"
              className="m-1 rounded bg-white1 px-1 text-xs text-gold"
              onClick={handleCancelClick}
            >
              Annuler
            </button>
          </div>
        </dialog>
      )}

      <div className="flex w-full flex-col items-center">
        <div className="flex flex-col items-center">
          {!alreadySubscribed && (
            <button
              type="button"
              onClick={handleSuscribeClick}
              className="my-2 rounded bg-gold px-8 py-2 text-[2rem] font-bold text-white"
            >
              S’inscrire
            </button>
          )}
          <h2 className="font-bold">
            Participants ({attendees.length} / {tournament.teamsCount * 5})
          </h2>
        </div>

        <div className="flex w-full flex-col items-start">
          {TeamRole.values.map(role => (
            <div className="flex flex-row justify-start gap-2 pl-2" key={role}>
              <div className="flex min-h-[10rem] flex-col items-center justify-center">
                <TeamRoleIcon role={role} className="h-16 w-16" />
                <div>
                  {attendees.filter(p => p.role === role).length}/{tournament.teamsCount}
                </div>
              </div>
              {attendees
                .filter(p => p.role === role)
                .toSorted((a, b) => a.seed - b.seed)
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

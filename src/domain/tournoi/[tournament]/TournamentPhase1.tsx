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

function extractDateAndTime(dateString: string): { date: string; time: string } | null {
  try {
    const dateObject = new Date(dateString)

    if (isNaN(dateObject.getTime())) {
      throw new Error('Invalid date string')
    }

    const extractedDate = dateObject.toISOString().split('T')[0]
    const extractedTime = `${('0' + dateObject.getUTCHours()).slice(-2)}:${(
      '0' + dateObject.getUTCMinutes()
    ).slice(-2)}`

    return {
      date: extractedDate,
      time: extractedTime,
    }
  } catch (error) {
    console.error('Error extracting date and time:', error)
    return null
  }
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-row items-center gap-16 text-black">
        <h1 className="text-[3rem] font-bold">{tournament.name}</h1>
        <div className="flex flex-col items-center">
          <span className="font-bold">{dateDebut?.date}</span> <span>{dateDebut?.time}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold">{dateFin?.date}</span> <span>{dateFin?.time}</span>
        </div>
      </div>

      {!alreadySubscribed && (
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
      )}

      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-black">
            Participants ({attendees.length} / {tournament.teamsCount * 5})
          </h2>

          {!alreadySubscribed && (
            <button
              type="button"
              onClick={handleSuscribeClick}
              className="my-4 w-40 rounded bg-green1 py-2 text-xl font-bold text-white"
            >
              S’inscrire
            </button>
          )}
        </div>
        <div className="flex flex-row">
          {TeamRole.values.map(role => (
            <div key={role}>
              <div className="flex min-w-[15rem] flex-row items-center justify-center ">
                <TeamRoleIcon role={role} className="h-16 w-16" />
                <div>{attendees.filter(p => p.role === role).length}/5</div>
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

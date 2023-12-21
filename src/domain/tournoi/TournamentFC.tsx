import { useCallback, useEffect, useRef, useState } from 'react'

import { TeamRoleIcon } from '../../components/TeamRoleIcon'
import { usePocketBase } from '../../contexts/PocketBaseContext'
import type { Attendee } from '../../models/Attendees'
import { TeamRole } from '../../models/TeamRole'
import type { Tournament } from '../../models/Tournament'
import { AttendeeForm } from './AttendeeForm'
import { AttendeeTile } from './AttendeeTile'
import { SmallAttendeeTile } from './SmallAttendeeTile'
import './test.css'

type Props = {
  data: Tournament
}
export const TournamentFC: React.FC<Props> = ({ data }) => {
  const [participants, setParticipants] = useState<Attendee[]>([])
  const [suscribed, setSuscribed] = useState(false)
  const { pb, user } = usePocketBase()

  const dialog = useRef<null | HTMLDialogElement>(null)

  useEffect(() => {
    pb.collection('attendees')
      .getFullList<Attendee>({
        filter: `tournament = "${data.id}"`,
      })
      .then(res => setParticipants(res))
  }, [data.id, pb, suscribed])

  // check if user register
  useEffect(() => {
    setSuscribed(
      participants.length < data.maxTeams * 5 &&
        user !== null &&
        participants.find(attendee => attendee.user === user.id) !== undefined,
    )
  }, [data, participants, user])

  const handleSuscribeClick = useCallback((): void => {
    if (dialog.current !== null) dialog.current.showModal()
  }, [])

  const handleCancelClick = useCallback((): void => {
    if (dialog.current !== null) dialog.current.close()
  }, [])

  const onSuscribeOk = useCallback((): void => {
    if (dialog.current !== null) dialog.current.close()
    setSuscribed(true)
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold">{data.name}</h1>
        <div>Début : {data.start}</div>
        <div>Fin : {data.end}</div>
      </div>

      {!suscribed && (
        <>
          <button type="button" onClick={handleSuscribeClick} className="w-20 bg-black text-white">
            S’inscrire
          </button>

          <dialog ref={dialog}>
            <h2>Inscription</h2>
            <AttendeeForm tournamentId={data.id} onSuscribeOk={onSuscribeOk} />
            <button className="cursor-pointer p-2" type="button" onClick={handleCancelClick}>
              Annuler
            </button>
          </dialog>
        </>
      )}

      <div>
        <h2 className="text-lg font-bold">
          Participants ({participants.length}/{data.maxTeams * 5})
        </h2>
        <div className="flex flex-row">
          {TeamRole.values.map(role => (
            <div key={role}>
              <TeamRoleIcon role={role} />
              {participants
                .filter(p => p.role === role)
                .map(p => (
                  <>
                    <AttendeeTile data={p} key={p.id} />
                    <SmallAttendeeTile data={p} key={p.id} />
                  </>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

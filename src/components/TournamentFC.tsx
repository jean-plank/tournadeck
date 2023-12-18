import { useCallback, useEffect, useRef, useState } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'
import type { Attendee } from '../models/Attendees'
import type { Tournament } from '../models/Tournament'
import AttendeeForm from './AttendeeForm'
import { AttendeeTile } from './AttendeeTile'
import './test.css'

type Props = { data: Tournament }
export const TournamentFC: React.FC<Props> = ({ data }: Props) => {
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

  //Check si l'utilisateur est déjà inscrit
  useEffect(() => {
    setSuscribed(
      participants.length < data.maxTeams * 5 &&
        user !== null &&
        participants.find(attendee => attendee.user === user.id) !== undefined,
    )
  }, [data, participants, user])

  // useEffect(() => console.log(participants), [participants])
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
        <div>Debut : {data.start}</div>
        <div>Debut : {data.end}</div>
      </div>

      {!suscribed && (
        <>
          <button
            type="submit"
            onClick={handleSuscribeClick}
            className="w-[5rem] bg-black text-white"
          >
            S'inscrire
          </button>

          <dialog ref={dialog}>
            <h2>Inscription</h2>
            <AttendeeForm tournamentId={data.id} onSuscribeOk={onSuscribeOk} />
            <button className="cursor-pointer p-2" type="submit" onClick={handleCancelClick}>
              cancel
            </button>
          </dialog>
        </>
      )}

      <div>
        <h2 className="text-lg font-bold"> Intendees</h2>
        {participants.map(p => (
          <AttendeeTile data={p} key={p.id} />
        ))}
      </div>
    </div>
  )
}

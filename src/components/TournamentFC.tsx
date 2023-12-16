import { useEffect, useState } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'
import type { Attendee } from '../models/Attendees'
import type { Tournament } from '../models/Tournament'
import { AttendeeTile } from './AttendeeTile'

type Props = { data: Tournament }
export const TournamentFC: React.FC<Props> = ({ data }: Props) => {
  const [participants, setParticipants] = useState<Attendee[]>([])
  const { pb } = usePocketBase()

  useEffect(() => {
    pb.collection('attendees')
      .getFullList<Attendee>({
        // filter: `tournament == "${data.id}"`,
      })
      .then(res => setParticipants(res))
  }, [data.id, pb])

  useEffect(() => console.log(participants), [participants])
  return (
    <div className="">
      <div className="text-lg font-bold">{data.name}</div>
      <div>Debut : {data.start}</div>
      <div>Debut : {data.end}</div>
      <h2>Intendees</h2>
      {participants.map(p => (
        <AttendeeTile data={p} key={p.id} />
      ))}
    </div>
  )
}

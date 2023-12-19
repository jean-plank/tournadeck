/* eslint-disable @next/next/no-img-element */
import type { Attendee } from '../models/Attendees'
import { getImageUrl } from '../utils/pocketBaseImageUrl'

type Props = {
  data: Attendee
}

export const AttendeeTile: React.FC<Props> = ({ data }: Props) => (
  <div className="relative flex w-80 flex-col items-center rounded-lg border-2 border-gray-600 bg-blue-200 p-4">
    <h3 className="text-center text-xl font-bold">WANTED</h3>

    <img
      className="h-[15rem] w-[15rem] rounded-xl border-2 border-gray-400   object-cover object-center"
      src={getImageUrl(data.avatar, 'attendees', data.id)}
      alt="avatar"
    />

    <div className="z-30 font-bold">
      <div className="text-xl">{data.riotId}</div>
      <div className="">Elo : {data.currentElo}</div>
      <div className="">PeakElo : {data.comment}</div>
      <div className="">Role {data.role}</div>
      <div className="">Pool de champion : {data.championPool}</div>
      <div>Ville natale : {data.birthPlace}</div>
    </div>
    {/* <Image
        src={getImageUrl(data.avatar, 'attendees', data.id)}
        width={200}
        height={200}
        alt="avatar"
      /> */}
  </div>
)

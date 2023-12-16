import Image from 'next/image'

import type { Attendee } from '../models/Attendees'
import { getImageUrl } from '../utils/pocketBaseImageUrl'

type Props = { data: Attendee }
export const AttendeeTile: React.FC<Props> = ({ data }: Props) => {
  console.log(data.avatar)
  return (
    <div className="relative bg-green-200 border-2 w-[30rem]  overflow-hidden">
      <img
        className="absolute z-0  w-full object-cover"
        src={getImageUrl(data.avatar, 'attendees', data.id)}
        alt="avatar"
      />
      <Image
        className="relative z-10  w-full object-cover"
        src="/wanted-template.png"
        width={400}
        height={400}
        alt="wanted"
      />

      <div className="absolute bottom-[3.5rem] left-[6rem] font-bold  z-30 ">
        <div className="text-xl">{data.riotId}</div>
        <div className="">Elo : {data.currentElo}</div>
        <div className="">PeakElo : {data.peakElo}</div>
        <div className="">
          Role {data.role} / Pool de champion : {data.championPool}
        </div>
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
}

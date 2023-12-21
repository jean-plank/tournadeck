import Image from 'next/image'

import { TeamRoleIcon } from '../../components/TeamRoleIcon'
import type { Attendee } from '../../models/Attendees'
import { getImageUrl } from '../../utils/pocketBaseImageUrl'

type Props = {
  data: Attendee
}

export const SmallAttendeeTile: React.FC<Props> = ({ data }) => (
  <div className="relative flex flex-col items-center overflow-hidden rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-yellow-500/100">
    <div className="z-30 font-bold">
      {/* RiotId and captain */}
      <div className="flex flex-row justify-between">
        <div className="px-2 py-1 text-center text-xl text-yellow-500">
          <span className="drop-shadow-lg">{data.riotId.split('#')[0]}</span>
          <span className="text-sm text-purple-900">#{data.riotId.split('#')[1]}</span>
        </div>
        {data.isCaptain && (
          <Image
            src={'/icons/crown-64.png'}
            className="mr-1 object-cover drop-shadow-lg"
            width={32}
            height={32}
            alt="avatar"
          />
        )}
      </div>

      {/* Avatar, lane and Seed */}
      <div className="flex flex-row justify-start">
        <Image
          src={getImageUrl(data.avatar, 'attendees', data.id)}
          className="h-[10rem] w-[10rem] rounded-tr-lg border-r-2 border-t-2 border-yellow-500 object-cover"
          width={200}
          height={200}
          alt="avatar"
        />

        <div className="flex flex-col justify-evenly">
          <TeamRoleIcon
            className="h-[4rem] w-[4rem]  object-contain drop-shadow-sm"
            role={data.role}
          />
          <p className="text-center text-4xl text-yellow-500">{data.seed}</p>
        </div>
      </div>
    </div>
  </div>
)

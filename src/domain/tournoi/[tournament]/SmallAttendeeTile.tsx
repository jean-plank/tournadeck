import Image from 'next/image'

import { TeamRoleIcon } from '../../../components/TeamRoleIcon'
import type { AttendeeWithRiotId } from '../../../models/attendee/AttendeeWithRiotId'
import { getImageUrl } from '../../../utils/pocketBaseImageUrl'

type Props = {
  data: AttendeeWithRiotId
}

export const SmallAttendeeTile: React.FC<Props> = ({ data }) => (
  <div className="relative flex flex-col items-center overflow-hidden rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-yellow-500/100">
    <div className="z-30 font-bold">
      {/* RiotId and captain */}
      <div className="flex flex-row justify-between">
        <div className="px-2 py-1 text-center text-xl text-yellow-500">
          <span className="drop-shadow-lg">{data.riotId.gameName}</span>
          <span className="text-sm text-purple-900">#{data.riotId.tagLine}</span>
        </div>
        {data.isCaptain && (
          <Image
            src="/icons/crown-64.png"
            className="mr-1 object-cover drop-shadow-lg"
            width={32}
            height={32}
            alt="avatar"
          />
        )}
      </div>

      {/* Avatar, lane and Seed */}
      <div className="flex flex-row justify-start">
        {typeof data.avatar === 'string' && (
          <Image
            src={getImageUrl('attendees', data.id, data.avatar)}
            className="h-40 w-40 rounded-tr-lg border-r-2 border-t-2 border-yellow-500 object-cover"
            width={200}
            height={200}
            alt="avatar"
          />
        )}

        <div className="flex flex-col justify-evenly">
          <TeamRoleIcon className="h-16 w-16 object-contain drop-shadow-sm" role={data.role} />
          <p className="text-center text-4xl text-yellow-500">{data.seed}</p>
        </div>
      </div>
    </div>
  </div>
)

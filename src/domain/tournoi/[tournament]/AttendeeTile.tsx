import Image from 'next/image'

import { LolEloIcon } from '../../../components/LolEloIcon'
import { TeamRoleIcon } from '../../../components/TeamRoleIcon'
import type { AttendeeWithRiotId } from '../../../models/attendee/AttendeeWithRiotId'
import { getImageUrl } from '../../../utils/pocketBaseImageUrl'

type Props = {
  attendee: AttendeeWithRiotId
}

export const AttendeeTile: React.FC<Props> = ({ attendee }) => (
  <div className="relative flex flex-col items-center overflow-hidden rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-yellow-500">
    <div className="z-30 font-bold">
      {/* RiotId and captain */}
      <div className="flex flex-row justify-between">
        <div className="px-2 py-1 text-center text-xl text-yellow-500">
          <span className="drop-shadow-lg">{attendee.riotId.gameName}</span>
          <span className="text-sm text-purple-900">#{attendee.riotId.tagLine}</span>
        </div>
        {attendee.isCaptain && (
          <Image
            src="/icons/crown-64.png"
            className="mr-1 object-cover drop-shadow-lg"
            width={32}
            height={32}
            alt="Icône capitaine"
          />
        )}
      </div>

      {1}

      {/* Avatar, lane and Seed */}
      <div className="flex flex-row justify-start">
        <Image
          src={getImageUrl('attendees', attendee.id, attendee.avatar)}
          className="h-40 w-40 rounded-r-lg border-y-2 border-r-2 border-yellow-500 object-cover"
          width={200}
          height={200}
          alt="avatar"
        />
        <div className="flex flex-col justify-evenly">
          <TeamRoleIcon className="h-16 w-16 drop-shadow-sm" role={attendee.role} />
          <p className="text-center text-4xl text-yellow-500">{attendee.seed}</p>
        </div>
      </div>
    </div>

    {/* Lol Elo and comment */}
    <div className="flex flex-row items-center pr-2 text-sm font-normal">
      <LolEloIcon className="h-16 w-16 drop-shadow-lg" elo={attendee.currentElo} />
      {attendee.comment !== '' && <p>({attendee.comment})</p>}
    </div>

    {/* Champion pool */}
    <div className="flex flex-row items-center pr-2 text-sm font-normal">
      <Image
        src="/icons/pool-icon.png"
        className="mr-1 object-cover drop-shadow-sm"
        width={40}
        height={40}
        alt="Icône piscine"
      />
      <p>{attendee.championPool}</p>
    </div>

    {/* Price */}
    <div className="text-xl">{attendee.price} $</div>
  </div>
)
import Image from 'next/image'

import { LolEloIcon } from '../../../../components/LolEloIcon'
import { TeamRoleIcon } from '../../../../components/TeamRoleIcon'
import { ChampionPool } from '../../../../models/ChampionPool'
import type { AttendeeWithRiotId } from '../../../../models/attendee/AttendeeWithRiotId'
import { getImageUrl } from '../../../../utils/pocketBaseImageUrl'

type Props = {
  attendee: AttendeeWithRiotId
}

export const AttendeeTile: React.FC<Props> = ({ attendee }) => (
  <div className="relative  m-2 flex flex-col items-start justify-start overflow-hidden rounded-lg border-2 text-gold">
    <div className="z-30 font-bold">
      {/* RiotId and captain */}
      <div className="flex flex-row justify-between">
        <div className="px-2 py-1 text-center text-xl">
          <span>{attendee.riotId.gameName}</span>
          <span className="text-sm text-green1">#{attendee.riotId.tagLine}</span>
        </div>
        {attendee.isCaptain && (
          <Image
            src="/icons/crown-64.png"
            className="mr-1 object-cover"
            width={32}
            height={32}
            alt="Icône capitaine"
          />
        )}
      </div>

      {/* Avatar, lane and Seed */}
      <div className="flex flex-row justify-start">
        <Image
          src={getImageUrl('attendees', attendee.id, attendee.avatar)}
          className="mr-1 h-40 w-40 rounded-r-lg border-y-2 border-r-2 border-gold object-cover"
          width={200}
          height={200}
          alt="avatar"
        />
        <div className="flex flex-col justify-evenly">
          <TeamRoleIcon className="h-16 w-16 " role={attendee.role} />
          <p className="text-center text-4xl ">{attendee.seed}</p>
        </div>
      </div>
    </div>

    {/* Lol Elo and comment */}
    <div className="flex w-full flex-row items-center p-2 text-sm font-normal">
      <LolEloIcon className="mr-1 h-12 w-12" elo={attendee.currentElo} />
      {attendee.comment !== '' && <p>({attendee.comment})</p>}
    </div>

    {/* Champion pool */}
    <div className="flex w-full flex-row items-center pl-3 pr-2 text-sm font-normal">
      <Image
        src="/icons/pool.png"
        className="mr-2 object-cover"
        width={50}
        height={50}
        alt="Icône piscine"
      />
      <p>{ChampionPool.label[attendee.championPool]}</p>
    </div>

    {/* Price */}
    <p className="w-full text-center text-xl">{attendee.price} $</p>
  </div>
)

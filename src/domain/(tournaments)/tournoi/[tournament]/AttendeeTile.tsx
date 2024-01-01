import Image from 'next/image'

import { LolEloIcon } from '../../../../components/LolEloIcon'
import { TeamRoleIcon } from '../../../../components/TeamRoleIcon'
import { MapMarkerStar } from '../../../../components/svgs/icons'
import { ChampionPool } from '../../../../models/ChampionPool'
import type { AttendeeWithRiotId } from '../../../../models/attendee/AttendeeWithRiotId'
import { TheQuestUtils } from '../../../../utils/TheQuestUtils'
import { pbFileUrl } from '../../../../utils/pbFileUrl'

type Props = {
  attendee: AttendeeWithRiotId
}

export const AttendeeTile: React.FC<Props> = ({ attendee }) => (
  <div className="grid bg-dark-red shadow-even shadow-burgundy/50">
    <div className="m-1 flex w-60 flex-col gap-1 border-2 border-burgundy p-1 pb-2 area-1">
      <div className="h-48 bg-black">
        <Image
          src={pbFileUrl('attendees', attendee.id, attendee.avatar)}
          className="h-full w-full object-cover"
          width={200}
          height={200}
          alt={`Avatar de ${attendee.riotId.gameName}#${attendee.riotId.tagLine}`}
        />
      </div>

      <div className="-mb-1 mt-0.5 flex justify-center">
        <a
          href={TheQuestUtils.summonerUrl(attendee.riotId)}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-wrap items-center"
        >
          <span className="font-bold text-goldenrod group-hover:underline">
            {attendee.riotId.gameName}
          </span>
          <span className="text-grey-500 group-hover:underline">#{attendee.riotId.tagLine}</span>
        </a>
      </div>

      <div className="flex items-center gap-1.5">
        <LolEloIcon type="flat" elo={attendee.currentElo} className="h-10 w-10 shrink-0" />
        {attendee.comment !== '' && (
          <div className="flex h-7 items-center border-l border-goldenrod pl-1">
            <p
              title={attendee.comment}
              className="overflow-hidden whitespace-pre-wrap text-sm leading-3.5 vertical-ellipsis-2"
            >
              {attendee.comment}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/pool-icon.png"
          alt="Icône piscine"
          title="Piscine de champions"
          className="mx-2 h-6 self-end object-cover"
        />
        <span className="text-sm leading-3.5">{ChampionPool.label[attendee.championPool]}</span>
      </div>

      <div
        title={`Lieu de naissance : ${attendee.birthplace}`}
        className="flex max-w-full items-center gap-0.5 self-center px-3.5 pt-1.5 text-sm leading-3.5"
      >
        <MapMarkerStar className="h-5 shrink-0 text-white" />
        <span className="truncate text-sm leading-3.5">{attendee.birthplace}</span>
      </div>
    </div>

    <div className="grid grid-cols-[auto_auto] self-start justify-self-start bg-dark-red area-1">
      <TeamRoleIcon
        role={attendee.role}
        className={attendee.role === 'sup' ? 'm-0.5 h-7 w-7' : 'h-8 w-8'}
      />
      <div className="mt-1 border-l-2 border-burgundy" />
      <div className="col-span-2 ml-1 border-t-2 border-burgundy" />
    </div>

    {attendee.price !== 0 && (
      <div className="-mb-1 -mr-1 self-end justify-self-end bg-green1 area-1">
        ${attendee.price}
      </div>
    )}

    {attendee.isCaptain && (
      <div title="Capitaine" className="self-end justify-self-start bg-dark-red area-1">
        <Image
          src="/icons/crown-64.png"
          alt="Icône de capitaine"
          width={24}
          height={24}
          className="object-cover px-0.5 opacity-90"
        />
      </div>
    )}

    {attendee.seed !== 0 && (
      <div className="self-start justify-self-end rounded-b-xl bg-goldenrod px-px pb-px shadow-even shadow-black area-1">
        <div className="rounded-b-xl border-x border-b border-white px-1 pb-0.5 font-lib-mono text-sm text-black">
          #{attendee.seed}
        </div>
      </div>
    )}
  </div>
)

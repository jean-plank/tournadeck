'use client'

import Image from 'next/image'
import { useRef } from 'react'

import { LolEloIcon } from '../../../../../components/LolEloIcon'
import { TeamRoleIcon, TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { MapMarkerStar } from '../../../../../components/svgs/icons'
import { Tooltip } from '../../../../../components/tooltip/Tooltip'
import { constants } from '../../../../../config/constants'
import { ChampionPool } from '../../../../../models/ChampionPool'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { GameName } from '../../../../../models/riot/GameName'
import { TagLine } from '../../../../../models/riot/TagLine'
import { TheQuestUtils } from '../../../../../utils/TheQuestUtils'
import { pbFileUrl } from '../../../../../utils/pbFileUrl'

type AttendeeTileProps = {
  attendee: AttendeeWithRiotId
  captainShouldDisplayPrice: boolean
}

export const AttendeeTile: React.FC<AttendeeTileProps> = ({
  attendee,
  captainShouldDisplayPrice,
}) => {
  const commentRef = useRef<HTMLParagraphElement>(null)

  const poolHoverRef = useRef<HTMLDivElement>(null)
  const poolPlacementRef = useRef<HTMLImageElement>(null)

  const birthplaceRef = useRef<HTMLDivElement>(null)

  const roleRef = useRef<HTMLDivElement>(null)

  const captainRef = useRef<HTMLDivElement>(null)

  const seedRef = useRef<HTMLDivElement>(null)

  return (
    <div className="grid bg-dark-red shadow-even shadow-burgundy/50">
      <div className="m-1 flex w-60 flex-col gap-1 border-2 border-burgundy p-1 pb-2 area-1">
        <div className="h-48">
          <Image
            src={pbFileUrl('attendees', attendee.id, attendee.avatar)}
            className="size-full object-cover"
            width={512}
            height={512}
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
              {GameName.unwrap(attendee.riotId.gameName)}
            </span>
            <span className="text-grey-500 group-hover:underline">
              #{TagLine.unwrap(attendee.riotId.tagLine)}
            </span>
          </a>
        </div>

        <div className="flex items-center gap-1.5">
          <LolEloIcon type="flat" elo={attendee.currentElo} className="size-10 shrink-0" />
          {attendee.comment !== '' && (
            <div className="flex h-7 items-center border-l border-goldenrod pl-1">
              <p
                ref={commentRef}
                className="overflow-hidden whitespace-pre-wrap text-sm leading-3.5 vertical-ellipsis-2"
              >
                {attendee.comment}
              </p>
              <Tooltip hoverRef={commentRef} className="whitespace-pre-wrap">
                {attendee.comment}
              </Tooltip>
            </div>
          )}
        </div>

        <div ref={poolHoverRef} className="flex items-center gap-1 self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={poolPlacementRef}
            src="/icons/pool-icon.png"
            alt="Icône piscine"
            className="mx-2 h-6 self-end object-cover"
          />
          <Tooltip hoverRef={poolHoverRef} placementRef={poolPlacementRef}>
            Piscine de champions
          </Tooltip>

          <span className="text-sm leading-3.5">{ChampionPool.label[attendee.championPool]}</span>
        </div>

        <div
          ref={birthplaceRef}
          className="flex max-w-full items-center gap-0.5 self-center px-3.5 pt-1.5 text-sm leading-3.5"
        >
          <MapMarkerStar className="h-5 shrink-0 text-white" />
          <span className="truncate text-sm leading-3.5">{attendee.birthplace}</span>
        </div>
        <Tooltip hoverRef={birthplaceRef} className="flex flex-col gap-0.5">
          <span>Lieu de naissance :</span>
          <span className="whitespace-pre-wrap">{attendee.birthplace}</span>
        </Tooltip>
      </div>

      <div
        ref={roleRef}
        className="grid grid-cols-[auto_auto] self-start justify-self-start bg-dark-red area-1"
      >
        <TeamRoleIconGold
          role={attendee.role}
          className={attendee.role === 'sup' ? 'm-0.5 size-7' : 'size-8'}
        />
        <div className="mt-1 border-l-2 border-burgundy" />
        <div className="col-span-2 ml-1 border-t-2 border-burgundy" />
      </div>
      <Tooltip hoverRef={roleRef} placement="top">
        {TeamRole.label[attendee.role]}
      </Tooltip>

      {(captainShouldDisplayPrice || !attendee.isCaptain) && attendee.price !== 0 && (
        <div className="mb-1 mr-1 grid grid-cols-[auto_auto] self-end justify-self-end rounded-tl-md bg-dark-red pl-1 pt-1 area-1">
          <span className="rounded-br-md rounded-tl-md bg-green1/90 px-0.5 leading-5 text-white">
            ${attendee.price.toLocaleString(constants.locale)}
          </span>
        </div>
      )}

      {attendee.isCaptain && (
        <>
          <div ref={captainRef} className="self-end justify-self-start bg-dark-red area-1">
            <Image
              src="/icons/crown-64.png"
              alt="Icône de capitaine"
              width={24}
              height={24}
              className="object-cover px-0.5 opacity-90"
            />
          </div>
          <Tooltip hoverRef={captainRef}>Capitaine</Tooltip>
        </>
      )}

      {attendee.seed !== 0 && (
        <>
          <div
            ref={seedRef}
            className="self-start justify-self-end rounded-b-xl bg-goldenrod px-px pb-px shadow-even shadow-black area-1"
          >
            <div className="rounded-b-xl border-x border-b border-white px-1 pb-0.5 font-lib-mono text-sm text-black">
              #{attendee.seed}
            </div>
          </div>
          <Tooltip hoverRef={seedRef} placement="top">
            Seed #{attendee.seed}
          </Tooltip>
        </>
      )}
    </div>
  )
}

type EmptyAttendeeTileProps = {
  role: TeamRole
}

export const EmptyAttendeeTile: React.FC<EmptyAttendeeTileProps> = ({ role }) => (
  <div className="min-h-[344px]">
    <div className="m-1 flex h-full w-60 items-center justify-center rounded-lg border-2 border-burgundy/30">
      <TeamRoleIcon
        role={role}
        className="size-14 text-burgundy/80"
        secondaryClassName="text-burgundy/30"
      />
    </div>
  </div>
)

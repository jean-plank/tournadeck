'use client'

import Image from 'next/image'

import { constants } from '../../config/constants'
import { usePocketBase } from '../../contexts/PocketBaseContext'
import { ChampionPool } from '../../models/ChampionPool'
import { TeamRole } from '../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../models/attendee/AttendeeWithRiotId'
import { GameName } from '../../models/riot/GameName'
import { RiotId } from '../../models/riot/RiotId'
import { TagLine } from '../../models/riot/TagLine'
import { cx } from '../../utils/cx'
import { objectEntries } from '../../utils/fpTsUtils'
import { pbFileUrl } from '../../utils/pbFileUrl'
import { formatNumber } from '../../utils/stringUtils'
import { LolEloIcon } from '../LolEloIcon'
import { TeamRoleIcon, TeamRoleIconGold } from '../TeamRoleIcon'
import { ContextMenu, useContextMenu } from '../floating/ContextMenu'
import { Tooltip, useTooltip } from '../floating/Tooltip'
import { MapMarkerStar, OpenInNew } from '../svgs/icons'
import { SeedTag } from './SeedTag'

type AttendeeTileProps = {
  attendee: AttendeeWithRiotId
  shouldDisplayAvatarRating: boolean
  captainShouldDisplayPrice: boolean
}

const summonerUrls = objectEntries({
  'La Quête.': theQuestUrl,
  'League of Graphs': leagueOfGraphsUrl,
  'OP.GG': opGGUrl,
})

const avatarRatingClassName = 'absolute block rounded-l-md bg-black/90 px-1 py-px'

export const AttendeeTile: React.FC<AttendeeTileProps> = ({
  attendee,
  shouldDisplayAvatarRating,
  captainShouldDisplayPrice,
}) => {
  const avatarRatingTooltip = useTooltip<HTMLDivElement, HTMLSpanElement>({ placement: 'right' })
  const commentTooltip = useTooltip<HTMLParagraphElement>()
  const summonerLinks = useContextMenu<HTMLDivElement>()
  const poolTooltip = useTooltip<HTMLDivElement, HTMLImageElement>()
  const birthplaceTooltip = useTooltip<HTMLDivElement>()
  const roleTooltip = useTooltip<HTMLDivElement>({ placement: 'top' })
  const priceTooltip = useTooltip<HTMLDivElement>()
  const captainTooltip = useTooltip<HTMLDivElement>()

  const { user } = usePocketBase()

  const highlight = user !== undefined && attendee.user === user.id

  const avatarRatingLong = `${formatNumber(attendee.avatarRating, 2)}/5`
  const price = attendee.price.toLocaleString(constants.locale)

  return (
    <li className="grid bg-dark-red shadow-even shadow-burgundy/50">
      {highlight && (
        <span className="size-[calc(100%+1rem)] self-center justify-self-center rounded-lg border border-goldenrod area-1" />
      )}

      <div className="m-1 flex w-60 flex-col gap-1 border-2 border-burgundy p-1 pb-2 area-1">
        <div className="grid">
          <Image
            src={pbFileUrl('attendees', attendee.id, attendee.avatar)}
            className="h-48 object-cover area-1"
            width={512}
            height={512}
            alt={`Avatar de ${attendee.riotId.gameName}#${attendee.riotId.tagLine}`}
          />

          {shouldDisplayAvatarRating && (
            <div
              className="group/tile relative flex h-8 w-12 translate-y-2 items-center justify-end self-end justify-self-end overflow-hidden rounded-l-full text-sm leading-4 text-white area-1"
              {...avatarRatingTooltip.reference}
            >
              {/* hitbox (for position) */}
              <span
                className={cx(avatarRatingClassName, 'invisible -right-px')}
                {...avatarRatingTooltip.positionReference}
              >
                {avatarRatingLong}
              </span>

              <span className={cx(avatarRatingClassName, '-right-px group-hover/tile:invisible')}>
                {formatNumber(attendee.avatarRating, 1)}
              </span>

              {/* on hover */}
              <span
                className={cx(
                  avatarRatingClassName,
                  'absolute invisible -right-3 transition-[right] duration-300 group-hover/tile:-right-px group-hover/tile:visible cursor-none',
                )}
              >
                {avatarRatingLong}
              </span>
              <Tooltip {...avatarRatingTooltip.floating}>Note photo de profil</Tooltip>
            </div>
          )}
        </div>

        <div className="-mb-1 mt-0.5 flex self-center" {...summonerLinks.reference}>
          <span className="font-bold text-goldenrod">
            {GameName.unwrap(attendee.riotId.gameName)}
          </span>
          <span className="text-grey-500">#{TagLine.unwrap(attendee.riotId.tagLine)}</span>
        </div>
        <ContextMenu {...summonerLinks.floating} className="shadow-burgundy">
          <ul className="flex flex-col items-center gap-2 py-1">
            {summonerUrls.map(([label, getUrl]) => (
              <li key={label} className="flex items-center gap-2">
                <OpenInNew className="invisible size-3.5" /> {/* for hitbox */}
                <a
                  href={getUrl(attendee.riotId)}
                  target="_blank"
                  rel="noreferrer"
                  className="peer border-b border-b-transparent text-white transition-all duration-100 hover:border-b-goldenrod"
                >
                  {label}
                </a>
                <OpenInNew className="invisible size-3.5 opacity-0 transition-all duration-100 peer-hover:visible peer-hover:opacity-100" />
              </li>
            ))}
          </ul>
        </ContextMenu>

        <div className="flex items-center gap-1.5">
          <LolEloIcon type="flat" elo={attendee.currentElo} className="size-10 shrink-0" />
          {attendee.comment !== '' && (
            <div className="flex h-7 items-center border-l border-goldenrod pl-1">
              <p
                className="overflow-hidden whitespace-pre-wrap text-sm leading-3.5 vertical-ellipsis-2"
                {...commentTooltip.reference}
              >
                {attendee.comment}
              </p>
              <Tooltip className="whitespace-pre-wrap" {...commentTooltip.floating}>
                {attendee.comment}
              </Tooltip>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 self-start" {...poolTooltip.reference}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/pool-icon.png"
            alt="Icône piscine"
            className="mx-2 h-6 self-end object-cover"
            {...poolTooltip.positionReference}
          />
          <Tooltip {...poolTooltip.floating}>Piscine de champions</Tooltip>

          <span className="text-sm leading-3.5">{ChampionPool.label[attendee.championPool]}</span>
        </div>

        <div
          className="flex max-w-full items-center gap-0.5 self-center px-3.5 pt-1.5 text-sm leading-3.5"
          {...birthplaceTooltip.reference}
        >
          <MapMarkerStar className="h-5 shrink-0 text-white" />
          <span className="truncate text-sm leading-3.5">{attendee.birthplace}</span>
        </div>
        <Tooltip className="flex flex-col gap-0.5" {...birthplaceTooltip.floating}>
          <span>Lieu de naissance :</span>
          <span className="whitespace-pre-wrap">{attendee.birthplace}</span>
        </Tooltip>
      </div>

      <div
        className="grid grid-cols-[auto_auto] self-start justify-self-start bg-dark-red area-1"
        {...roleTooltip.reference}
      >
        <TeamRoleIconGold
          role={attendee.role}
          className={attendee.role === 'sup' ? 'm-0.5 size-7' : 'size-8'}
        />
        <div className="mt-1 border-l-2 border-burgundy" />
        <div className="col-span-2 ml-1 border-t-2 border-burgundy" />
      </div>
      <Tooltip {...roleTooltip.floating}>{TeamRole.label[attendee.role]}</Tooltip>

      {(captainShouldDisplayPrice || !attendee.isCaptain) && attendee.price !== 0 && (
        <>
          <div
            className="mb-1 mr-1 grid grid-cols-[auto_auto] self-end justify-self-end rounded-tl-md bg-dark-red pl-1 pt-1 area-1"
            {...priceTooltip.reference}
          >
            <span className="rounded-br-md rounded-tl-md bg-green1/90 px-0.5 leading-5 text-white">
              ${price}
            </span>
          </div>
          <Tooltip {...priceTooltip.floating}>Prix d’achat</Tooltip>
        </>
      )}

      {attendee.isCaptain && (
        <>
          <div
            className="self-end justify-self-start bg-dark-red area-1"
            {...captainTooltip.reference}
          >
            <Image
              src="/icons/crown-64.png"
              alt="Icône de capitaine"
              width={24}
              height={24}
              className="object-cover px-0.5 opacity-90"
            />
          </div>
          <Tooltip {...captainTooltip.floating}>Capitaine</Tooltip>
        </>
      )}

      {attendee.seed !== 0 && <SeedTag seed={attendee.seed} withTooltip={true} />}
    </li>
  )
}

const platform = constants.platform.toLowerCase()

function theQuestUrl(riotId: RiotId): string {
  return `https://laquete.blbl.ch/${platform}/${RiotId.stringify('-')(riotId)}`
}

function leagueOfGraphsUrl(riotId: RiotId): string {
  return `https://www.leagueofgraphs.com/summoner/${platform}/${RiotId.stringify('-')(riotId)}`
}

function opGGUrl(riotId: RiotId): string {
  return `https://www.op.gg/summoners/${platform}/${RiotId.stringify('-')(riotId)}`
}

// ---

type EmptyAttendeeTileProps = {
  role: TeamRole
}

export const EmptyAttendeeTile: React.FC<EmptyAttendeeTileProps> = ({ role }) => (
  <li className="min-h-[21.5rem]">
    <div className="m-1 flex h-full w-60 items-center justify-center rounded-lg border-2 border-burgundy/30">
      <TeamRoleIcon
        role={role}
        className="size-14 text-burgundy/80"
        secondaryClassName="text-burgundy/30"
      />
    </div>
  </li>
)

import Image from 'next/image'
import { useRef } from 'react'

import { LolElo } from '../models/LolElo'
import { cx } from '../utils/cx'
import { Tooltip } from './tooltip/Tooltip'

type Props = {
  type?: LolEloIconType
  elo: LolElo
  className?: string
}

type LolEloIconType = 'normal' | 'flat'

export const LolEloIcon: React.FC<Props> = ({ type = 'normal', elo, className }) => {
  const ref = useRef(null)

  return (
    <>
      {renderIcon(ref, type, elo, className)}
      <Tooltip hoverRef={ref}>{LolElo.label[elo]}</Tooltip>
    </>
  )
}

function renderIcon(
  ref: React.Ref<HTMLImageElement>,
  type: LolEloIconType,
  elo: LolElo,
  className: Optional<string>,
): React.ReactElement {
  switch (type) {
    case 'normal':
      return (
        <Image
          ref={ref}
          src={leagueIconUrl(elo)}
          alt={`Icône ${LolElo.label[elo]}`}
          width={200}
          height={200}
          className={className}
        />
      )

    case 'flat':
      return (
        <span ref={ref} className={cx('flex items-center overflow-hidden', className)}>
          <Image
            src={miniCrestIconUrl(elo)}
            alt={`Icône ${LolElo.label[elo]}`}
            width={200}
            height={200}
            className={cx('mr-[-100%] max-w-none', miniCrestClassName[elo])}
          />
        </span>
      )
  }
}

function leagueIconUrl(elo: LolElo): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/${elo}.png`
}

function miniCrestIconUrl(elo: LolElo): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${elo}.svg`
}

const miniCrestClassName: Record<LolElo, string> = {
  iron: 'w-[86%] mt-[9%] ml-[4.5%]',
  bronze: 'w-[90%] mt-[9%] ml-[5%]',
  silver: 'w-[90%] mt-[9%] ml-[5%]',
  gold: 'w-[92%] mt-[14.5%] ml-[6.5%]',
  platinum: 'w-[106%] mt-[19%] ml-[-3%]',
  emerald: 'w-[106%] mt-[19%] ml-[-3%]',
  diamond: 'w-[106%] mt-[19%] ml-[-3%]',
  master: 'w-[106%] ml-[-6%]',
  grandmaster: 'w-[106%] ml-[-6%]',
  challenger: 'w-[106%] ml-[-6%]',
}

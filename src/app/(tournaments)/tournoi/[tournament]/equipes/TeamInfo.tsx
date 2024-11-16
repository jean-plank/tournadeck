'use client'

import type { Merge } from 'type-fest'

import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import { ImagesOutline } from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import { formatNumber } from '../../../../../utils/stringUtils'

type Props = {
  team: TeamWithStats
}

export type TeamWithStats = Merge<
  Team,
  {
    balance: number
    averageAvatarRating: number
  }
>

export const TeamInfo: React.FC<Props> = ({ team }) => {
  const balanceTooltip = useTooltip<HTMLSpanElement>()
  const averageTooltip = useTooltip<HTMLDivElement>()

  return (
    <li className="flex min-h-[23.5rem] flex-col items-center justify-center gap-2 px-2 even:bg-black/30">
      <span className="font-lib-mono font-bold">{team.tag}</span>
      <span className="text-white">{team.name}</span>

      <div className="mx-2 mt-2 flex items-center justify-around gap-6 self-stretch">
        <span
          className="rounded-br-md rounded-tl-md bg-green1/90 px-1.5 text-white"
          {...balanceTooltip.reference}
        >
          ${team.balance.toLocaleString(constants.locale)}
        </span>
        <Tooltip {...balanceTooltip.floating}>Solde</Tooltip>

        <div
          className="flex shrink-0 items-center gap-2 text-sky-300"
          {...averageTooltip.reference}
        >
          <ImagesOutline className="size-6" />
          <span>{formatNumber(team.averageAvatarRating, 2)} / 5</span>
        </div>
        <Tooltip {...averageTooltip.floating}>Moyenne des notes de photos de profil</Tooltip>
      </div>
    </li>
  )
}

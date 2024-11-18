'use client'

import { Tooltip, useTooltip } from '../../../components/floating/Tooltip'
import { EyeOff } from '../../../components/svgs/icons'
import { Dayjs } from '../../../models/Dayjs'
import type { Tournament } from '../../../models/pocketBase/tables/Tournament'

const dateTimeFormat = 'DD/MM/YYYY, HH:mm'

type Props = {
  tournament: Tournament
}

export const TournamentTile: React.FC<Props> = ({ tournament }) => {
  const invisibleTooltip = useTooltip<SVGSVGElement>({ placement: 'top' })

  return (
    <div className="min-w-[30rem] rounded-lg border-2 border-goldenrod bg-white1 p-3 text-black transition-all duration-300 hover:min-w-[31rem] hover:px-5 hover:text-goldenrod">
      <div className="flex items-start justify-between gap-5">
        <h3 className="text-3xl font-black">{tournament.name}</h3>

        {!tournament.isVisible && (
          <>
            <EyeOff className="size-7 text-red-500" {...invisibleTooltip.reference} />
            <Tooltip {...invisibleTooltip.floating}>Non publié</Tooltip>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="text-black">Début : {Dayjs(tournament.start).format(dateTimeFormat)}</div>
        <div className="text-black">Fin : {Dayjs(tournament.end).format(dateTimeFormat)}</div>
      </div>
    </div>
  )
}

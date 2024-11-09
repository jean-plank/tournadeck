'use client'

import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import { Dayjs } from '../../../../../models/Dayjs'

type PlannedOnProps = {
  plannedOn: string
}

const dateTimeFormat = 'ddd DD/MM/YY, HH:mm'

export const PlannedOn: React.FC<PlannedOnProps> = ({ plannedOn }) => {
  const tooltip = useTooltip<HTMLSpanElement>()

  return (
    <>
      <span className="self-start text-sm" {...tooltip.reference}>
        {Dayjs(plannedOn).format(dateTimeFormat)}
      </span>
      <Tooltip {...tooltip.floating}>Heure prévue du match (approximativement)</Tooltip>
    </>
  )
}

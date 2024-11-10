'use client'

import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import { formatNumber } from '../../../../../utils/stringUtils'

type Props = {
  goldDiff: number
}

export const GoldDiff: React.FC<Props> = ({ goldDiff }) => {
  const tooltip = useTooltip<HTMLSpanElement>()

  return (
    <>
      <span className="font-semibold text-goldenrod" {...tooltip.reference}>
        {0 <= goldDiff && '+'}
        {formatNumber(goldDiff / 1000, 1)} k
      </span>
      <Tooltip {...tooltip.floating}>Écart aux golds</Tooltip>
    </>
  )
}

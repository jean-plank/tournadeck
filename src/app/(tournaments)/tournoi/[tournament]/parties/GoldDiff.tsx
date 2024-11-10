'use client'

import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import { constants } from '../../../../../config/constants'
import { round } from '../../../../../utils/numberUtils'

type Props = {
  goldDiff: number
}

export const GoldDiff: React.FC<Props> = ({ goldDiff }) => {
  const tooltip = useTooltip<HTMLSpanElement>()

  return (
    <>
      <span className="font-semibold text-goldenrod" {...tooltip.reference}>
        {0 <= goldDiff && '+'}
        {round(goldDiff / 1000, 1).toLocaleString(constants.locale)} k
      </span>
      <Tooltip {...tooltip.floating}>Écart aux golds</Tooltip>
    </>
  )
}

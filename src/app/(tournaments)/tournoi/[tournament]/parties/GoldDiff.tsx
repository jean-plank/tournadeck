'use client'

import { Tooltip, useTooltip } from '../../../../../components/Tooltip'
import { constants } from '../../../../../config/constants'

type Props = {
  goldDiff: number
}

export const GoldDiff: React.FC<Props> = ({ goldDiff }) => {
  const tooltip = useTooltip<HTMLSpanElement>()

  return (
    <>
      <span className="font-semibold text-goldenrod" {...tooltip.reference}>
        {0 <= goldDiff && '+'}
        {(Math.round(goldDiff / 100) / 10).toLocaleString(constants.locale)} k
      </span>
      <Tooltip {...tooltip.floating}>Écart aux golds</Tooltip>
    </>
  )
}

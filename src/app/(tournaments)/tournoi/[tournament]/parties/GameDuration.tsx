'use client'

import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import type { ChildrenFC } from '../../../../../models/ChildrenFC'

export const GameDuration: ChildrenFC = ({ children }) => {
  const tooltip = useTooltip<HTMLSpanElement>()

  return (
    <>
      <span className="py-1 text-base" {...tooltip.reference}>
        {children}
      </span>
      <Tooltip {...tooltip.floating}>Durée de la partie</Tooltip>
    </>
  )
}

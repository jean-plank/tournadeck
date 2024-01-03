'use client'

import { useRef } from 'react'

import { Tooltip } from '../../../../../components/tooltip/Tooltip'
import type { ChildrenFC } from '../../../../../models/ChildrenFC'

export const GameDuration: ChildrenFC = ({ children }) => {
  const ref = useRef<HTMLSpanElement>(null)

  return (
    <>
      <span ref={ref} className="py-1 text-base">
        {children}
      </span>
      <Tooltip hoverRef={ref}>Durée de la partie</Tooltip>
    </>
  )
}

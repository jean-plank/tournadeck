'use client'

import { useRef } from 'react'

import { Tooltip } from '../../../../../components/tooltip/Tooltip'

type Props = {
  goldDiff: number
}

export const GoldDiff: React.FC<Props> = ({ goldDiff }) => {
  const ref = useRef<HTMLSpanElement>(null)

  return (
    <>
      <span ref={ref} className="font-semibold text-goldenrod">
        {0 <= goldDiff && '+'}
        {(Math.round(goldDiff / 100) / 10).toLocaleString('fr-FR')} k
      </span>
      <Tooltip hoverRef={ref}>Écart aux golds</Tooltip>
    </>
  )
}

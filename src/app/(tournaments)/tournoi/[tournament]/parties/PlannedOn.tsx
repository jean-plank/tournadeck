'use client'

import { useRef } from 'react'

import { Tooltip } from '../../../../../components/tooltip/Tooltip'
import { Dayjs } from '../../../../../models/Dayjs'

type PlannedOnProps = {
  plannedOn: string
}

const dateTimeFormat = 'ddd DD/MM/YY, HH:mm'

export const PlannedOn: React.FC<PlannedOnProps> = ({ plannedOn }) => {
  const ref = useRef<HTMLSpanElement>(null)

  return (
    <>
      <span ref={ref} className="self-start text-sm">
        {Dayjs(plannedOn).format(dateTimeFormat)}
      </span>
      <Tooltip hoverRef={ref}>Heure prévue du match (approximativement)</Tooltip>
    </>
  )
}

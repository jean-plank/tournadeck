'use client'

import { useCallback } from 'react'
import type { OverrideProperties } from 'type-fest'

type Props = OverrideProperties<
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  { onClick: () => void }
>

export const ClientButton: React.FC<Props> = ({ onClick, children, ...props }) => {
  const handleClick = useCallback(() => onClick(), [onClick])

  return (
    // eslint-disable-next-line react/button-has-type
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  )
}

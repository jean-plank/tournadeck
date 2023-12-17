'use client'

import { useEffect } from 'react'

type Props = {
  load: () => void
}

export const RootLoad: React.FC<Props> = ({ load }) => {
  useEffect(() => {
    load()
  }, [load])

  return null
}

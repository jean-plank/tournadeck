'use client'

import type { RedirectType } from 'next/navigation'
import { useEffect } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'

type Props = {
  type?: RedirectType
  goBack?: boolean
}

export const LogoutAndRedirect: React.FC<Props> = ({ type, goBack }) => {
  const { logoutAndRedirect } = usePocketBase()

  useEffect(() => {
    logoutAndRedirect(type, goBack)
  }, [goBack, logoutAndRedirect, type])

  return null
}

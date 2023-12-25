'use client'

import type { RedirectType } from 'next/navigation'
import { useEffect } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'

type Props = {
  type?: RedirectType
}

export const LogoutAndRedirect: React.FC<Props> = ({ type }) => {
  const { logoutAndRedirect } = usePocketBase()

  useEffect(() => {
    logoutAndRedirect(type)
  }, [logoutAndRedirect, type])

  return null
}

'use client'

import type { AuthModel } from 'pocketbase'
import PocketBase from 'pocketbase'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { ChildrenFC } from '../models/ChildrenFC'

type PocketBaseContext = {
  pb: PocketBase
  user: AuthModel
}

const PocketBaseContext = createContext<PocketBaseContext | undefined>(undefined)

export const PocketBaseContextProvider: ChildrenFC = ({ children }) => {
  const pb = useMemo(() => new PocketBase(process.env.NEXT_PUBLIC_POCKET_BASE_URL), [])

  const [user, setUser] = useState<PocketBaseContext['user']>(null)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      pb.authStore.loadFromCookie(document.cookie)

      pb.authStore.onChange((token, model) => {
        setUser(model)

        document.cookie = pb.authStore.exportToCookie({ httpOnly: false })
      })
    }
  }, [pb])

  const value: PocketBaseContext = { pb, user }

  return <PocketBaseContext.Provider value={value}>{children}</PocketBaseContext.Provider>
}

export function usePocketBase(): PocketBaseContext {
  const context = useContext(PocketBaseContext)
  if (context === undefined) {
    throw Error('usePocketBase must be used within a PocketBaseContextProvider')
  }
  return context
}

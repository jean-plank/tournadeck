'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { ChildrenFC } from '../models/ChildrenFC'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { User } from '../models/pocketBase/tables/User'

type PocketBaseContext = {
  pb: MyPocketBase
  user: User | null
}

const PocketBaseContext = createContext<PocketBaseContext | undefined>(undefined)

export const PocketBaseContextProvider: ChildrenFC = ({ children }) => {
  const pb = useMemo(() => MyPocketBase(), [])

  const [user, setUser] = useState<PocketBaseContext['user']>(null)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      pb.authStore.loadFromCookie(document.cookie)

      pb.authStore.onChange((token, model) => {
        setUser(model as User)

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

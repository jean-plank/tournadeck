'use client'

import PocketBase from 'pocketbase'
import { createContext, useContext, useMemo } from 'react'

import type { ChildrenFC } from '../models/ChildrenFC'

type PocketBaseContext = {
  pb: PocketBase
}

const PocketBaseContext = createContext<PocketBaseContext | undefined>(undefined)

export const PocketBaseContextProvider: ChildrenFC = ({ children }) => {
  const value: PocketBaseContext = {
    pb: useMemo(() => {
      // TODO: baseUrl from config
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKET_BASE_URL)

      if (typeof document !== 'undefined') {
        pb.authStore.loadFromCookie(document.cookie)

        pb.authStore.onChange((/* token, model */) => {
          document.cookie = pb.authStore.exportToCookie({ httpOnly: false })
        })
      }

      return pb
    }, []),
  }

  return <PocketBaseContext.Provider value={value}>{children}</PocketBaseContext.Provider>
}

export function usePocketBase(): PocketBaseContext {
  const context = useContext(PocketBaseContext)
  if (context === undefined) {
    throw Error('usePocketBase must be used within a PocketBaseContextProvider')
  }
  return context
}

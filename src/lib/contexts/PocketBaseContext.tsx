'use client'

import PocketBase from 'pocketbase'
import { createContext, useContext, useMemo } from 'react'

import type { ChildrenFC } from '../models/ChildrenFC'

const PocketBaseContext = createContext<PocketBase | undefined>(undefined)

export const PocketBaseContextProvider: ChildrenFC = ({ children }) => {
  const value: PocketBase = useMemo(() => {
    // TODO: baseUrl from config
    const pb = new PocketBase('http://127.0.0.1:8090')

    pb.authStore.loadFromCookie(document.cookie)

    pb.authStore.onChange((/* token, model */) => {
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false })
    })

    return pb
  }, [])

  return <PocketBaseContext.Provider value={value}>{children}</PocketBaseContext.Provider>
}

export function usePocketBase(): PocketBase {
  const context = useContext(PocketBaseContext)
  if (context === undefined) {
    throw Error('usePocketBase must be used within a PocketBaseContextProvider')
  }
  return context
}

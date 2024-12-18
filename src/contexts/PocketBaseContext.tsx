'use client'

import type { RedirectType } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { redirectAction } from '../actions/redirectAction'
import type { ChildrenFC } from '../models/ChildrenFC'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { User } from '../models/pocketBase/tables/User'

type PocketBaseContext = {
  pb: MyPocketBase
  user: Optional<User>
  logoutAndRedirect: (type?: RedirectType, goBack?: boolean) => void
}

const PocketBaseContext = createContext<Optional<PocketBaseContext>>(undefined)

export const PocketBaseContextProvider: ChildrenFC = ({ children }) => {
  const pathname = usePathname()

  const [user, setUser] = useState<PocketBaseContext['user']>(undefined)

  const pb = useMemo((): MyPocketBase => {
    const pb_ = MyPocketBase(process.env['NEXT_PUBLIC_POCKET_BASE_URL'])

    pb_.authStore.onChange((token, model) => {
      setUser((model as Nullable<User>) ?? undefined)

      document.cookie = pb_.authStore.exportToCookie({ httpOnly: false })
    })

    return pb_
  }, [])

  useEffect(() => {
    pb.authStore.loadFromCookie(document.cookie)
  }, [pb])

  const logoutAndRedirect = useCallback(
    (type?: RedirectType, goBack: boolean = false) => {
      pb.authStore.clear()

      redirectAction(goBack ? `/?back=${encodeURIComponent(pathname)}` : '/', type)
    },
    [pathname, pb],
  )

  const value: PocketBaseContext = { pb, user, logoutAndRedirect }

  return <PocketBaseContext.Provider value={value}>{children}</PocketBaseContext.Provider>
}

export function usePocketBase(): PocketBaseContext {
  const context = useContext(PocketBaseContext)
  if (context === undefined) {
    throw Error('usePocketBase must be used within a PocketBaseContextProvider')
  }
  return context
}

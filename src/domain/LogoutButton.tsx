'use client'

import { useCallback } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'

export const LogoutButton: React.FC = () => {
  const { pb, user } = usePocketBase()

  const logout = useCallback(() => {
    pb.authStore.clear()
  }, [pb.authStore])

  return (
    <div className="flex gap-4">
      {user !== null && (
        <>
          <div>BONJOUR {user.displayName}</div>
          <button type="button" onClick={logout} className="border border-black">
            Déconnexion
          </button>
        </>
      )}
    </div>
  )
}

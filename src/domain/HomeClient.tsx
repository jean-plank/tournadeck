'use client'

import { useCallback } from 'react'

import { DiscordLogoTitle } from '../components/svgs/DiscordLogoTitle'
import { usePocketBase } from '../contexts/PocketBaseContext'

export const HomeClient: React.FC = () => {
  const { pb, user } = usePocketBase()

  const connectWithDiscord = useCallback(
    () => pb.collection('users').authWithOAuth2({ provider: 'discord' }),
    [pb],
  )

  const logout = useCallback(() => {
    pb.authStore.clear()
  }, [pb.authStore])

  return (
    <div>
      {user !== null ? (
        <>
          <div>BONJOUR {user.displayName}</div>
          <button type="button" onClick={logout} className="border border-black">
            Déconnexion
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={connectWithDiscord}
          className="flex items-center rounded-md bg-discord-blurple px-6 text-white"
        >
          Connexion avec <DiscordLogoTitle className="my-3 ml-3 h-6" />
        </button>
      )}
    </div>
  )
}

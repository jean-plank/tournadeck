'use client'

import { RedirectType, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

import { Loader } from '../components/Loader'
import { Redirect } from '../components/Redirect'
import { DiscordLogoTitle } from '../components/svgs/DiscordLogoTitle'
import { usePocketBase } from '../contexts/PocketBaseContext'

export const LoginButton: React.FC = () => {
  const backUrl = useSearchParams().get('back')
  const { pb, user } = usePocketBase()

  const [isLoading, setIsLoading] = useState(false)

  const connectWithDiscord = useCallback(() => {
    setIsLoading(true)

    pb.collection('users')
      .authWithOAuth2({ provider: 'discord' })
      .finally(() => setIsLoading(false))
  }, [pb])

  return (
    <div>
      {isLoading ? (
        <Loader className="h-6" />
      ) : user === undefined ? (
        <button
          type="button"
          onClick={connectWithDiscord}
          className="flex items-center rounded-md bg-discord-blurple px-6 text-white"
        >
          Connexion avec <DiscordLogoTitle className="my-3 ml-3 h-6" />
        </button>
      ) : (
        <Redirect url={backUrl !== null ? backUrl : '/tournois'} type={RedirectType.replace} />
      )}
    </div>
  )
}

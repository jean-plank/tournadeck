'use client'

import { useCallback } from 'react'
import useSWR from 'swr'

import { AsyncRenderer } from '../components/AsyncRenderer'
import { usePocketBase } from '../contexts/PocketBaseContext'

export const HomeClient: React.FC = () => {
  const { pb, user } = usePocketBase()

  const addTest = useCallback(() => {
    pb.collection('test').create({ label: new Date().toISOString() })
  }, [pb])

  const connectWithDiscord = useCallback(async () => {
    const authData = await pb.collection('users').authWithOAuth2({ provider: 'discord' })

    console.log('authData =', authData)
  }, [pb])

  return (
    <div>
      <AsyncRenderer
        // need more typesafety on this things
        {...useSWR('test/list', () => pb.collection('test').getFullList({ sort: '-created' }))}
      >
        {res => <pre className="text-xs">test/list: {JSON.stringify(res, null, 2)}</pre>}
      </AsyncRenderer>

      <br />

      <button type="button" onClick={addTest}>
        Add test
      </button>

      <br />
      <br />

      {user !== null ? (
        <span>BONJOUR {user.displayName}</span>
      ) : (
        <button type="button" onClick={connectWithDiscord}>
          Connexion avec Discord
        </button>
      )}
    </div>
  )
}

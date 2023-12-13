'use client'

import { useCallback, useEffect } from 'react'
import useSWR from 'swr'

import { AsyncRenderer } from '../components/AsyncRenderer'
import { usePocketBase } from '../contexts/PocketBaseContext'

export const HomeClient: React.FC = () => {
  const { pb } = usePocketBase()

  useEffect(() => {
    console.log('pb.authStore =', pb.authStore)
  }, [pb.authStore])

  const addTest = useCallback(() => {
    pb.collection('test').create({ label: new Date().toISOString() })
  }, [pb])

  const connectWithDiscod = useCallback(async () => {
    const authData = await pb.collection('users').authWithOAuth2({ provider: 'discord' })

    console.log('authData =', authData)

    // useless, but for science
    const me = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${authData.meta?.accessToken}` },
    })

    console.log('me =', me)
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

      <button onClick={addTest}>Add test</button>

      <br />
      <br />

      {/* TODO: if connected, replace with "BONJOUR Gurimarukin" */}
      <button onClick={connectWithDiscod}>Connexion avec Discord</button>
    </div>
  )
}

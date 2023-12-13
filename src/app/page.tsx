import { Effect } from 'effect'
import Link from 'next/link'

import { contextLive } from '../lib/Context'
import t from './locales/frFR'

const Home: React.FC = async () => {
  const { discordService, auth } = await contextLive

  const token = await Effect.runPromise(auth.getToken)

  console.log('token =', token)

  return (
    <div>
      <h1>Home</h1>

      <nav className="flex flex-col">
        <Link href="/toto" className="underline">
          /toto
        </Link>
        <Link href="/titi" className="underline">
          /titi
        </Link>
      </nav>

      <a
        href={discordService.apiOAuth2AuthorizeUrl('state' /* TODO: some proper state */)}
        className="flex items-center rounded-md bg-discord-blurple px-6 text-white"
      >
        {t.connectWithDiscord}
      </a>

      {/* <pre>{JSON.stringify(clientConfig)}</pre> */}
    </div>
  )
}

export default Home

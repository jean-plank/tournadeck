import Link from 'next/link'

import t from '@/app/locales/frFR'

const Home: React.FC = () => {
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

      <a href="#" className="flex items-center rounded-md bg-discord-blurple px-6 text-white">
        {t.connectWithDiscord}
      </a>

      {/* <pre>{JSON.stringify(clientConfig)}</pre> */}
    </div>
  )
}

export default Home

import Link from 'next/link'

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link href="/toto">/toto</Link>
        <Link href="/titi">/titi</Link>
        <a href="#" target="_blank">
          OUI
        </a>
      </nav>
    </div>
  )
}

export default Home

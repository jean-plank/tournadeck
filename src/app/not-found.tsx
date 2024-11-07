import Link from 'next/link'

const NotFound: React.FC = () => (
  <div className="flex size-full items-center justify-center">
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-5">
        <h1 className="flex border-r border-white/30 pr-6 text-2xl">404</h1>
        <h2 className="text-sm">Page introuvable.</h2>
      </div>

      <Link href="/" className="underline">
        Accueil
      </Link>
    </div>
  </div>
)

export default NotFound

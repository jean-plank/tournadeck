import Link from 'next/link'
import { redirect } from 'next/navigation'

import { listTournaments } from '../../domain/tournament/actions'
import { TournamentId } from '../../models/pocketBase/tables/Tournament'

const Tournaments: React.FC = async () => {
  const tournaments = await listTournaments().catch(() => {
    redirect('/')
  })

  return (
    <ul>
      {tournaments.map(t => {
        const id = TournamentId.unwrap(t.id)
        return (
          <li key={id}>
            <Link href={`/tournament/${id}`} className="underline">
              {t.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default Tournaments

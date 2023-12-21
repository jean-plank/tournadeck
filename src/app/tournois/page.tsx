'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { usePocketBase } from '../../contexts/PocketBaseContext'
import { TournamentTile } from '../../domain/tournois/TournamentTile'
import type { Tournament } from '../../models/Tournament'

const Tournaments: React.FC = () => {
  const { pb } = usePocketBase()
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {
    pb.collection('tournaments')
      .getFullList<Tournament>({
        sort: '-created',
      })
      .then(setTournaments)
  }, [pb])

  return (
    <div>
      <h2>Tournois</h2>
      {tournaments.map(t => (
        <Link key={t.id} href={`/tournoi/${t.id}`}>
          <TournamentTile data={t} />
        </Link>
      ))}
    </div>
  )
}

export default Tournaments

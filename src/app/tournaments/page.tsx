'use client'

import Link from 'next/link'
import PocketBase from 'pocketbase'
import { useEffect, useState } from 'react'

import AttendeesForm from '../../components/AttendeeForm'
import { TournamentTile } from '../../components/TournamentTile'
import type { Tournament } from '../../models/Tournament'

const TournamentSuscription: React.FC = () => {
  const pb = new PocketBase('http://127.0.0.1:8090')
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {
    pb.collection('tournaments')
      .getFullList<Tournament>({
        sort: '-created',
      })
      .then(res => {
        setTournaments(res)
      })
  }, [])

  return (
    <div>
      <h2>Tournois</h2>
      {tournaments.map(t => (
        <Link href={`tournaments/${t.id}`} key={t.id}>
          <TournamentTile data={t} />
        </Link>
      ))}
      <AttendeesForm tournamentId={''} />
    </div>
  )
}

export default TournamentSuscription

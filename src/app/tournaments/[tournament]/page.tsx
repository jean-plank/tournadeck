'use client'

import { useEffect, useState } from 'react'

import { TournamentFC } from '../../../components/TournamentFC'
import { usePocketBase } from '../../../contexts/PocketBaseContext'
import type { Tournament } from '../../../models/Tournament'

export default function Page({ params }: { params: { tournament: string } }) {
  const [tournamentData, setTournamentData] = useState<Tournament | null>(null)

  const { pb } = usePocketBase()
  useEffect(() => {
    pb.collection('tournaments')
      .getOne<Tournament>(params.tournament, {})
      .then(res => {
        setTournamentData(res)
      })
  }, [])
  return tournamentData === null ? (
    <div>Error getting tournament data</div>
  ) : (
    <div>
      <TournamentFC data={tournamentData} />
    </div>
  )
}

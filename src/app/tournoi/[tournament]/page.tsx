'use client'

import { useEffect, useState } from 'react'

import { usePocketBase } from '../../../contexts/PocketBaseContext'
import { TournamentFC } from '../../../domain/tournoi/TournamentFC'
import type { Tournament } from '../../../models/Tournament'

type Props = {
  params: { tournament: string }
}
const Page: React.FC<Props> = ({ params }) => {
  const [tournamentData, setTournamentData] = useState<Tournament | null>(null)

  const { pb } = usePocketBase()

  useEffect(() => {
    pb.collection('tournaments').getOne<Tournament>(params.tournament, {}).then(setTournamentData)
  }, [params.tournament, pb])

  return tournamentData === null ? (
    <div>Erreur lors de la récupération du tournoi</div>
  ) : (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/synthwave.jpg')" }}
    >
      <TournamentFC data={tournamentData} />
    </div>
  )
}

export default Page

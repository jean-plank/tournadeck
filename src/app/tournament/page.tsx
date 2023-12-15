'use client'

import PocketBase from 'pocketbase'
import { useEffect, useState } from 'react'

import Form from '../../components/TournamentSuscriptionForm'
import { TournamentTile } from '../../components/TournamentTile'
import { Tournament } from '../../models/Tournament'

const TournamentSuscription: React.FC = () => {
  const pb = new PocketBase('http://127.0.0.1:8090')
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  // useEffect(() => {
  //   pb.collection('tournaments')
  //     .getFullList<Tournament>({
  //       sort: '-created',
  //     })
  //     .then(res => {
  //       console.log(res)
  //       setTournaments(res)
  //     })
  // }, [])

  return (
    <div>
      <h2>Tournois</h2>
      {tournaments.map(t => (
        <TournamentTile data={t} key={t.name} />
      ))}
      <h2>Form :</h2>
      <Form tournamentId={'tpk4n7503f02ijk'} />
    </div>
  )
}

export default TournamentSuscription

'use client'

import { useCallback } from 'react'

import { cloneTournament } from '../../../../../actions/cloneTournament'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { redirectAppRoute } from '../../../../../utils/redirectAppRoute'

const withAttendees = 'withAttendees'

type Props = {
  tournamentId: TournamentId
}

export const Admin: React.FC<Props> = ({ tournamentId }) => {
  const formAction = useCallback(
    async (formData: FormData) => {
      const withAttendeesValue = formData.get(withAttendees)

      const newTournament = await cloneTournament(tournamentId, withAttendeesValue !== null)

      redirectAppRoute(`/tournoi/${newTournament}`)
    },
    [tournamentId],
  )

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Êtes-vous sûr·e de vouloir cloner le tournoi ?')) {
      e.preventDefault()
    }
  }, [])

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex items-center gap-4 p-4">
      <button type="submit" className="border">
        Cloner le tournoi
      </button>

      <label className="flex gap-1">
        <input type="checkbox" name="withAttendees" />
        <span>Cloner également les participants</span>
      </label>
    </form>
  )
}

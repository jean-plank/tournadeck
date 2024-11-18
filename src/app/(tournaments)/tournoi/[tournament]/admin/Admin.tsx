'use client'

import { useCallback } from 'react'

import { cloneTournament } from '../../../../../actions/cloneTournament'
import type { Tournament } from '../../../../../models/pocketBase/tables/Tournament'
import { redirectAppRoute } from '../../../../../utils/redirectAppRoute'

const withAttendees = 'withAttendees'

type Props = {
  tournament: Tournament
}

export const Admin: React.FC<Props> = ({ tournament }) => {
  const formAction = useCallback(
    (formData: FormData) => {
      const withAttendeesValue = formData.get(withAttendees)

      cloneTournament({
        id: tournament.id,
        name: prompt('', tournament.name) ?? '',
        withAttendees: withAttendeesValue !== null,
      })
        .catch(() => {
          alert('Erreur.')
        })
        .then(newTournament => {
          redirectAppRoute(`/tournoi/${newTournament}`)
        })
    },
    [tournament.id, tournament.name],
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

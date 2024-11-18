'use client'

import { useCallback } from 'react'

const withAttendees = 'withAttendees'

export const Admin: React.FC = () => {
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

function formAction(formData: FormData): void {
  const withAttendeesValue = formData.get(withAttendees)

  const res = { withAttendees: withAttendeesValue !== null }

  console.log('res =', res)
}

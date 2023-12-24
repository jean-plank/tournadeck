'use server'

import { revalidateTag } from 'next/cache'

import { createAttendee, listAttendeesForTournament } from '../../../actions/attendees'
import type { TournamentId } from '../../../models/pocketBase/tables/Tournament'

export async function addAttendee(tournament: TournamentId, formData: FormData): Promise<void> {
  await createAttendee(tournament, formData)

  revalidateTag(listAttendeesForTournament.tag)
}

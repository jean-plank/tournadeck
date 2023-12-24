'use server'

import { either } from 'fp-ts'

import { adminPocketBase } from '../context'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AttendeeCreate } from '../models/attendee/AttendeeCreate'
import type { AttendeeWithRiotId } from '../models/attendee/AttendeeWithRiotId'
import type { Attendee } from '../models/pocketBase/tables/Attendee'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import { GameName } from '../models/riot/GameName'
import { Puuid } from '../models/riot/Puuid'
import { RiotId } from '../models/riot/RiotId'
import { TagLine } from '../models/riot/TagLine'

// for GET actions
const cacheDuration = 5 // seconds

export async function listAttendeesForTournament(
  tournamentId: TournamentId,
): Promise<ReadonlyArray<AttendeeWithRiotId>> {
  const { user } = await auth()

  if (!Permissions.attendees.list(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  const attendees = await adminPb.collection('attendees').getFullList<Attendee>({
    filter: `tournament="${tournamentId}"`,
    next: { revalidate: cacheDuration },
  })

  return attendees.map(
    // TODO
    (a): AttendeeWithRiotId => ({ ...a, riotId: RiotId(GameName('TodoDo'), TagLine('TODO')) }),
  )
}

export async function createAttendee(
  tournament: TournamentId,
  formData: FormData,
): Promise<Attendee> {
  const { user } = await auth()

  if (!Permissions.attendees.list(user.role)) {
    throw Error('Forbidden')
  }

  const decoded = AttendeeCreate.decoder.decode(formData)

  if (either.isLeft(decoded)) {
    throw Error('BadRequest')
  }

  const adminPb = await adminPocketBase

  return await adminPb.collection('attendees').create({
    ...decoded.right,
    user: user.id,
    tournament,
    // TODO
    puuid: Puuid('TODO'),
  })
}

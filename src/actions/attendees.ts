import { adminPocketBase } from '../context'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import type { AttendeeWithRiotId } from '../models/AttendeeWithRiotId'
import type { Attendee } from '../models/pocketBase/tables/Attendee'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import { GameName } from '../models/riot/GameName'
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
    (a): AttendeeWithRiotId => ({ ...a, riotId: RiotId(GameName('TodoDo'), TagLine('TODO')) }),
  )
}

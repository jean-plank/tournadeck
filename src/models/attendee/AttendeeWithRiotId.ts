import type { Attendee } from '../pocketBase/tables/Attendee'
import type { RiotId } from '../riot/RiotId'

export type AttendeeWithRiotId = Attendee & {
  riotId: RiotId
}

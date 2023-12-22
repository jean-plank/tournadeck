import type { PbAttendee } from './tables/Attendee'
import type { PbMatch } from './tables/Match'
import type { PbTeam } from './tables/Team'
import type { PbTest } from './tables/Test'
import type { PbTournament } from './tables/Tournament'
import type { PbUser } from './tables/User'

export type TableName = keyof Tables

export type Tables = {
  attendees: PbAttendee
  matches: PbMatch
  teams: PbTeam
  test: PbTest
  tournaments: PbTournament
  users: PbUser
}

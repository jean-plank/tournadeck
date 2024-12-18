import type { PbAttendee } from './tables/Attendee'
import type { PbRawGame } from './tables/RawGame'
import type { PbTeam } from './tables/Team'
import type { PbTournament } from './tables/Tournament'
import type { PbUser } from './tables/User'
import type { PbMatch } from './tables/match/Match'

export type TableName = keyof Tables

export type Tables = {
  attendees: PbAttendee
  matches: PbMatch
  rawGames: PbRawGame
  teams: PbTeam
  tournaments: PbTournament
  users: PbUser
}

import type { Match } from './tables/Match'
import type { Team } from './tables/Team'
import type { Test } from './tables/Test'
import type { Tournament } from './tables/Tournament'
import type { User } from './tables/User'

export type TableName = keyof Tables

export type Tables = {
  matches: Match
  teams: Team
  test: Test
  tournaments: Tournament
  users: User
}

import type { Test } from './tables/Test'
import type { Tournament } from './tables/Tournament'
import type { User } from './tables/User'

export type TableName = keyof Tables

export type Tables = {
  test: Test
  tournaments: Tournament
  users: User
}

import type { Test } from './tables/Test'
import type { User } from './tables/User'

export type TableName = keyof Tables

export type Tables = {
  test: Test
  users: User
}

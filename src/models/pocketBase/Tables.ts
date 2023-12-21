import type { PbTest } from './tables/Test'
import type { PbUser } from './tables/User'

export type TableName = keyof Tables

export type Tables = {
  test: PbTest
  users: PbUser
}

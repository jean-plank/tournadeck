import type { PbAuthModel } from '../pbModels'

export type User = PbAuthModel & {
  role: string
  displayName?: string | null
}

export type UserRole = 'attendee' | 'organiser'

import type { MyAuthModel } from '../MyPocketBase'

export type User = MyAuthModel & {
  role: UserRole
  displayName?: string | null
}

export type UserRole = 'attendee' | 'organiser'

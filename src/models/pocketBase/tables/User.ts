import type { MyAuthModel } from '../MyPocketBase'

export type User = MyAuthModel & {
  role: string
  displayName?: string | null
}

export type UserRole = 'attendee' | 'organiser'

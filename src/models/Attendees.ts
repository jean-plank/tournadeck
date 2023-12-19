import type { LolElo } from './LolElo'
import type { TeamRole } from './TeamRole'

export type Attendee = {
  id: string
  riotId: string
  user: string
  currentElo: LolElo
  comment: string
  role: TeamRole
  championPool: string
  birthPlace: string
  avatar: string
  isCaptain: boolean
  seed: number
  price: number
  tournament: string
}

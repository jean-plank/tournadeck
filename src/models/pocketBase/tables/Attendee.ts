import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { ChampionPool } from '../../ChampionPool'
import type { LolElo } from '../../LolElo'
import type { TeamRole } from '../../TeamRole'
import type { PbBaseModel } from '../pbModels'
import type { TournamentId } from './Tournament'

export type Attendee = PbBaseModel<AttendeeId> & {
  riotId: string
  user: string
  currentElo: LolElo
  comment: string
  role: TeamRole
  championPool: ChampionPool
  birthPlace: string
  avatar: File | null | string
  isCaptain: boolean
  seed?: number
  price?: number
  tournament: TournamentId
}

type AttendeeId = Newtype<{ readonly AttendeeId: unique symbol }, string>

const { wrap, unwrap } = iso<AttendeeId>()

const AttendeeId = immutableAssign(wrap, { unwrap })

export { AttendeeId }

import { type Newtype, iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { MyBaseModel } from '../MyPocketBase'
import type { TeamId } from './Team'

export type Match = MyBaseModel<MatchId> & {
  team1: TeamId
  team2: TeamId
  plannedOn: Date | string
  apiData: unknown
}

type MatchId = Newtype<{ readonly MatchId: unique symbol }, string>

const { wrap, unwrap } = iso<MatchId>()

const MatchId = immutableAssign(wrap, { unwrap })

export { MatchId }

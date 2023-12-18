import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { MyBaseModel } from '../MyPocketBase'
import type { TournamentId } from './Tournament'

export type Team = MyBaseModel<TeamId> & {
  tournament: TournamentId
  name: string
}

type TeamId = Newtype<{ readonly TeamId: unique symbol }, string>

const { wrap, unwrap } = iso<TeamId>()

const TeamId = immutableAssign(wrap, { unwrap })

export { TeamId }

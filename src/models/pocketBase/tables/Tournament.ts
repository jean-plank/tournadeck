import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { PbBaseModel } from '../pbModels'

export type Tournament = PbBaseModel<TournamentId> & {
  name: string
  start: string
  end: string
  maxTeams: number
}

type TournamentId = Newtype<{ readonly TournamentId: unique symbol }, string>

const { wrap, unwrap } = iso<TournamentId>()

const TournamentId = immutableAssign(wrap, { unwrap })

export { TournamentId }

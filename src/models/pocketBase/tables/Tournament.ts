import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { MyBaseModel } from '../MyPocketBase'

export type Tournament = MyBaseModel<TournamentId> & {
  name: string
  start: Date | string
  end: Date | string
  maxTeams: number
}

type TournamentId = Newtype<{ readonly TournamentId: unique symbol }, string>

const { wrap, unwrap } = iso<TournamentId>()

const TournamentId = immutableAssign(wrap, { unwrap })

export { TournamentId }

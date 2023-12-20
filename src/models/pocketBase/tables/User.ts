import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { PbAuthModel } from '../pbModels'

export type User = PbAuthModel<UserId> & {
  role: string
  displayName?: string | null
}

type UserId = Newtype<{ readonly UserId: unique symbol }, string>

const { wrap, unwrap } = iso<UserId>()

const UserId = immutableAssign(wrap, { unwrap })

export { UserId }

export type UserRole = 'attendee' | 'organiser'

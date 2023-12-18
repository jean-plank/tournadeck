import { type Newtype, iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { MyAuthModel } from '../MyPocketBase'

export type User = MyAuthModel<UserId> & {
  role: UserRole
  displayName?: string | null
}

type UserId = Newtype<{ readonly UserId: unique symbol }, string>

const { wrap, unwrap } = iso<UserId>()

const UserId = immutableAssign(wrap, { unwrap })

export { UserId }

export type UserRole = 'attendee' | 'organiser'

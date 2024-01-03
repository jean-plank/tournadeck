import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { PbAuthModel, PbInput, PbOutput, SingleSelectField, TextField } from '../pbModels'

export type User = PbOutput<PbUser>
export type UserInput = PbInput<PbUser>

export type PbUser = PbAuthModel<
  UserId,
  {
    role: SingleSelectField<UserRole>
    displayName: TextField<string, 'nullable'>
  }
>

type UserId = Newtype<{ readonly UserId: unique symbol }, string>

const { wrap, unwrap } = iso<UserId>()

const UserId = immutableAssign(wrap, { unwrap })

export { UserId }

export type UserRole = 'attendee' | 'organiser'

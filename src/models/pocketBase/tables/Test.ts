import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { MyBaseModel } from '../MyPocketBase'

export type Test = MyBaseModel<TestId> & {
  label?: string | null
}

type TestId = Newtype<{ readonly TestId: unique symbol }, string>

const { wrap, unwrap } = iso<TestId>()

const TestId = immutableAssign(wrap, { unwrap })

export { TestId }

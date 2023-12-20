import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { PbBaseModel } from '../pbModels'

export type Test = PbBaseModel<TestId> & {
  label?: string | null
}

type TestId = Newtype<{ readonly TestId: unique symbol }, string>

const { wrap, unwrap } = iso<TestId>()

const TestId = immutableAssign(wrap, { unwrap })

export { TestId }

import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { NullableField, PbBaseModel, PbInput, PbOutput, TextField } from '../pbModels'

export type Test = PbOutput<PbTest>
export type TestInput = PbInput<PbTest>

export type PbTest = PbBaseModel<
  TestId,
  {
    label: NullableField<TextField>
  }
>

type TestId = Newtype<{ readonly TestId: unique symbol }, string>

const { wrap, unwrap } = iso<TestId>()

const TestId = immutableAssign(wrap, { unwrap })

export { TestId }

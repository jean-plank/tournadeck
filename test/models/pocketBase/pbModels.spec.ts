import type { Newtype } from 'newtype-ts'
import type { IsEqual } from 'type-fest'

import type {
  DateField,
  EditorField,
  MultipleFileField,
  MultipleSelectField,
  NullableField,
  PbAuthModel,
  PbBaseModel,
  PbInput,
  PbOutput,
  SingleRelationField,
  SingleSelectField,
  TextField,
} from '../../../src/models/pocketBase/pbModels'
import type { UserId } from '../../../src/models/pocketBase/tables/User'
import { type Expect, expectT } from '../../expectT'

describe('pbModels', () => {
  describe('PbBaseModel', () => {
    type TestBase = PbOutput<PbTestBase>
    type TestBaseInput = PbInput<PbTestBase>

    type PbTestBase = PbBaseModel<
      TestBaseId,
      {
        text: TextField
        editor: NullableField<EditorField>
        date: DateField
        maybeDate: NullableField<DateField>
        singleSelect: SingleSelectField<'a' | 'b' | 'c'>
        multipleSelect: MultipleSelectField<1 | 2 | 3>
        singleRelation: SingleRelationField<UserId>
        multipleFile: MultipleFileField
      }
    >

    type TestBaseId = Newtype<{ readonly TestBaseId: unique symbol }, string>

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestOutput = Expect<
      IsEqual<
        TestBase,
        {
          id: TestBaseId
          collectionId: string
          collectionName: string
          created: string
          updated: string

          text: string
          editor: string | null | undefined
          date: string
          maybeDate: string | null | undefined
          singleSelect: 'a' | 'b' | 'c'
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          multipleFile: ReadonlyArray<string>
        }
      >
    >

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestInput = Expect<
      IsEqual<
        TestBaseInput,
        {
          text: string
          editor?: string
          date: Date | string
          maybeDate?: Date | string
          singleSelect: 'a' | 'b' | 'c'
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          multipleFile: ReadonlyArray<File>
        }
      >
    >

    it('should test', () => {
      expectT(0).toStrictEqual(0)
    })
  })

  describe('PbAuthModel', () => {
    type TestAuth = PbOutput<PbTestAuth>
    type TestAuthInput = PbInput<PbTestAuth>

    type PbTestAuth = PbAuthModel<
      TestAuthId,
      {
        text: TextField
        editor: NullableField<EditorField>
        date: DateField
        maybeDate: NullableField<DateField>
        singleSelect: SingleSelectField<'a' | 'b' | 'c'>
        multipleSelect: MultipleSelectField<1 | 2 | 3>
        singleRelation: SingleRelationField<UserId>
        multipleFile: MultipleFileField
      }
    >

    type TestAuthId = Newtype<{ readonly TestAuthId: unique symbol }, string>

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestOutput = Expect<
      IsEqual<
        TestAuth,
        {
          id: TestAuthId
          collectionId: string
          collectionName: string
          created: string
          updated: string

          username: string
          verified: boolean
          emailVisibility: boolean
          email: string

          text: string
          editor: string | null | undefined
          date: string
          maybeDate: string | null | undefined
          singleSelect: 'a' | 'b' | 'c'
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          multipleFile: ReadonlyArray<string>
        }
      >
    >

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestInput = Expect<
      IsEqual<
        TestAuthInput,
        {
          username: string
          verified: boolean
          emailVisibility: boolean
          email: string

          password: string
          passwordConfirm: string

          text: string
          editor?: string
          date: Date | string
          maybeDate?: Date | string
          singleSelect: 'a' | 'b' | 'c'
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          multipleFile: ReadonlyArray<File>
        }
      >
    >

    it('should test', () => {
      expectT(0).toStrictEqual(0)
    })
  })
})

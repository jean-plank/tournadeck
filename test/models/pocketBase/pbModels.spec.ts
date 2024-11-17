import type { File } from 'buffer'
import type { Newtype } from 'newtype-ts'
import type { IsEqual } from 'type-fest'

import type {
  BoolField,
  DateField,
  EditorField,
  EmailField,
  JsonField,
  MultipleFileField,
  MultipleRelationField,
  MultipleSelectField,
  NumberField,
  PbAuthModel,
  PbBaseModel,
  PbExpand,
  PbInput,
  PbOutput,
  SingleFileField,
  SingleRelationField,
  SingleSelectField,
  TextField,
  UrlField,
} from '../../../src/models/pocketBase/pbModels'
import type { Tournament, TournamentId } from '../../../src/models/pocketBase/tables/Tournament'
import type { User, UserId } from '../../../src/models/pocketBase/tables/User'
import type { Puuid } from '../../../src/models/riot/Puuid'
import { type Expect } from '../../../src/utils/typeUtils'
import { expectT } from '../../expectT'

describe('pbModels', () => {
  describe('PbBaseModel', () => {
    type TestBase = PbOutput<PbTestBase>
    type TestBaseInput = PbInput<PbTestBase>

    type PbTestBase = PbBaseModel<
      TestBaseId,
      {
        text: TextField<Puuid>
        editor: EditorField<'nullable'>
        date: DateField
        maybeDate: DateField<'nullable'>
        singleSelect: SingleSelectField<'a' | 'b' | 'c'>
        maybeSingleSelect: SingleSelectField<'a' | 'b' | 'c', 'nullable'>
        multipleSelect: MultipleSelectField<1 | 2 | 3>
        singleRelation: SingleRelationField<'users'>
        maybeSingleRelation: SingleRelationField<'users', 'nullable'>
        multipleFile: MultipleFileField
        json: JsonField<{ foo: 123 }>
        maybeJson: JsonField<{ bar: boolean }, 'nullable'>
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

          text: Puuid
          editor: string
          date: string
          maybeDate: string | ''
          singleSelect: 'a' | 'b' | 'c'
          maybeSingleSelect: 'a' | 'b' | 'c' | ''
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          maybeSingleRelation: UserId | ''
          multipleFile: ReadonlyArray<string>
          json: { foo: 123 }
          maybeJson: Nullable<{ bar: boolean }>
        }
      >
    >

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestInput = Expect<
      IsEqual<
        TestBaseInput,
        {
          text: Puuid
          editor: string
          date: Date | string
          maybeDate: Date | string | ''
          singleSelect: 'a' | 'b' | 'c'
          maybeSingleSelect: 'a' | 'b' | 'c' | ''
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          maybeSingleRelation: UserId | ''
          multipleFile: ReadonlyArray<File | Blob>
          json: { foo: 123 }
          maybeJson: Nullable<{ bar: boolean }>
        }
      >
    >

    it('should test', () => {
      expectT(0).toStrictEqual(0)
    })
  })

  describe('PbBaseModel full required', () => {
    type TestBaseRequired = PbOutput<PbTestBaseRequired>
    type TestBaseRequiredInput = PbInput<PbTestBaseRequired>

    type PbTestBaseRequired = PbBaseModel<
      TestBaseReqruiredId,
      {
        text: TextField<Puuid>
        editor: EditorField
        number: NumberField
        bool: BoolField
        email: EmailField
        url: UrlField
        singleSelect: SingleSelectField<'a' | 'b' | 'c'>
        multipleSelect: MultipleSelectField<1 | 2 | 3>
        singleRelation: SingleRelationField<'users'>
        multipleRelation: MultipleRelationField<'tournaments'>
        singleFile: SingleFileField
        multipleFile: MultipleFileField
        json: JsonField<{ foo: 123 }>
      }
    >

    type TestBaseReqruiredId = Newtype<{ readonly TestBaseRequiredId: unique symbol }, string>

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestOutput = Expect<
      IsEqual<
        TestBaseRequired,
        {
          id: TestBaseReqruiredId
          collectionId: string
          collectionName: string
          created: string
          updated: string

          text: Puuid
          editor: string
          number: number
          bool: true
          email: string
          url: string
          singleSelect: 'a' | 'b' | 'c'
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          multipleRelation: ReadonlyArray<TournamentId>
          singleFile: string
          multipleFile: ReadonlyArray<string>
          json: { foo: 123 }
        }
      >
    >

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestInput = Expect<
      IsEqual<
        TestBaseRequiredInput,
        {
          text: Puuid
          editor: string
          number: number
          bool: true
          email: string
          url: string
          singleSelect: 'a' | 'b' | 'c'
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          multipleRelation: ReadonlyArray<TournamentId>
          singleFile: File | Blob
          multipleFile: ReadonlyArray<File | Blob>
          json: { foo: 123 }
        }
      >
    >

    it('should test', () => {
      expectT(0).toStrictEqual(0)
    })
  })

  describe('PbBaseModel full nullable', () => {
    type TestBaseNullable = PbOutput<PbTestBaseNullable>
    type TestBaseNullableInput = PbInput<PbTestBaseNullable>

    type PbTestBaseNullable = PbBaseModel<
      TestBaseReqruiredId,
      {
        text: TextField<Puuid, 'nullable'>
        editor: EditorField<'nullable'>
        number: NumberField<'nullable'>
        bool: BoolField<'nullable'>
        email: EmailField<'nullable'>
        url: UrlField<'nullable'>
        singleSelect: SingleSelectField<'a' | 'b' | 'c', 'nullable'>
        multipleSelect: MultipleSelectField<1 | 2 | 3, 'nullable'>
        singleRelation: SingleRelationField<'users', 'nullable'>
        multipleRelation: MultipleRelationField<'tournaments', 'nullable'>
        singleFile: SingleFileField<'nullable'>
        multipleFile: MultipleFileField<'nullable'>
        json: JsonField<{ foo: 123 }, 'nullable'>
      }
    >

    type TestBaseReqruiredId = Newtype<{ readonly TestBaseNullableId: unique symbol }, string>

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestOutput = Expect<
      IsEqual<
        TestBaseNullable,
        {
          id: TestBaseReqruiredId
          collectionId: string
          collectionName: string
          created: string
          updated: string

          text: Puuid | ''
          editor: string
          number: number
          bool: boolean
          email: string
          url: string
          singleSelect: 'a' | 'b' | 'c' | ''
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId | ''
          multipleRelation: ReadonlyArray<TournamentId>
          singleFile: string
          multipleFile: ReadonlyArray<string>
          json: Nullable<{ foo: 123 }>
        }
      >
    >

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestInput = Expect<
      IsEqual<
        TestBaseNullableInput,
        {
          text: Puuid | ''
          editor: string
          number: number
          bool: boolean
          email: string
          url: string
          singleSelect: 'a' | 'b' | 'c' | ''
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId | ''
          multipleRelation: ReadonlyArray<TournamentId>
          singleFile: File | Blob | ''
          multipleFile: ReadonlyArray<File | Blob>
          json: Nullable<{ foo: 123 }>
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
        editor: EditorField<'nullable'>
        date: DateField
        maybeDate: DateField<'nullable'>
        singleSelect: SingleSelectField<'a' | 'b' | 'c'>
        multipleSelect: MultipleSelectField<1 | 2 | 3>
        singleRelation: SingleRelationField<'users'>
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
          editor: string
          date: string
          maybeDate: string
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
          editor: string
          date: Date | string
          maybeDate: Date | string | ''
          singleSelect: 'a' | 'b' | 'c'
          multipleSelect: ReadonlyArray<1 | 2 | 3>
          singleRelation: UserId
          multipleFile: ReadonlyArray<File | Blob>
        }
      >
    >

    it('should test', () => {
      expectT(0).toStrictEqual(0)
    })
  })

  describe('PbExpand', () => {
    type PbTestExpand = PbBaseModel<
      Id,
      {
        text: TextField
        singleRelation: SingleRelationField<'users'>
        maybeSingleRelation: SingleRelationField<'users', 'nullable'>
        multipleRelation: MultipleRelationField<'tournaments'>
        maybeMultipleRelation: MultipleRelationField<'tournaments', 'nullable'>
      }
    >

    type Id = Newtype<{ readonly Id: unique symbol }, string>

    type Expanded = PbExpand<
      PbTestExpand,
      'singleRelation' | 'maybeSingleRelation' | 'multipleRelation' | 'maybeMultipleRelation'
    >

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TestExpand = Expect<
      IsEqual<
        Expanded,
        {
          id: Id
          collectionId: string
          collectionName: string
          created: string
          updated: string

          text: string
          singleRelation: UserId
          maybeSingleRelation: UserId | ''
          multipleRelation: ReadonlyArray<TournamentId>
          maybeMultipleRelation: ReadonlyArray<TournamentId>

          expand?: {
            singleRelation: User
            maybeSingleRelation?: User
            multipleRelation: ReadonlyArray<Tournament>
            maybeMultipleRelation?: ReadonlyArray<Tournament> // TODO: can this actually be undefined?
          }
        }
      >
    >

    it('should test', () => {
      expectT(0).toStrictEqual(0)
    })
  })
})

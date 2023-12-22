import type { Literal } from 'io-ts/lib/Schemable'
import type { Newtype } from 'newtype-ts'
import type { ConditionalKeys, Merge } from 'type-fest'

import type { TableName, Tables } from './Tables'

export type PbUnknownId = Newtype<unknown, string>
export type PbUnknownModel = ReadonlyRecord<string, PbField<unknown, unknown, unknown, boolean>>

// ---

export type PbBaseModel<Id extends PbUnknownId, A extends PbUnknownModel> = Merge<
  {
    id: IdField<Id>
    collectionId: PbField<'CollectionId', string, string> // TODO: improve typing
    collectionName: TextField
    created: DateField
    updated: DateField
  },
  A
>

export type PbAuthModel<Id extends PbUnknownId, A extends PbUnknownModel> = PbBaseModel<
  Id,
  Merge<
    {
      username: TextField
      verified: NullableField<BoolField>
      emailVisibility: NullableField<BoolField>
      email: EmailField
    },
    A
  >
>

// ---

// eslint-disable-next-line @typescript-eslint/ban-types
type BaseModelKeys = keyof PbBaseModel<PbUnknownId, {}>

export type PbInput<A extends PbBaseModel<PbUnknownId, PbUnknownModel>> = A extends PbAuthModel<
  PbUnknownId,
  PbUnknownModel
>
  ? Merge<
      InputBis<A>,
      {
        password: string
        passwordConfirm: string
      }
    >
  : InputBis<A>

type InputBis<A extends PbBaseModel<PbUnknownId, PbUnknownModel>> = Omit<
  Merge<
    {
      // required
      [K in Exclude<keyof A, ConditionalKeys<A, { nullable: true }>>]: A[K]['input']
    },
    {
      // nullable
      [K in ConditionalKeys<A, { nullable: true }>]?: A[K]['input']
    }
  >,
  BaseModelKeys
>

export type PbOutput<A extends PbBaseModel<PbUnknownId, PbUnknownModel>> = {
  [K in keyof A]: A[K]['nullable'] extends true
    ? A[K]['_tag'] extends JsonTag
      ? A[K]['output'] | null
      : A[K]['_tag'] extends SingleSelectTag | SingleRelationTag
        ? A[K]['output'] | ''
        : A[K]['output']
    : A[K]['output']
}

// ---

type PbField<Tag, I, O, Nullable extends boolean = false> = {
  _tag: Tag
  input: I
  output: O
  nullable: Nullable
}

/**
 * Nullable fields defaults are:
 * - 0 for NumberField
 * - false for BoolField
 * - [] for multiple fields
 * - '' for all other fields
 */
export type NullableField<A extends PbField<unknown, unknown, unknown>> = A['_tag'] extends BoolTag
  ? PbField<BoolTag, boolean, boolean, true>
  : PbField<A['_tag'], A['input'], A['output'], true>

type IdField<Id extends PbUnknownId> = PbField<'Id', Id, Id>

export type TextField<A extends string | Newtype<unknown, string> = string> = PbField<'Text', A, A>

export type EditorField = PbField<'Editor', string, string>

export type NumberField = PbField<'Number', number, number>

/**
 * Non nullable bool field can only be true
 */
export type BoolField = PbField<BoolTag, true, true>
type BoolTag = 'Bool'

export type EmailField = PbField<'Email', string, string>

export type UrlField = PbField<'Url', string, string>

export type DateField = PbField<'Date', Date | string, string>

export type SingleSelectField<A extends Literal> = PbField<SingleSelectTag, A, A>
type SingleSelectTag = 'SingleSelect'

export type MultipleSelectField<A extends Literal> = PbField<
  'MultipleSelect',
  ReadonlyArray<A>,
  ReadonlyArray<A>
>

// TODO: handle expand on relations
export type SingleRelationField<N extends TableName> = PbField<
  SingleRelationTag,
  Tables[N]['id']['input'],
  Tables[N]['id']['output']
>
type SingleRelationTag = 'SingleRelation'

export type MultipleRelationField<N extends TableName> = PbField<
  'MultipleRelation',
  ReadonlyArray<Tables[N]['id']['input']>,
  ReadonlyArray<Tables[N]['id']['output']>
>

export type SingleFileField = PbField<'SingleFile', File | Blob, string>

export type MultipleFileField = PbField<
  'MultipleFile',
  ReadonlyArray<File | Blob>,
  ReadonlyArray<string>
>

export type JsonField<A extends PbJson> = PbField<JsonTag, A, A>
type JsonTag = 'Json'

// ---

type PbJson = PbLiteral | Newtype<unknown, PbLiteral> | PbJsonArray | PbJsonRecord
type PbLiteral = boolean | number | string | null

type PbJsonRecord = {
  readonly [key: string]: PbJson
}

type PbJsonArray = ReadonlyArray<PbJson>

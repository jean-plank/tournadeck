import type { File } from 'buffer'
import type { Literal } from 'io-ts/lib/Schemable'
import type { Newtype } from 'newtype-ts'
import type { Except, Merge } from 'type-fest'

import type { TableName, Tables } from './Tables'

export type PbAnyId = Newtype<unknown, string>
export type PbAnyModel = ReadonlyRecord<string, PbField<unknown, unknown, unknown, NullReq>>

// ---

export type PbBaseModel<Id extends PbAnyId, A extends PbAnyModel> = Merge<
  {
    id: IdField<Id>
    collectionId: PbField<'CollectionId', string, string, 'required'> // TODO: improve typing
    collectionName: TextField
    created: DateField
    updated: DateField
  },
  A
>

export type PbAuthModel<Id extends PbAnyId, A extends PbAnyModel> = PbBaseModel<
  Id,
  Merge<
    {
      username: TextField
      verified: BoolField<'nullable'>
      emailVisibility: BoolField<'nullable'>
      email: EmailField
    },
    A
  >
>

// ---

// eslint-disable-next-line @typescript-eslint/ban-types
type BaseModelKeys = keyof PbBaseModel<PbAnyId, {}>

export type PbInput<A extends PbBaseModel<PbAnyId, PbAnyModel>> =
  A extends PbAuthModel<PbAnyId, PbAnyModel>
    ? Merge<
        InputBis<A>,
        {
          password: string
          passwordConfirm: string
        }
      >
    : InputBis<A>

type InputBis<A extends PbBaseModel<PbAnyId, PbAnyModel>> = Except<
  { [K in keyof A]: A[K]['input'] },
  BaseModelKeys
>

export type PbInputWithId<A extends PbBaseModel<PbAnyId, PbAnyModel>> = Merge<
  PbInput<A>,
  {
    id: A['id']['input']
  }
>

export type PbOutput<A extends PbBaseModel<PbAnyId, PbAnyModel>> = {
  [K in keyof A]: A[K]['output']
}

export type PbExpand<
  A extends PbBaseModel<PbAnyId, PbAnyModel>,
  K extends ExpandableKeys<A>,
> = Merge<
  PbOutput<A>,
  {
    expand?: Merge<
      {
        // required
        [K_ in K]: ExpandField<A, K_>
      },
      {
        // nullable
        [K_ in Exclude<K, RequiredKeys<A>>]?: ExpandField<A, K_>
      }
    >
  }
>

type ExpandField<A, K extends keyof A> =
  A[K] extends SingleRelationField<TableName, NullReq>
    ? PbOutput<Tables[A[K]['tableName']]>
    : A[K] extends MultipleRelationField<TableName, NullReq>
      ? ReadonlyArray<PbOutput<Tables[A[K]['tableName']]>>
      : never

type ExpandableKeys<A extends PbBaseModel<PbAnyId, PbAnyModel>> = {
  [K in keyof A]: A[K] extends
    | SingleRelationField<TableName, NullReq>
    | MultipleRelationField<TableName, NullReq>
    ? K
    : never
}[keyof A]

type RequiredKeys<A extends PbBaseModel<PbAnyId, PbAnyModel>> = Exclude<keyof A, NullableKeys<A>>
type NullableKeys<A extends PbBaseModel<PbAnyId, PbAnyModel>> = {
  [K in keyof A]: A[K]['nullable'] extends 'nullable' ? K : never
}[keyof A]

// ---

type PbField<Tag, I, O, N extends NullReq> = {
  __tag: Tag
  input: I
  output: O
  nullable: N
}

type NullReq = 'nullable' | 'required'

/**
 * Nullable fields defaults are:
 * - 0 for NumberField
 * - false for BoolField
 * - [] for multiple fields
 * - '' for all other fields
 */

type IdField<Id extends PbAnyId> = PbField<'Id', Id, Id, 'required'>

export type TextField<
  A extends string | Newtype<unknown, string> = string,
  N extends NullReq = 'required',
> = PbField<'Text', N extends 'nullable' ? A | '' : A, N extends 'nullable' ? A | '' : A, N>

export type EditorField<N extends NullReq = 'required'> = PbField<
  'Editor',
  N extends 'nullable' ? string | '' : string,
  N extends 'nullable' ? string | '' : string,
  N
>

export type NumberField<N extends NullReq = 'required'> = PbField<
  'Number',
  N extends 'nullable' ? number | 0 : number,
  N extends 'nullable' ? number | 0 : number,
  N
>

/**
 * Non nullable bool field can only be true
 */
export type BoolField<N extends NullReq = 'required'> = N extends 'nullable'
  ? PbField<'Bool', boolean, boolean, N>
  : PbField<'Bool', true, true, N>

export type EmailField<N extends NullReq = 'required'> = PbField<
  'Email',
  N extends 'nullable' ? string | '' : string,
  N extends 'nullable' ? string | '' : string,
  N
>

export type UrlField<N extends NullReq = 'required'> = PbField<
  'Url',
  N extends 'nullable' ? string | '' : string,
  N extends 'nullable' ? string | '' : string,
  N
>

export type DateField<N extends NullReq = 'required'> = PbField<
  'Date',
  N extends 'nullable' ? Date | string | '' : Date | string,
  N extends 'nullable' ? string | '' : string,
  N
>

export type SingleSelectField<A extends Literal, N extends NullReq = 'required'> = PbField<
  'SingleSelect',
  N extends 'nullable' ? A | '' : A,
  N extends 'nullable' ? A | '' : A,
  N
>

export type MultipleSelectField<A extends Literal, N extends NullReq = 'required'> = PbField<
  'MultipleSelect',
  ReadonlyArray<A>,
  ReadonlyArray<A>,
  N
>

export type SingleRelationField<Name extends TableName, N extends NullReq = 'required'> = Merge<
  PbField<
    'SingleRelation',
    N extends 'nullable' ? Tables[Name]['id']['input'] | '' : Tables[Name]['id']['input'],
    N extends 'nullable' ? Tables[Name]['id']['output'] | '' : Tables[Name]['id']['output'],
    N
  >,
  {
    tableName: Name
  }
>

export type MultipleRelationField<Name extends TableName, N extends NullReq = 'required'> = Merge<
  PbField<
    'MultipleRelation',
    ReadonlyArray<Tables[Name]['id']['input']>,
    ReadonlyArray<Tables[Name]['id']['output']>,
    N
  >,
  {
    tableName: Name
  }
>

export type SingleFileField<N extends NullReq = 'required'> = PbField<
  'SingleFile',
  N extends 'nullable' ? File | Blob | '' : File | Blob,
  N extends 'nullable' ? string | '' : string,
  N
>

export type MultipleFileField<N extends NullReq = 'required'> = PbField<
  'MultipleFile',
  ReadonlyArray<File | Blob>,
  ReadonlyArray<string>,
  N
>

export type JsonField<A extends PbJson, N extends NullReq = 'required', O = A> = PbField<
  'Json',
  N extends 'nullable' ? Nullable<A> : A,
  N extends 'nullable' ? Nullable<O> : O,
  N
>

// ---

type PbJson = PbLiteral | Newtype<unknown, PbLiteral> | PbJsonArray | PbJsonRecord
type PbLiteral = boolean | number | string | null

type PbJsonRecord = {
  readonly [key: string]: PbJson
}

type PbJsonArray = ReadonlyArray<PbJson>

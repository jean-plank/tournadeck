import type { Json } from 'fp-ts/Json'
import type { Literal } from 'io-ts/lib/Schemable'
import type { Newtype } from 'newtype-ts'
import type { ConditionalKeys, Merge } from 'type-fest'

export type PbUnknownId = Newtype<unknown, string>
export type PbUnknownModel = ReadonlyRecord<string, PbField<unknown, unknown, boolean>>

// ---

export type PbBaseModel<Id extends PbUnknownId, A extends PbUnknownModel> = Merge<
  {
    id: IdField<Id>
    collectionId: PbField<string, string> // TODO: improve typing
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
      verified: BoolField
      emailVisibility: BoolField
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
  [K in keyof A]: A[K]['nullable'] extends true ? A[K]['output'] | null | undefined : A[K]['output']
}

// ---

type PbField<I, O, Nullable extends boolean = false> = {
  input: I
  output: O
  nullable: Nullable
}

export type NullableField<A extends PbField<unknown, unknown>> = PbField<
  A['input'],
  A['output'],
  true
>

type IdField<Id extends PbUnknownId> = PbField<Id, Id>

export type TextField = PbField<string, string>

export type EditorField = PbField<string, string>

export type NumberField = PbField<number, number>

export type BoolField = PbField<boolean, boolean>

export type EmailField = PbField<string, string>

export type UrlField = PbField<string, string>

export type DateField = PbField<Date | string, string>

export type SingleSelectField<A extends Literal> = PbField<A, A>

export type MultipleSelectField<A extends Literal> = PbField<ReadonlyArray<A>, ReadonlyArray<A>>

export type SingleRelationField<Id extends PbUnknownId> = PbField<Id, Id>

export type MultipleRelationField<Id extends PbUnknownId> = PbField<
  ReadonlyArray<Id>,
  ReadonlyArray<Id>
>

export type SingleFileField = PbField<File, string>

export type MultipleFileField = PbField<ReadonlyArray<File>, ReadonlyArray<string>>

export type JsonFileField<A extends Json> = PbField<A, A>

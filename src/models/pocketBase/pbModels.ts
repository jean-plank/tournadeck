import type { Newtype } from 'newtype-ts'
import type { Except } from 'type-fest'

type UnknownId = Newtype<unknown, string>

export type CreateModel<A> = A extends PbAuthModel<UnknownId>
  ? Except<A, keyof PbBaseModel<A['id']>> & {
      password: string
      passwordConfirm: string
    }
  : A extends PbBaseModel<UnknownId>
    ? Except<A, keyof PbBaseModel<A['id']>>
    : never

export type PbBaseModel<Id extends UnknownId> = {
  id: Id
  collectionId: string
  collectionName: string
  created: string
  updated: string
}

export type PbAuthModel<Id extends UnknownId> = PbBaseModel<Id> & {
  username: string
  verified: boolean
  emailVisibility: boolean
  email: string
}
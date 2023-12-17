import type { BaseAuthStore, RecordOptions, RecordService } from 'pocketbase'
import PocketBase from 'pocketbase'
import type { Except } from 'type-fest'

import type { Branded } from '../Branded'
import { brand } from '../Branded'
import type { TableName, Tables } from './Tables'

type MyPocketBase_ = Except<PocketBase, 'collection'> & {
  collection: <A extends TableName>(name: A) => MyRecordService<Tables[A]>
}

type MyRecordService<A> = Except<RecordService<A>, 'create'> & {
  create: (bodyParams: CreateModel<A> | FormData, options?: RecordOptions) => Promise<A>
}

type Tag = { readonly MyPocketBase: unique symbol }

type MyPocketBase = Branded<Tag, MyPocketBase_>

function MyPocketBase(authStore?: BaseAuthStore | null, lang?: string): MyPocketBase {
  return brand<Tag>()(new PocketBase(process.env.NEXT_PUBLIC_POCKET_BASE_URL, authStore, lang))
}

export { MyPocketBase }

export type MyBaseModel = {
  id: string
  collectionId: string
  collectionName: string
  created: Date | string
  updated: Date | string
}

export type MyAuthModel = MyBaseModel & {
  username: string
  verified: boolean
  emailVisibility: boolean
  email: string
}

export type CreateModel<A> = A extends MyBaseModel
  ? Except<A, keyof MyBaseModel>
  : A extends MyAuthModel
    ? Except<A, keyof MyBaseModel>
    : never

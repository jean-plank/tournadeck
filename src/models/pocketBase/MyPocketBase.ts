import type { BaseAuthStore, RecordService } from 'pocketbase'
import PocketBase from 'pocketbase'
import type { Except } from 'type-fest'

import type { Branded } from '../Branded'
import { brand } from '../Branded'
import type { Tables } from './Tables'

type MyPocketBase_ = Except<PocketBase, 'collection'> & {
  collection: <A extends keyof Tables>(name: A) => RecordService<Tables[A]>
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
  created: string
  updated: string
}

export type MyAuthModel = MyBaseModel & {
  username: string
  verified: boolean
  emailVisibility: boolean
  email: string
}

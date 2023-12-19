import type { BaseAuthStore, RecordService } from 'pocketbase'
import PocketBase from 'pocketbase'
import type { Except } from 'type-fest'

import type { Branded } from '../Branded'
import { brand } from '../Branded'
import type { TableName, Tables } from './Tables'

type MyPocketBase_ = Except<PocketBase, 'collection'> & {
  collection: <A extends TableName>(name: A) => RecordService<Tables[A]>
}

type Tag = { readonly MyPocketBase: unique symbol }

type MyPocketBase = Branded<Tag, MyPocketBase_>

function MyPocketBase(authStore?: BaseAuthStore | null, lang?: string): MyPocketBase {
  return brand<Tag>()(new PocketBase(process.env.NEXT_PUBLIC_POCKET_BASE_URL, authStore, lang))
}

export { MyPocketBase }

import type { Newtype } from 'newtype-ts'
import type { BaseAuthStore, RecordOptions, RecordService } from 'pocketbase'
import PocketBase from 'pocketbase'
import type { OverrideProperties } from 'type-fest'

import type { Branded } from '../Branded'
import { brand } from '../Branded'
import type { TableName, Tables } from './Tables'
import type { CreateModel, PbBaseModel } from './pbModels'

type MyPocketBase_ = OverrideProperties<
  PocketBase,
  {
    collection: <A extends TableName>(name: A) => MyRecordService<Tables[A]>
  }
>

type MyRecordService<A extends PbBaseModel<Newtype<unknown, string>>> = OverrideProperties<
  RecordService<A>,
  {
    getOne: <B = A>(id: A['id'], options?: RecordOptions) => Promise<B>
    create: (bodyParams: CreateModel<A> | FormData, options?: RecordOptions) => Promise<A>
  }
>

type Tag = { readonly MyPocketBase: unique symbol }

type MyPocketBase = Branded<Tag, MyPocketBase_>

function MyPocketBase(authStore?: BaseAuthStore | null, lang?: string): MyPocketBase {
  return brand<Tag>()(
    new PocketBase(process.env.NEXT_PUBLIC_POCKET_BASE_URL, authStore, lang) as MyPocketBase_,
  )
}

export { MyPocketBase }

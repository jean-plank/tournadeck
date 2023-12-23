import type {
  BaseAuthStore,
  CommonOptions,
  RecordOptions,
  RecordService,
  SendOptions,
} from 'pocketbase'
import PocketBase from 'pocketbase'
import type { OverrideProperties } from 'type-fest'

import type { Branded } from '../Branded'
import { brand } from '../Branded'
import type { TableName, Tables } from './Tables'
import type { PbBaseModel, PbInput, PbOutput, PbUnknownId, PbUnknownModel } from './pbModels'

type MyPocketBase_ = OverrideProperties<
  PocketBase,
  {
    send: (path: string, options: SendOptions) => Promise<Response>
    collection: <A extends TableName>(name: A) => MyRecordService<Tables[A]>
  }
>

type MyRecordService<A extends PbBaseModel<PbUnknownId, PbUnknownModel>> = OverrideProperties<
  RecordService<PbOutput<A>>,
  {
    getOne: <O = PbOutput<A>>(id: A['id']['input'], options?: RecordOptions) => Promise<O>
    create: (bodyParams: PbInput<A> | FormData, options?: RecordOptions) => Promise<PbOutput<A>>
    update: <O = PbOutput<A>>(
      id: A['id']['input'],
      bodyParams?: Partial<PbInput<A>> | FormData,
      options?: RecordOptions,
    ) => Promise<O>
    delete: (id: A['id']['input'], options?: CommonOptions) => Promise<boolean>
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

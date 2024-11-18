import { number, readonlyArray } from 'fp-ts'
import type {
  BaseAuthStore,
  CommonOptions,
  ListResult,
  RecordFullListOptions,
  RecordListOptions,
  RecordOptions,
  RecordService,
} from 'pocketbase'
import PocketBase from 'pocketbase'
import type { Merge, OverrideProperties } from 'type-fest'

import { immutableAssign } from '../../utils/fpTsUtils'
import type { Branded } from '../Branded'
import { brand } from '../Branded'
import type { TableName, Tables } from './Tables'
import type { PbAnyId, PbAnyModel, PbBaseModel, PbInput, PbInputWithId, PbOutput } from './pbModels'
import { smartFilter } from './smartFilter'

type MyPocketBase_ = Merge<OverridenPocketBase, PocketBaseAugment>

type OverridenPocketBase = OverrideProperties<
  PocketBase,
  {
    collection: <A extends TableName>(name: A) => MyRecordService<Tables[A]>
  }
>

type PocketBaseAugment = {
  // TODO: directly override getFullList, getList and getFirstListItem
  smartFilter: <A extends TableName = never>(filter: Partial<PbInputWithId<Tables[A]>>) => string
}

type MyRecordService<A extends PbBaseModel<PbAnyId, PbAnyModel>> = OverrideProperties<
  RecordService<PbOutput<A>>,
  {
    getFullList: {
      (options?: RecordFullListOptions): Promise<ReadonlyArray<PbOutput<A>>>
      (batch?: number, options?: RecordListOptions): Promise<ReadonlyArray<PbOutput<A>>>
      <O>(options?: RecordFullListOptions): Promise<ReadonlyArray<O>>
      <O>(batch?: number, options?: RecordListOptions): Promise<ReadonlyArray<O>>
    }

    getList: {
      (
        page?: number,
        perPage?: number,
        options?: RecordListOptions,
      ): Promise<ListResult<PbOutput<A>>>
      <O>(page?: number, perPage?: number, options?: RecordListOptions): Promise<ListResult<O>>
    }

    getFirstListItem: {
      (filter: string, options?: RecordListOptions): Promise<PbOutput<A>>
      <O>(filter: string, options?: RecordListOptions): Promise<O>
    }

    getOne: {
      (id: A['id']['input'], options?: RecordOptions): Promise<PbOutput<A>>
      <O>(id: A['id']['input'], options?: RecordOptions): Promise<O>
    }

    create: (bodyParams: PbInput<A> | FormData, options?: RecordOptions) => Promise<PbOutput<A>>

    update: {
      (
        id: A['id']['input'],
        bodyParams?: Partial<PbInput<A>> | FormData,
        options?: RecordOptions,
      ): Promise<PbOutput<A>>
      <O>(
        id: A['id']['input'],
        bodyParams?: Partial<PbInput<A>> | FormData,
        options?: RecordOptions,
      ): Promise<O>
    }

    delete: (id: A['id']['input'], options?: CommonOptions) => Promise<boolean>
  }
>

type Tag = { readonly MyPocketBase: unique symbol }

type MyPocketBase = Branded<Tag, MyPocketBase_>

const MyPocketBase = immutableAssign(
  (baseUrl: Optional<string>, authStore?: Nullable<BaseAuthStore>, lang?: string): MyPocketBase => {
    const pb = new PocketBase(baseUrl, authStore, lang) as OverridenPocketBase

    const myPb: MyPocketBase_ = Object.assign<OverridenPocketBase, PocketBaseAugment>(pb, {
      smartFilter: params => pb.filter(smartFilter(params), params),
    })

    return brand<Tag>()(myPb)
  },
  {
    statusesToUndefined:
      (...statuses: NonEmptyArray<number>) =>
      (e: unknown): undefined => {
        if (
          e instanceof Error &&
          'status' in e &&
          typeof e.status === 'number' &&
          readonlyArray.elem(number.Eq)(e.status, statuses)
        ) {
          return undefined
        }
      },
  },
)

export { MyPocketBase }

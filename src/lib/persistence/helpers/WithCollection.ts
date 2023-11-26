import type { Collection, Document as MongoDocument } from 'mongodb'

import type { Branded } from '../../utils/brand'
import { brand } from '../../utils/brand'
import type { EffecT } from '../../utils/fp'
import type { WithDb } from './WithDb'

type TagGetter = { readonly WithCollectionGetter: unique symbol }

type WithCollectionGetter = Branded<
  TagGetter,
  <O extends MongoDocument>(collName: string) => WithCollection<O>
>

const WithCollectionGetter = (withDb: WithDb): WithCollectionGetter =>
  brand<TagGetter>()(
    <O extends MongoDocument>(collName: string): WithCollection<O> =>
      brand<Tag>()({
        effect: <A>(f: (coll: Collection<O>) => Promise<A>): EffecT<A> =>
          withDb.effect(db => f(db.collection(collName))),
      }),
  )

type Tag = { readonly WithCollection: unique symbol }

type WithCollection<O extends MongoDocument> = Branded<
  Tag,
  {
    effect: <A>(f: (coll: Collection<O>) => Promise<A>) => EffecT<A>
  }
>

export { WithCollectionGetter, type WithCollection }

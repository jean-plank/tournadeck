import type { Collection, Document as MongoDocument } from 'mongodb'

import type { EffecT } from '../../utils/fp'
import type { WithDb } from './WithDb'

export type WithCollectionGetter = <O extends MongoDocument>(collName: string) => WithCollection<O>

export class WithCollection<O extends MongoDocument> {
  effect: <A>(f: (coll: Collection<O>) => Promise<A>) => EffecT<A>

  constructor(withDb: WithDb, collName: string) {
    this.effect = f => withDb.effect(db => f(db.collection(collName)))
  }
}

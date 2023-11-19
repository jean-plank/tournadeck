import { Effect, pipe } from 'effect'
import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'

import { type EffecT, effectTryPromise } from '@/utils/fp'

type Load = {
  host: string
  username: string
  password: string
  dbName: string
}

export class WithDb {
  private constructor(
    private client: MongoClient,
    private dbName: string,
  ) {}

  effect<A>(f: (db: Db) => Promise<A>): EffecT<Error, A> {
    return effectTryPromise(() => f(this.client.db(this.dbName)))
  }

  static load({ host, username, password, dbName }: Load): EffecT<Error, WithDb> {
    return pipe(
      effectTryPromise(() =>
        MongoClient.connect(`mongodb://${host}`, { auth: { username, password } }),
      ),
      Effect.map(client => new WithDb(client, dbName)),
    )
  }
}

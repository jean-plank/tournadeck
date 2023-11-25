import { Effect, pipe } from 'effect'
import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'

import { EffecT } from '../../utils/fp'

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

  static load({ host, username, password, dbName }: Load): EffecT<WithDb> {
    return pipe(
      EffecT.tryPromise(() =>
        MongoClient.connect(`mongodb://${host}`, { auth: { username, password } }),
      ),
      Effect.map(client => new WithDb(client, dbName)),
    )
  }

  effect<A>(f: (db: Db) => Promise<A>): EffecT<A> {
    return EffecT.tryPromise(() => f(this.client.db(this.dbName)))
  }
}

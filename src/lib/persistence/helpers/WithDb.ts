import { Effect, pipe } from 'effect'
import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'

import { type Branded, brand } from '../../utils/brand'
import { EffecT } from '../../utils/fp'

type Tag = { readonly WithDb: unique symbol }

type WithDb = Branded<
  Tag,
  {
    effect: <A>(f: (db: Db) => Promise<A>) => EffecT<A>
  }
>

type Load = {
  host: string
  username: string
  password: string
  dbName: string
}

const WithDb = ({ host, username, password, dbName }: Load): EffecT<WithDb> =>
  pipe(
    EffecT.tryPromise(() =>
      MongoClient.connect(`mongodb://${host}`, { auth: { username, password } }),
    ),
    Effect.map(client =>
      brand<Tag>()({
        effect: <A>(f: (db: Db) => Promise<A>): EffecT<A> =>
          EffecT.tryPromise(() => f(client.db(dbName))),
      }),
    ),
  )

export { WithDb }

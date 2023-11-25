import { Effect, pipe } from 'effect'

import type { MyLoggerGetter } from '../MyLogger'
import { DiscordUserId } from '../models/discord/DiscordUserId'
import type { UserOutput } from '../models/user/User'
import { User } from '../models/user/User'
import { UserDiscordInfos } from '../models/user/UserDiscordInfos'
import { UserId } from '../models/user/UserId'
import type { EffecT } from '../utils/fp'
import { $codecWithName, $text } from '../utils/macros'
import { FpCollection } from './helpers/FpCollection'
import type { WithCollectionGetter } from './helpers/WithCollection'

const Keys = {
  discordId: FpCollection.getPath<User>()('discord', 'id'),
}

export class UserPersistence {
  static collName = 'user' as const

  private constructor(private collection: FpCollection<UserOutput, User>) {}

  static load(
    Logger: MyLoggerGetter,
    withCollectionGetter: WithCollectionGetter,
  ): EffecT<UserPersistence> {
    const logger = Logger($text!(UserPersistence))
    const collection = new FpCollection(
      logger,
      $codecWithName!(User),
      withCollectionGetter(UserPersistence.collName),
    )

    const ensureIndexes: EffecT<void> = collection.ensureIndexes([
      { key: { id: -1 }, unique: true },
      { key: { [Keys.discordId]: -1 }, unique: true },
    ])

    return pipe(
      ensureIndexes,
      Effect.map(() => new UserPersistence(collection)),
    )
  }

  findByDiscordId(id: DiscordUserId): EffecT<Optional<User>> {
    const encoded = DiscordUserId.codec.encode(id)
    return this.collection.findOne({
      [Keys.discordId]: encoded,
    })
  }

  create(user: User): EffecT<boolean> {
    return pipe(
      this.collection.insertOne(user),
      Effect.map(r => r.acknowledged),
    )
  }

  updateDiscord(id: UserId, discord: UserDiscordInfos): EffecT<boolean> {
    return pipe(
      this.collection.withCollection.effect(c =>
        c.updateOne(
          { id: UserId.codec.encode(id) },
          { $set: { discord: UserDiscordInfos.codec.encode(discord) } },
        ),
      ),
      // TODO: logger.trace
      Effect.map(r => r.modifiedCount <= 1),
    )
  }
}

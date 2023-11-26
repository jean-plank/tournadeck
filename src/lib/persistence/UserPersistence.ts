import { Effect, pipe } from 'effect'

import type { MyLoggerGetter } from '../MyLogger'
import { DiscordUserId } from '../models/discord/DiscordUserId'
import { User } from '../models/user/User'
import { UserDiscordInfos } from '../models/user/UserDiscordInfos'
import { UserId } from '../models/user/UserId'
import type { Branded } from '../utils/brand'
import { brand } from '../utils/brand'
import type { EffecT } from '../utils/fp'
import { $codecWithName, $text } from '../utils/macros'
import { FpCollection } from './helpers/FpCollection'
import type { WithCollectionGetter } from './helpers/WithCollection'

type Tag = { readonly UserPersistence: unique symbol }

type UserPersistence = Branded<
  Tag,
  {
    findByDiscordId: (id: DiscordUserId) => EffecT<Optional<User>>
    create: (user: User) => EffecT<boolean>
    updateDiscord: (id: UserId, discord: UserDiscordInfos) => EffecT<boolean>
  }
>

const collName = 'user' as const

const Keys = {
  discordId: FpCollection.getPath<User>()('discord', 'id'),
}

function construct(
  Logger: MyLoggerGetter,
  withCollectionGetter: WithCollectionGetter,
): EffecT<UserPersistence> {
  const logger = Logger($text!(UserPersistence))
  const collection = FpCollection(
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
    Effect.map(() =>
      brand<Tag>()({
        findByDiscordId: (id: DiscordUserId): EffecT<Optional<User>> => {
          const encoded = DiscordUserId.codec.encode(id)
          return collection.findOne({
            [Keys.discordId]: encoded,
          })
        },

        create: (user: User): EffecT<boolean> =>
          pipe(
            collection.insertOne(user),
            Effect.map(r => r.acknowledged),
          ),

        updateDiscord: (id: UserId, discord: UserDiscordInfos): EffecT<boolean> =>
          pipe(
            collection.withCollection.effect(c =>
              c.updateOne(
                { id: UserId.codec.encode(id) },
                { $set: { discord: UserDiscordInfos.codec.encode(discord) } },
              ),
            ),
            // TODO: logger.trace
            Effect.map(r => r.modifiedCount <= 1),
          ),
      }),
    ),
  )
}

const UserPersistence = Object.assign(construct, { collName })

export { UserPersistence }

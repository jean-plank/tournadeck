import { Duration, Effect, pipe } from 'effect'

import type { MyLoggerGetter } from '../MyLogger'
import type { JwtHelper } from '../helpers/JwtHelpers'
import type { Token } from '../models/user/Token'
import { TokenContent } from '../models/user/TokenContent'
import type { User } from '../models/user/User'
import type { UserDiscordInfos } from '../models/user/UserDiscordInfos'
import { UserId } from '../models/user/UserId'
import type { UserPersistence } from '../persistence/UserPersistence'
import { brand } from '../utils/brand'
import { EffecT } from '../utils/fp'
import { $codecWithName, $text } from '../utils/macros'

type Tag = { readonly UserService: unique symbol }

type UserService = ReturnType<typeof UserService>

const accountTokenTtl = Duration.days(30)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function UserService(
  Logger: MyLoggerGetter,
  userPersistence: UserPersistence,
  jwtHelper: JwtHelper,
) {
  const logger = Logger($text!(UserService))

  return brand<Tag>()({
    registerOrLogin: (discord: UserDiscordInfos): EffecT<Optional<Token>> =>
      pipe(
        userPersistence.findByDiscordId(discord.id),
        Effect.flatMap(user => (user === undefined ? register(discord) : login(user, discord))),
        Effect.flatMap(user => {
          if (user === undefined) return Effect.succeed(undefined)

          const content: TokenContent = {
            id: user.id,
          }

          return signToken(content)
        }),
      ),

    verifyToken: (token: string): EffecT<TokenContent> =>
      jwtHelper.verify($codecWithName!(TokenContent))(token),
  })

  function register(discord: UserDiscordInfos): EffecT<Optional<User>> {
    return pipe(
      Effect.sync(UserId.generate),
      Effect.flatMap(id => {
        const user: User = { id, discord }
        return pipe(
          userPersistence.create(user),
          Effect.map(success => (success ? user : undefined)),
          EffecT.flatMapFirst(u =>
            u !== undefined
              ? logger.info('User created', {
                  id: u.id,
                  discord: { username: u.discord.username },
                })
              : Effect.succeed(undefined),
          ),
        )
      }),
    )
  }

  function login(user: User, discord: UserDiscordInfos): EffecT<Optional<User>> {
    return pipe(
      userPersistence.updateDiscord(user.id, discord),
      Effect.map(updated => (updated ? user : undefined)),
      EffecT.flatMapFirst(u =>
        u !== undefined
          ? logger.debug('User connected', {
              id: u.id,
              discord: { username: u.discord.username },
            })
          : Effect.succeed(undefined),
      ),
    )
  }

  function signToken(content: TokenContent): EffecT<Token> {
    return jwtHelper.sign(TokenContent.codec)(content, { expiresIn: accountTokenTtl })
  }
}

export { UserService }

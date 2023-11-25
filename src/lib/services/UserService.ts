import { Duration, Effect, pipe } from 'effect'

import type { MyLogger, MyLoggerGetter } from '../MyLogger'
import type { JwtHelper } from '../helpers/JwtHelpers'
import type { Token } from '../models/user/Token'
import { TokenContent } from '../models/user/TokenContent'
import type { User } from '../models/user/User'
import type { UserDiscordInfos } from '../models/user/UserDiscordInfos'
import { UserId } from '../models/user/UserId'
import type { UserPersistence } from '../persistence/UserPersistence'
import { EffecT } from '../utils/fp'
import { $text } from '../utils/macros'

const accountTokenTtl = Duration.days(30)

export class UserService {
  private logger: MyLogger

  constructor(
    Logger: MyLoggerGetter,
    private userPersistence: UserPersistence,
    private jwtHelper: JwtHelper,
  ) {
    this.logger = Logger($text!(UserService))
  }

  registerOrLogin(discord: UserDiscordInfos): EffecT<Optional<Token>> {
    return pipe(
      this.userPersistence.findByDiscordId(discord.id),
      Effect.flatMap(user =>
        user === undefined ? this.register(discord) : this.login(user, discord),
      ),
      Effect.flatMap(user => {
        if (user === undefined) return Effect.succeed(undefined)

        const content: TokenContent = {
          id: user.id,
        }

        return this.signToken(content)
      }),
    )
  }

  private register(discord: UserDiscordInfos): EffecT<Optional<User>> {
    return pipe(
      Effect.sync(UserId.generate),
      Effect.flatMap(id => {
        const user: User = { id, discord }
        return pipe(
          this.userPersistence.create(user),
          Effect.map(success => (success ? user : undefined)),
          EffecT.flatMapFirst(u =>
            u !== undefined
              ? this.logger.info('User created', {
                  id: u.id,
                  discord: { username: u.discord.username },
                })
              : Effect.succeed(undefined),
          ),
        )
      }),
    )
  }

  private login(user: User, discord: UserDiscordInfos): EffecT<Optional<User>> {
    return pipe(
      this.userPersistence.updateDiscord(user.id, discord),
      Effect.map(updated => (updated ? user : undefined)),
      EffecT.flatMapFirst(u =>
        u !== undefined
          ? this.logger.debug('User connected', {
              id: u.id,
              discord: { username: u.discord.username },
            })
          : Effect.succeed(undefined),
      ),
    )
  }

  private signToken(content: TokenContent): EffecT<Token> {
    return this.jwtHelper.sign(TokenContent.codec)(content, { expiresIn: accountTokenTtl })
  }
}

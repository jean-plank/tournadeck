import { Duration, Effect, pipe } from 'effect'

import { MyLogger, type MyLoggerGetter } from './MyLogger'
import { ServerConfig } from './ServerConfig'
import { Auth } from './helpers/Auth'
import { HttpClient } from './helpers/HttpClient'
import { JwtHelper } from './helpers/JwtHelpers'
import { HealthCheckPersistence } from './persistence/HealthCheckPersistence'
import { UserPersistence } from './persistence/UserPersistence'
import { WithCollectionGetter } from './persistence/helpers/WithCollection'
import { WithDb } from './persistence/helpers/WithDb'
import { DiscordService } from './services/DiscordService'
import { HealthCheckService } from './services/HealthCheckService'
import { UserService } from './services/UserService'
import { StringUtils } from './utils/StringUtils'
import { type Branded, brand } from './utils/brand'
import type { EffecT } from './utils/fp'
import { $text } from './utils/macros'

type Tag = { readonly Context: unique symbol }

type Context = Branded<
  Tag,
  {
    Logger: MyLoggerGetter
    discordService: DiscordService
    userService: UserService
    auth: Auth
  }
>

const dbRetryDelay = Duration.seconds(10)

function Context(config: ServerConfig): EffecT<Context> {
  const Logger: MyLoggerGetter = name => MyLogger(config.LOG_LEVEL, name)
  const logger = Logger($text!(Context))

  return pipe(
    WithDb({
      host: config.DB_HOST,
      username: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      dbName: config.DB_NAME,
    }),
    Effect.bindTo('withDb'),
    Effect.bind('a', ({ withDb }) => {
      const withCollectionGetter = WithCollectionGetter(withDb)

      return Effect.all([UserPersistence(Logger, withCollectionGetter)], {
        concurrency: 'unbounded',
      })
    }),

    Effect.flatMap(({ withDb, a: [userPersistence] }): EffecT<Context> => {
      const healthCheckPersistence = HealthCheckPersistence(withDb)

      const httpClient = HttpClient(Logger)
      const jwtHelper = JwtHelper(config.JWT_SECRET)

      const discordService = DiscordService(config, httpClient)
      const healthCheckService = HealthCheckService(healthCheckPersistence)
      const userService = UserService(Logger, userPersistence, jwtHelper)

      const auth = Auth(userService)

      const waitDatabaseReady: EffecT<boolean> = pipe(
        healthCheckService.check,
        Effect.orElse(() =>
          pipe(
            logger.info(
              `Couldn't connect to mongo, waiting ${StringUtils.prettyDuration(
                dbRetryDelay,
              )} before next try`,
            ),
            Effect.flatMap(() => pipe(waitDatabaseReady, Effect.delay(dbRetryDelay))),
            Effect.filterOrElse(
              success => success,
              () => Effect.fail(Error("Health check wasn't successful")),
            ),
          ),
        ),
      )

      return pipe(
        logger.info('Connecting do database'),
        Effect.flatMap(() => waitDatabaseReady),
        Effect.flatMap(() => logger.info('Connected to database')),
        Effect.map(() =>
          brand<Tag>()({
            Logger,
            discordService,
            userService,
            auth,
          }),
        ),
      )
    }),
  )
}

export { Context }

export const contextLive: Promise<Context> = Effect.runPromise(
  pipe(ServerConfig.load, Effect.flatMap(Context)),
)

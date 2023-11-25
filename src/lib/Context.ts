import { Duration, Effect, pipe } from 'effect'

import { MyLogger, type MyLoggerGetter } from './MyLogger'
import { ServerConfig } from './ServerConfig'
import { Auth } from './helpers/Auth'
import { HttpClient } from './helpers/HttpClient'
import { JwtHelper } from './helpers/JwtHelpers'
import { HealthCheckPersistence } from './persistence/HealthCheckPersistence'
import { UserPersistence } from './persistence/UserPersistence'
import type { WithCollectionGetter } from './persistence/helpers/WithCollection'
import { WithCollection } from './persistence/helpers/WithCollection'
import { WithDb } from './persistence/helpers/WithDb'
import { DiscordService } from './services/DiscordService'
import { HealthCheckService } from './services/HealthCheckService'
import { UserService } from './services/UserService'
import { StringUtils } from './utils/StringUtils'
import type { EffecT } from './utils/fp'
import { $text } from './utils/macros'

const dbRetryDelay = Duration.seconds(10)

export class Context {
  private constructor(
    public Logger: MyLoggerGetter,
    public discordService: DiscordService,
    public userService: UserService,
    public auth: Auth,
  ) {}

  static load(config: ServerConfig): EffecT<Context> {
    const Logger: MyLoggerGetter = name => new MyLogger(config.LOG_LEVEL, name)
    const logger = Logger($text!(Context))

    return pipe(
      WithDb.load({
        host: config.DB_HOST,
        username: config.DB_USERNAME,
        password: config.DB_PASSWORD,
        dbName: config.DB_NAME,
      }),
      Effect.bindTo('withDb'),
      Effect.bind('a', ({ withDb }) => {
        const withCollectionGetter: WithCollectionGetter = collName =>
          new WithCollection(withDb, collName)

        return Effect.all([UserPersistence.load(Logger, withCollectionGetter)], {
          concurrency: 'unbounded',
        })
      }),

      Effect.flatMap(({ withDb, a: [userPersistence] }): EffecT<Context> => {
        const healthCheckPersistence = new HealthCheckPersistence(withDb)

        const httpClient = new HttpClient(Logger)
        const jwtHelper = new JwtHelper(config.JWT_SECRET)

        const healthCheckService = new HealthCheckService(healthCheckPersistence)
        const userService = new UserService(Logger, userPersistence, jwtHelper)

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
          Effect.map(
            () =>
              new Context(
                Logger,
                new DiscordService(config, httpClient),
                userService,
                Auth(userService),
              ),
          ),
        )
      }),
    )
  }
}

export const contextLive: Promise<Context> = Effect.runPromise(
  pipe(ServerConfig.load, Effect.flatMap(Context.load)),
)

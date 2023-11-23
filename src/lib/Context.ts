import { Duration, Effect, pipe } from 'effect'

import { DiscordHelper } from '../app/helpers/DiscordHelper'
import { LoggerGetter } from './LoggerGetter'
import { ServerConfig } from './ServerConfig'
import { HealthCheckPersistence } from './persistence/HealthCheckPersistence'
import { WithDb } from './persistence/helpers/WithDb'
import { HealthCheckService } from './services/HealthCheckService'
import { StringUtils } from './utils/StringUtils'
import type { EffecT } from './utils/fp'
import { $$textSafe } from './utils/macros'

const dbRetryDelay = Duration.seconds(10)

export class Context {
  private constructor(public discordHelper: DiscordHelper) {}

  static load(config: ServerConfig): EffecT<Error, Context> {
    const Logger = new LoggerGetter(config.LOG_LEVEL)
    const logger = Logger.name($$textSafe!(Context))

    return pipe(
      WithDb.load({
        host: config.DB_HOST,
        username: config.DB_USERNAME,
        password: config.DB_PASSWORD,
        dbName: config.DB_NAME,
      }),
      Effect.flatMap((withDb): EffecT<Error, Context> => {
        const healthCheckPersistence = new HealthCheckPersistence(withDb)

        const healthCheckService = new HealthCheckService(healthCheckPersistence)

        const waitDatabaseReady: EffecT<Error, boolean> = pipe(
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
          Effect.map(() => new Context(new DiscordHelper(config))),
        )
      }),
    )
  }
}

export const contextLive: Promise<Context> = Effect.runPromise(
  pipe(ServerConfig.load, Effect.flatMap(Context.load)),
)

import { Effect, pipe } from 'effect'

import type { MyLogger } from '../MyLogger'
import type { EffecT } from './fp'

const orElse =
  <B>(onFailure: (e: Error) => EffecT<B>) =>
  <A>(fa: EffecT<A>): EffecT<A | B> =>
    Effect.matchEffect(fa, { onFailure, onSuccess: Effect.succeed })

export const EffecTUtils = {
  orElse,

  /**
   * Catch errors and log them (execept `DontLogError`s).
   */
  orElseWithLog:
    <B>(logger: MyLogger, onFailure: (e: Error) => EffecT<B>) =>
    <A>(fa: EffecT<A>): EffecT<A | B> =>
      pipe(
        fa,
        orElse(e =>
          pipe(
            !(e instanceof DontLogError) ? logger.error(e) : Effect.succeed(undefined),
            Effect.flatMap(() => onFailure(e)),
          ),
        ),
      ),

  prettyRetry:
    () =>
    <A>(fa: EffecT<A>): EffecT<A> => {
      const res = pipe(
        fa,
        orElse(e => {}),
      )
    },
}

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

export class DontLogError extends Error {
  constructor(error?: Error) {
    super(error?.message, { cause: error?.cause })
  }
}

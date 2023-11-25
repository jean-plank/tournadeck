import { Effect, pipe } from 'effect'

import type { MyLogger } from '../MyLogger'
import type { EffecT } from './fp'

export const EffecTUtils = {
  /**
   * Catch errors and log them (execept `DontLogError`s).
   */
  orElseWithLog:
    <B>(logger: MyLogger, onFailure: (e: Error) => EffecT<B>) =>
    <A>(fa: EffecT<A>): EffecT<A | B> =>
      pipe(
        fa,
        Effect.matchEffect({
          onFailure: e =>
            pipe(
              !(e instanceof DontLogError) ? logger.error(e) : Effect.succeed(undefined),
              Effect.flatMap(() => onFailure(e)),
            ),
          onSuccess: Effect.succeed,
        }),
      ),
}

export class DontLogError extends Error {
  constructor(error?: Error) {
    super(error?.message, { cause: error?.cause })
  }
}
